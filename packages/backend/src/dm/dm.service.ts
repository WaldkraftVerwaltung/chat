import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { DmConversation } from './dm-conversation.entity';
import { DmParticipant } from './dm-participant.entity';

@Injectable()
export class DmService {
  constructor(
    @InjectRepository(DmConversation) private readonly convRepo: Repository<DmConversation>,
    @InjectRepository(DmParticipant) private readonly partRepo: Repository<DmParticipant>,
  ) {}

  async findOrCreate(workspaceId: string, userIds: string[]): Promise<DmConversation> {
    // Deduplicate and sort for consistent comparison
    const sorted = [...new Set(userIds)].sort();
    if (sorted.length < 2 || sorted.length > 9) throw new BadRequestException('DM requires 2-9 participants');

    const existing = await this.findExisting(workspaceId, sorted);
    if (existing) return existing;

    try {
      const conv = this.convRepo.create({ workspaceId, isGroup: sorted.length > 2 });
      const saved = await this.convRepo.save(conv);
      for (const userId of sorted) {
        await this.partRepo.save(this.partRepo.create({ conversationId: saved.id, userId }));
      }
      return this.findById(saved.id);
    } catch (err) {
      // Race condition: another request may have created the conversation simultaneously
      const retryExisting = await this.findExisting(workspaceId, sorted);
      if (retryExisting) return retryExisting;
      throw err;
    }
  }

  private async findExisting(workspaceId: string, userIds: string[]): Promise<DmConversation | null> {
    const sorted = [...new Set(userIds)].sort();
    const convs = await this.convRepo.createQueryBuilder('c')
      .innerJoin('c.participants', 'p')
      .where('c.workspace_id = :workspaceId', { workspaceId })
      .groupBy('c.id')
      .having('COUNT(p.id) = :count', { count: sorted.length })
      .getMany();

    for (const conv of convs) {
      const parts = await this.partRepo.find({ where: { conversationId: conv.id } });
      const partIds = parts.map((p) => p.userId).sort();
      if (JSON.stringify(partIds) === JSON.stringify(sorted)) return this.findById(conv.id);
    }
    return null;
  }

  async findById(id: string): Promise<DmConversation> {
    const conv = await this.convRepo.findOne({ where: { id }, relations: ['participants', 'participants.user'] });
    if (!conv) throw new NotFoundException('Conversation not found');
    return conv;
  }

  async findByUser(userId: string): Promise<DmConversation[]> {
    const parts = await this.partRepo.find({ where: { userId } });
    if (parts.length === 0) return [];
    return this.convRepo.find({ where: { id: In(parts.map((p) => p.conversationId)) }, relations: ['participants', 'participants.user'] });
  }
}
