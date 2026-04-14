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
      .where('(m.channel_id = :id OR m.dm_conversation_id = :id)', { id: channelOrDmId })
      .andWhere('m.thread_parent_id IS NULL')
      .andWhere('m.is_deleted = false')
      .orderBy('m.created_at', 'DESC')
      .take(limit);
    if (before) qb.andWhere('m.created_at < :before', { before });
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
    // Find all messages where the user has replied in a thread, or started a thread
    // A "thread parent" is a message that has thread replies (threadParentId IS NULL but has children)
    const threads = await this.messageRepo.query(`
      SELECT DISTINCT m.thread_parent_id as "parentId"
      FROM messages m
      WHERE m.thread_parent_id IS NOT NULL
        AND m.is_deleted = false
        AND (m.user_id = $1 OR m.thread_parent_id IN (
          SELECT id FROM messages WHERE user_id = $1 AND id IN (
            SELECT DISTINCT thread_parent_id FROM messages WHERE thread_parent_id IS NOT NULL
          )
        ))
      ORDER BY MAX(m.created_at) OVER (PARTITION BY m.thread_parent_id) DESC
      LIMIT $2
    `, [userId, limit]);

    // For each thread parent, get the parent message + reply count + last reply
    const results = [];
    for (const t of threads) {
      if (!t.parentId) continue;
      try {
        const parent = await this.findById(t.parentId);
        const replyCount = await this.messageRepo.count({ where: { threadParentId: t.parentId, isDeleted: false } });
        const lastReply = await this.messageRepo.findOne({
          where: { threadParentId: t.parentId, isDeleted: false },
          relations: ['user'],
          order: { createdAt: 'DESC' },
        });
        results.push({
          parentMessage: parent,
          replyCount,
          lastReply,
          lastReplyAt: lastReply?.createdAt,
        });
      } catch {}
    }
    return results;
  }
}
