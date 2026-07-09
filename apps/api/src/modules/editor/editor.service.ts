import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { execFile } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import type { TextOverlay } from '@ugc-studio/shared';
import { StorageService } from '../../common/storage/storage.service';
import { DB } from '../../db/db.module';
import type { Database } from '../../db';
import { editProjects } from '../../db/schema';

const execFileAsync = promisify(execFile);

export interface EditState {
  trimStartSec: number;
  trimEndSec: number;
  textOverlays: TextOverlay[];
  captionStyle: 'none' | 'bottom' | 'tiktok';
}

@Injectable()
export class EditorService {
  constructor(
    @Inject(DB) private db: Database,
    private storage: StorageService,
  ) {}

  async create(input: {
    name: string;
    sourceVideoId?: string;
    remixScriptId?: string;
    editState?: Partial<EditState>;
  }) {
    const defaultState: EditState = {
      trimStartSec: 0,
      trimEndSec: 30,
      textOverlays: [],
      captionStyle: 'none',
      ...input.editState,
    };

    const [row] = await this.db
      .insert(editProjects)
      .values({
        name: input.name,
        sourceVideoId: input.sourceVideoId,
        remixScriptId: input.remixScriptId,
        editState: defaultState,
      })
      .returning();

    return row;
  }

  async update(id: string, editState: EditState) {
    const [row] = await this.db
      .update(editProjects)
      .set({ editState, updatedAt: new Date() })
      .where(eq(editProjects.id, id))
      .returning();
    if (!row) throw new NotFoundException('Edit project not found');
    return row;
  }

  async get(id: string) {
    const [row] = await this.db
      .select()
      .from(editProjects)
      .where(eq(editProjects.id, id));
    if (!row) throw new NotFoundException('Edit project not found');
    return row;
  }

  async render(id: string, sourceFilePath: string) {
    const project = await this.get(id);
    const state = project.editState as EditState;
    await fs.mkdir(this.storage.uploadDir, { recursive: true });

    const localOutput = path.join(this.storage.uploadDir, `${id}-render.mp4`);
    const duration = state.trimEndSec - state.trimStartSec;

    const args = [
      '-ss', String(state.trimStartSec),
      '-i', sourceFilePath,
      '-t', String(duration),
      '-vf', this.buildFilter(state),
      '-c:v', 'libx264',
      '-c:a', 'aac',
      '-y',
      localOutput,
    ];

    try {
      await execFileAsync('ffmpeg', args);
      const remoteKey = `renders/${id}-render.mp4`;
      const published = await this.storage.publishFile(localOutput, remoteKey);

      await this.db
        .update(editProjects)
        .set({
          outputPath: published.outputPath,
          status: 'completed',
          updatedAt: new Date(),
        })
        .where(eq(editProjects.id, id));

      return {
        outputPath: published.outputPath,
        downloadUrl: published.downloadUrl,
        storage: published.storage,
        status: 'completed' as const,
      };
    } catch (err) {
      await this.db
        .update(editProjects)
        .set({
          status: 'failed',
          updatedAt: new Date(),
        })
        .where(eq(editProjects.id, id));
      throw err;
    }
  }

  private buildFilter(state: EditState): string {
    const filters: string[] = ['scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2'];

    for (const overlay of state.textOverlays) {
      const escaped = overlay.text.replace(/'/g, "\\'").replace(/:/g, '\\:');
      filters.push(
        `drawtext=text='${escaped}':fontsize=${overlay.fontSize}:fontcolor=${overlay.color}:x=${overlay.x}:y=${overlay.y}:enable='between(t,${overlay.startSec},${overlay.endSec})'`,
      );
    }

    return filters.join(',');
  }
}
