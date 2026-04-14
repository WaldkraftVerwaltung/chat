import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { FileAttachment } from '../files/file-attachment.entity';
import { MessagesService } from './messages.service';
import { ScheduledMessagesService } from './scheduled-messages.service';
import { MessagesController, MessageActionsController } from './messages.controller';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [TypeOrmModule.forFeature([Message, FileAttachment]), SearchModule],
  controllers: [MessagesController, MessageActionsController],
  providers: [MessagesService, ScheduledMessagesService],
  exports: [MessagesService, ScheduledMessagesService],
})
export class MessagesModule {}
