import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  findAll(@CurrentUser() user: User, @Query('unread') unread?: string) {
    return this.notificationsService.findByUser(user.id, 50, unread === 'true');
  }

  @Get('count')
  getUnreadCount(@CurrentUser() user: User) {
    return this.notificationsService.getUnreadCount(user.id);
  }

  @Post('mark-read')
  markAsRead(@Body('ids') ids: string[], @CurrentUser() user: User) {
    return this.notificationsService.markAsRead(ids, user.id);
  }

  @Post('mark-all-read')
  markAllAsRead(@CurrentUser() user: User) {
    return this.notificationsService.markAllAsRead(user.id);
  }
}
