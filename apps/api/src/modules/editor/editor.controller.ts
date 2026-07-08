import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { ApiSecretGuard } from '../../common/api-secret.guard';
import { EditorService, EditState } from './editor.service';

@Controller('editor')
@UseGuards(ApiSecretGuard)
export class EditorController {
  constructor(private editor: EditorService) {}

  @Post()
  create(
    @Body()
    body: {
      name: string;
      sourceVideoId?: string;
      remixScriptId?: string;
      editState?: Partial<EditState>;
    },
  ) {
    return this.editor.create(body);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.editor.get(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: { editState: EditState }) {
    return this.editor.update(id, body.editState);
  }

  @Post(':id/render')
  @UseInterceptors(
    FileInterceptor('video', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),
    }),
  )
  render(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const filePath = file?.path ?? path.join('./uploads', 'placeholder.mp4');
    return this.editor.render(id, filePath);
  }
}
