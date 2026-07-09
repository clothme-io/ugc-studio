import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';

export type PublishResult = {
  outputPath: string;
  downloadUrl: string;
  storage: 'bunny' | 'local';
};

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  readonly uploadDir: string;
  private readonly bunnyZone?: string;
  private readonly bunnyApiKey?: string;
  private readonly bunnyRegion: string;
  private readonly bunnyCdnHost?: string;
  private readonly apiPublicUrl: string;

  constructor(private config: ConfigService) {
    this.uploadDir = path.resolve(config.get('UPLOAD_DIR') ?? './uploads');
    this.bunnyZone = config.get('BUNNY_STORAGE_ZONE');
    this.bunnyApiKey = config.get('BUNNY_STORAGE_API_KEY');
    this.bunnyRegion = config.get('BUNNY_STORAGE_REGION') ?? 'storage.bunnycdn.com';
    this.bunnyCdnHost = config.get('BUNNY_CDN_HOSTNAME');
    this.apiPublicUrl = config.get('API_PUBLIC_URL') ?? 'http://localhost:4000';
  }

  isBunnyConfigured(): boolean {
    return !!(this.bunnyZone && this.bunnyApiKey && this.bunnyCdnHost);
  }

  storageMode(): 'bunny' | 'local' {
    return this.isBunnyConfigured() ? 'bunny' : 'local';
  }

  resolveDownloadUrl(outputPath: string): string {
    if (outputPath.startsWith('http://') || outputPath.startsWith('https://')) {
      return outputPath;
    }
    if (this.isBunnyConfigured() && !path.isAbsolute(outputPath)) {
      return `https://${this.bunnyCdnHost}/${outputPath}`;
    }
    const filename = path.basename(outputPath);
    return `${this.apiPublicUrl}/files/${encodeURIComponent(filename)}`;
  }

  /** Write locally first, then optionally upload to Bunny.net CDN. */
  async publishFile(localPath: string, remoteKey: string): Promise<PublishResult> {
    await fs.access(localPath);

    if (this.isBunnyConfigured()) {
      try {
        const body = await fs.readFile(localPath);
        const uploadUrl = `https://${this.bunnyRegion}/${this.bunnyZone}/${remoteKey}`;
        const res = await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            AccessKey: this.bunnyApiKey!,
            'Content-Type': 'application/octet-stream',
          },
          body,
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Bunny upload failed (${res.status}): ${text}`);
        }
        return {
          outputPath: remoteKey,
          downloadUrl: `https://${this.bunnyCdnHost}/${remoteKey}`,
          storage: 'bunny',
        };
      } catch (err) {
        this.logger.warn(
          `Bunny upload failed for ${remoteKey}, serving from local disk`,
          err instanceof Error ? err.message : err,
        );
      }
    }

    const filename = path.basename(localPath);
    return {
      outputPath: localPath,
      downloadUrl: `${this.apiPublicUrl}/files/${encodeURIComponent(filename)}`,
      storage: 'local',
    };
  }
}
