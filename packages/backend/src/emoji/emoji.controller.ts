import { Controller, Get, Post, Delete, Param, Res, UseGuards, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { EmojiService } from './emoji.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@Controller('emoji')
@UseGuards(JwtAuthGuard)
export class EmojiController {
  constructor(private emojiService: EmojiService) {}

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.emojiService.findAll(user.workspaceId);
  }

  @Post()
  @UseInterceptors(FileInterceptor('image', { limits: { fileSize: 256 * 1024 } }))
  create(@UploadedFile() file: Express.Multer.File, @Body('name') name: string, @CurrentUser() user: User) {
    return this.emojiService.create(file, name, user.id, user.workspaceId);
  }

  @Get(':id/image')
  async getImage(@Param('id') id: string, @Res() res: Response) {
    const url = await this.emojiService.getImageUrl(id);
    res.redirect(url);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.emojiService.delete(id);
  }
}
