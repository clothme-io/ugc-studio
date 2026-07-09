import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { createReadStream, existsSync } from 'fs';
import * as path from 'path';
import type { Response } from 'express';
import { StorageService } from '../../common/storage/storage.service';

@Controller('files')
export class FilesController {
  constructor(private storage: StorageService) {}

  @Get(':filename')
  serve(@Param('filename') filename: string, @Res({ passthrough: true }) res: Response) {
    const safe = path.basename(filename);
    const filePath = path.join(this.storage.uploadDir, safe);
    if (!existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }
    res.set({
      'Content-Type': 'video/mp4',
      'Content-Disposition': `attachment; filename="${safe}"`,
    });
    return new StreamableFile(createReadStream(filePath));
  }
}
