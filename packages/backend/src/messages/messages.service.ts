import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { SearchService } from '../search/search.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message) private readonly messageRepo: Repository<Message>,
    private readonly searchService: SearchService,
  ) {}

  async create(dto: CreateMessageDto, channelOrDmId: string, userId: string): Promise<Message> {
    // Check if this is a channel or DM conversation
    // Try to find as channel first; if not found, treat as DM conversation
    const isChannel = await this.messageRepo.manager.query(
      'SELECT id FROM channels WHERE id = $1 LIMIT 1', [channelOrDmId]
    );

    const message = this.messageRepo.create({
      content: dto.content,
      channelId: isChannel.length > 0 ? channelOrDmId : null,
      dmConversationId: isChannel.length === 0 ? channelOrDmId : null,
      userId,
      threadParentId: dto.threadParentId || null,
      alsoSentToChannel: dto.alsoSentToChannel || false,
    });
    const saved = await this.messageRepo.save(message);
    const result = await this.findById(saved.id);
    this.searchService.indexMessage({
      id: result.id, content: result.content, channelId: result.channelId,
      dmConversationId: result.dmConversationId, userId: result.userId,
      userName: result.user?.displayName || '', channelName: null,
      isPinned: false, hasFile: false, createdAt: result.createdAt,
    }).catch(() => {}); // Don't block message send on search index failure
    return result;
  }

  async findByChannel(channelOrDmId: string, limit = 50, before?: Date): Promise<Message[]> {
    const qb = this.messageRepo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.user', 'u')
      .leftJoinAndSelect('m.files', 'f')
      .where('(m.channelId = :id OR m.dmConversationId = :id)', { id: channelOrDmId })
      .andWhere('m.threadParentId IS NULL')
      .andWhere('m.isDeleted = false')
      .orderBy('m.createdAt', 'DESC')
      .take(limit);
    if (before) qb.andWhere('m.createdAt < :before', { before });
    return (await qb.getMany()).reverse();
  }

  async findById(id: string): Promise<Message> {
    const msg = await this.messageRepo.findOne({ where: { id }, relations: ['user', 'files'] });
    if (!msg) throw new NotFoundException('Message not found');
    return msg;
  }

  async update(id: string, dto: UpdateMessageDto, userId: string): Promise<Message> {
    const msg = await this.findById(id);
    if (msg.userId !== userId) throw new ForbiddenException('Can only edit your own messages');
    msg.content = dto.content;
    msg.isEdited = true;
    msg.editedAt = new Date();
    return this.messageRepo.save(msg);
  }

  async delete(id: string, userId: string): Promise<void> {
    const msg = await this.findById(id);
    if (msg.userId !== userId) throw new ForbiddenException('Can only delete your own messages');
    msg.isDeleted = true;
    msg.content = '';
    await this.messageRepo.save(msg);
    this.searchService.deleteMessage(id).catch(() => {});
  }

  async getThreadReplies(parentId: string, limit = 50): Promise<Message[]> {
    return this.messageRepo.find({
      where: { threadParentId: parentId, isDeleted: false },
      relations: ['user'],
      order: { createdAt: 'ASC' },
      take: limit,
    });
  }

  async getPinnedMessages(channelId: string): Promise<Message[]> {
    return this.messageRepo.find({
      where: { channelId, isPinned: true, isDeleted: false },
      relations: ['user', 'files'],
      order: { createdAt: 'DESC' },
    });
  }

  async pin(id: string): Promise<Message> {
    const msg = await this.findById(id);
    msg.isPinned = true;
    return this.messageRepo.save(msg);
  }

  async unpin(id: string): Promise<Message> {
    const msg = await this.findById(id);
    msg.isPinned = false;
    return this.messageRepo.save(msg);
  }

  async getThreadsForUser(userId: string, limit = 20): Promise<any[]> {
    // Find threads the user participated in (replied or started) with latest reply time
    const threads = await this.messageRepo.query(`
      SELECT t.thread_parent_id AS "parentId"
      FROM messages t
      WHERE t.thread_parent_id IS NOT NULL
        AND t.is_deleted = false
        AND (
          t.user_id = $1
          OR t.thread_parent_id IN (
            SELECT id FROM messages WHERE user_id = $1
          )
        )
      GROUP BY t.thread_parent_id
      ORDER BY MAX(t.created_at) DESC
      LIMIT $2
    `, [userId, limit]);

    if (threads.length === 0) return [];

    // Batch-fetch parent messages, reply counts, and last replies
    const parentIds = threads.map((t: any) => t.parentId).filter(Boolean);
    if (parentIds.length === 0) return [];

    const [parents, replyCounts, lastReplies] = await Promise.all([
      this.messageRepo.find({
        where: parentIds.map((id: string) => ({ id })),
        relations: ['user', 'files'],
      }),
      this.messageRepo.query(`
        SELECT thread_parent_id AS "parentId", COUNT(*) AS count
        FROM messages
        WHERE thread_parent_id = ANY($1) AND is_deleted = false
        GROUP BY thread_parent_id
      `, [parentIds]),
      this.messageRepo.query(`
        SELECT DISTINCT ON (m.thread_parent_id)
          m.thread_parent_id AS "parentId",
          m.content, m.created_at AS "createdAt",
          u.id AS "userId", u.display_name AS "displayName", u.avatar_url AS "avatarUrl"
        FROM messages m
        LEFT JOIN users u ON u.id = m.user_id
        WHERE m.thread_parent_id = ANY($1) AND m.is_deleted = false
        ORDER BY m.thread_parent_id, m.created_at DESC
      `, [parentIds]),
    ]);

    const parentMap = new Map(parents.map((p) => [p.id, p]));
    const countMap = new Map(replyCounts.map((r: any) => [r.parentId, parseInt(r.count, 10)]));
    const lastReplyMap = new Map<string, any>(lastReplies.map((r: any) => [r.parentId, r]));

    return threads
      .filter((t: any) => parentMap.has(t.parentId))
      .map((t: any) => {
        const parent = parentMap.get(t.parentId)!;
        const lr: any = lastReplyMap.get(t.parentId);
        return {
          parentMessage: parent,
          replyCount: countMap.get(t.parentId) || 0,
          lastReply: lr ? {
            content: lr.content,
            createdAt: lr.createdAt,
            user: lr.userId ? {
              id: lr.userId,
              displayName: lr.displayName,
              avatarUrl: lr.avatarUrl,
            } : null,
          } : null,
          lastReplyAt: lr?.createdAt || null,
        };
      });
  }
}
