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

    // Find conversations where ALL specified users are participants
    // and the conversation has EXACTLY that many participants (no more, no less)
    const convIds = await this.convRepo.query(`
      SELECT c.id FROM dm_conversations c
      INNER JOIN dm_participants p ON p.conversation_id = c.id
      WHERE c.workspace_id = $1
      GROUP BY c.id
      HAVING COUNT(p.id) = $2
        AND COUNT(p.id) FILTER (WHERE p.user_id = ANY($3)) = $2
    `, [workspaceId, sorted.length, sorted]);

    if (convIds.length > 0) {
      return this.findById(convIds[0].id);
    }
    return null;
  }

  async removeDuplicates(workspaceId: string): Promise<number> {
    // Find all conversations, group by participant set, keep only the oldest
    const allConvs = await this.convRepo.find({ where: { workspaceId }, relations: ['participants'], order: { createdAt: 'ASC' } });
    const seen = new Map<string, string>(); // participantKey -> first convId
    let removed = 0;

    for (const conv of allConvs) {
      const key = conv.participants.map((p) => p.userId).sort().join(',');
      if (seen.has(key)) {
        // Duplicate — delete this conversation
        await this.partRepo.delete({ conversationId: conv.id });
        await this.convRepo.delete(conv.id);
        removed++;
      } else {
        seen.set(key, conv.id);
      }
    }
    return removed;
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
