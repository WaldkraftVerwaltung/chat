import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Draft } from './draft.entity';

@Injectable()
export class DraftsService {
  constructor(
    @InjectRepository(Draft) private readonly draftRepo: Repository<Draft>,
  ) {}

  async upsert(userId: string, data: { channelId?: string; dmConversationId?: string; threadParentId?: string; content: string }): Promise<Draft> {
    // Find existing draft for this context
    let draft: Draft | null = null;
    if (data.channelId) {
      draft = await this.draftRepo.findOne({
        where: { userId, channelId: data.channelId, threadParentId: data.threadParentId || null },
      });
    } else if (data.dmConversationId) {
      draft = await this.draftRepo.findOne({
        where: { userId, dmConversationId: data.dmConversationId },
      });
    }

    if (draft) {
      draft.content = data.content;
      return this.draftRepo.save(draft);
    }

    const newDraft = this.draftRepo.create({
      userId,
      channelId: data.channelId || null,
      dmConversationId: data.dmConversationId || null,
      threadParentId: data.threadParentId || null,
      content: data.content,
    });
    return this.draftRepo.save(newDraft);
  }

  async findAll(userId: string): Promise<Draft[]> {
    return this.draftRepo.find({ where: { userId }, order: { updatedAt: 'DESC' } });
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.draftRepo.delete({ id, userId });
  }

  async deleteByChannel(userId: string, channelId: string, threadParentId?: string): Promise<void> {
    await this.draftRepo.delete({ userId, channelId, threadParentId: threadParentId || null });
  }
}
