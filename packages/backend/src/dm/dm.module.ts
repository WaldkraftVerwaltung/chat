import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DmConversation } from './dm-conversation.entity';
import { DmParticipant } from './dm-participant.entity';
import { DmService } from './dm.service';
import { DmController } from './dm.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DmConversation, DmParticipant])],
  controllers: [DmController],
  providers: [DmService],
  exports: [DmService],
})
export class DmModule {}
