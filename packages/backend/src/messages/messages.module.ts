import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { MessagesService } from './messages.service';
import { MessagesController, MessageActionsController } from './messages.controller';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [TypeOrmModule.forFeature([Message]), SearchModule],
  controllers: [MessagesController, MessageActionsController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
