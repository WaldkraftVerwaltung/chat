import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { ScheduledMessagesService } from './scheduled-messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@Controller('channels/:channelId/messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get('pins')
  getPins(@Param('channelId') channelId: string) {
    return this.messagesService.getPinnedMessages(channelId);
  }

  @Post()
  create(@Param('channelId') channelId: string, @Body() dto: CreateMessageDto, @CurrentUser() user: User) {
    return this.messagesService.create(dto, channelId, user.id);
  }

  @Get()
  findAll(@Param('channelId') channelId: string, @Query('limit') limit?: string, @Query('before') before?: string) {
    return this.messagesService.findByChannel(
      channelId, limit ? parseInt(limit, 10) : 50, before ? new Date(before) : undefined,
    );
  }
}

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessageActionsController {
  constructor(
    private messagesService: MessagesService,
    private scheduledMessagesService: ScheduledMessagesService,
  ) {}

  @Post('schedule')
  scheduleMessage(
    @Body() body: { channelId: string; content: string; scheduledAt: string },
    @CurrentUser() user: User,
  ) {
    return this.scheduledMessagesService.schedule(
      body.channelId, user.id, body.content, new Date(body.scheduledAt),
    );
  }

  @Get('scheduled')
  getScheduled(@CurrentUser() user: User) {
    return this.scheduledMessagesService.getScheduled(user.id);
  }

  @Delete('scheduled/:id')
  cancelScheduled(@Param('id') id: string, @CurrentUser() user: User) {
    return this.scheduledMessagesService.cancelScheduled(id, user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMessageDto, @CurrentUser() user: User) {
    return this.messagesService.update(id, dto, user.id);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: User) {
    return this.messagesService.delete(id, user.id);
  }

  @Get(':id/thread')
  getThread(@Param('id') id: string) {
    return this.messagesService.getThreadReplies(id);
  }

  @Post(':id/pin')
  pin(@Param('id') id: string) {
    return this.messagesService.pin(id);
  }

  @Delete(':id/pin')
  unpin(@Param('id') id: string) {
    return this.messagesService.unpin(id);
  }
}
