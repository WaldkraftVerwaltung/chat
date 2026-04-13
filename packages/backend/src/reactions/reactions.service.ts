import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reaction } from './reaction.entity';

@Injectable()
export class ReactionsService {
  constructor(@InjectRepository(Reaction) private readonly reactionRepo: Repository<Reaction>) {}

  async toggle(messageId: string, userId: string, emojiCode: string): Promise<{ added: boolean; reaction?: Reaction }> {
    const existing = await this.reactionRepo.findOne({ where: { messageId, userId, emojiCode } });
    if (existing) {
      await this.reactionRepo.remove(existing);
      return { added: false };
    }
    const reaction = await this.reactionRepo.save(this.reactionRepo.create({ messageId, userId, emojiCode }));
    return { added: true, reaction };
  }

  async getByMessage(messageId: string): Promise<Reaction[]> {
    return this.reactionRepo.find({ where: { messageId }, relations: ['user'], order: { createdAt: 'ASC' } });
  }

  async getGroupedByMessage(messageId: string): Promise<{ emoji: string; count: number; userIds: string[] }[]> {
    const reactions = await this.getByMessage(messageId);
    const grouped = new Map<string, string[]>();
    for (const r of reactions) {
      if (!grouped.has(r.emojiCode)) grouped.set(r.emojiCode, []);
      grouped.get(r.emojiCode)!.push(r.userId);
    }
    return Array.from(grouped.entries()).map(([emoji, userIds]) => ({ emoji, count: userIds.length, userIds }));
  }
}
