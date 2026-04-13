import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message) private readonly messageRepo: Repository<Message>,
  ) {}

  async create(dto: CreateMessageDto, channelId: string, userId: string): Promise<Message> {
    const message = this.messageRepo.create({
      content: dto.content,
      channelId,
      userId,
      threadParentId: dto.threadParentId || null,
      alsoSentToChannel: dto.alsoSentToChannel || false,
    });
    const saved = await this.messageRepo.save(message);
    return this.findById(saved.id);
  }

  async findByChannel(channelId: string, limit = 50, before?: Date): Promise<Message[]> {
    const qb = this.messageRepo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.user', 'u')
      .where('m.channel_id = :channelId', { channelId })
      .andWhere('m.thread_parent_id IS NULL')
      .andWhere('m.is_deleted = false')
      .orderBy('m.created_at', 'DESC')
      .take(limit);
    if (before) qb.andWhere('m.created_at < :before', { before });
    return (await qb.getMany()).reverse();
  }

  async findById(id: string): Promise<Message> {
    const msg = await this.messageRepo.findOne({ where: { id }, relations: ['user'] });
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
  }

  async getThreadReplies(parentId: string, limit = 50): Promise<Message[]> {
    return this.messageRepo.find({
      where: { threadParentId: parentId, isDeleted: false },
      relations: ['user'],
      order: { createdAt: 'ASC' },
      take: limit,
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
}
