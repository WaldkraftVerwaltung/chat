import { Controller, Post, Get, Delete, Param, Res, UseGuards, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 1024 * 1024 * 1024 } }))
  upload(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: User, @Query('messageId') messageId?: string) {
    return this.filesService.upload(file, user.id, messageId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.filesService.findById(id);
  }

  @Get(':id/download')
  async download(@Param('id') id: string, @Res() res: Response) {
    const url = await this.filesService.getDownloadUrl(id);
    res.redirect(url);
  }

  @Get(':id/thumbnail')
  async thumbnail(@Param('id') id: string, @Res() res: Response) {
    const url = await this.filesService.getThumbnailUrl(id);
    if (!url) return res.status(404).json({ message: 'No thumbnail' });
    res.redirect(url);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: User) {
    return this.filesService.delete(id, user.id);
  }
}
