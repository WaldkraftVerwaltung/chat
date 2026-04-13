import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, IsNull, Not } from 'typeorm';
import { Message } from './message.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ScheduledMessagesService {
  constructor(@InjectRepository(Message) private readonly messageRepo: Repository<Message>) {}

  async schedule(channelId: string, userId: string, content: string, scheduledAt: Date): Promise<Message> {
    const message = this.messageRepo.create({
      channelId, userId, content, scheduledAt, isDeleted: true, // hidden until sent
    });
    return this.messageRepo.save(message);
  }

  async getScheduled(userId: string): Promise<Message[]> {
    return this.messageRepo.find({
      where: { userId, scheduledAt: Not(IsNull()), isDeleted: true },
      order: { scheduledAt: 'ASC' },
    });
  }

  async cancelScheduled(messageId: string, userId: string): Promise<void> {
    await this.messageRepo.delete({ id: messageId, userId, scheduledAt: Not(IsNull()) });
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async sendDueMessages(): Promise<Message[]> {
    const due = await this.messageRepo.find({
      where: { scheduledAt: LessThanOrEqual(new Date()), isDeleted: true, scheduledAt: Not(IsNull()) },
    });
    for (const msg of due) {
      msg.isDeleted = false;
      msg.scheduledAt = null as any;
      await this.messageRepo.save(msg);
    }
    return due;
  }
}
