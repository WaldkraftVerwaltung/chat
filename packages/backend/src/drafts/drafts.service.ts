import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
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
      const where: any = { userId, channelId: data.channelId };
      if (data.threadParentId) where.threadParentId = data.threadParentId;
      else where.threadParentId = IsNull();
      draft = await this.draftRepo.findOne({ where });
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
    const where: any = { userId, channelId };
    if (threadParentId) where.threadParentId = threadParentId;
    else where.threadParentId = IsNull();
    await this.draftRepo.delete(where);
  }
}
