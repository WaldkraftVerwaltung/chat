import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { ReactionsService } from './reactions.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@Controller('messages/:messageId/reactions')
@UseGuards(JwtAuthGuard)
export class ReactionsController {
  constructor(private reactionsService: ReactionsService) {}

  @Post()
  toggle(@Param('messageId') messageId: string, @Body('emojiCode') emojiCode: string, @CurrentUser() user: User) {
    return this.reactionsService.toggle(messageId, user.id, emojiCode);
  }

  @Get()
  getAll(@Param('messageId') messageId: string) {
    return this.reactionsService.getGroupedByMessage(messageId);
  }
}
