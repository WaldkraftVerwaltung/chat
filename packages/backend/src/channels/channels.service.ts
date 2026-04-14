import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel } from './channel.entity';
import { ChannelMember } from './channel-member.entity';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { ChannelType, NotificationPreference } from '@chat/shared';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channel) private readonly channelRepo: Repository<Channel>,
    @InjectRepository(ChannelMember) private readonly memberRepo: Repository<ChannelMember>,
  ) {}

  async create(dto: CreateChannelDto, userId: string, workspaceId: string): Promise<Channel> {
    const existing = await this.channelRepo.findOne({ where: { name: dto.name, workspaceId } });
    if (existing) throw new ConflictException(`Channel #${dto.name} already exists`);

    const channel = this.channelRepo.create({ ...dto, workspaceId, createdBy: userId });
    const saved = await this.channelRepo.save(channel);
    await this.addMember(saved.id, userId);
    return saved;
  }

  async findAll(workspaceId: string, userId: string): Promise<Channel[]> {
    return this.channelRepo
      .createQueryBuilder('c')
      .where('c.workspace_id = :workspaceId', { workspaceId })
      .andWhere('c.is_archived = false')
      .andWhere(
        `(c.type = :public OR EXISTS (SELECT 1 FROM channel_members cm WHERE cm.channel_id = c.id AND cm.user_id = :userId))`,
        { public: ChannelType.PUBLIC, userId },
      )
      .orderBy('c.name', 'ASC')
      .getMany();
  }

  async browse(workspaceId: string, userId: string, search?: string): Promise<any[]> {
    let query = this.channelRepo
      .createQueryBuilder('c')
      .select([
        'c.id', 'c.name', 'c.type', 'c.topic', 'c.description', 'c.isDefault', 'c.createdAt',
      ])
      .addSelect('COUNT(cm.user_id)::int', 'memberCount')
      .addSelect(
        `BOOL_OR(cm.user_id = :userId)`,
        'isMember',
      )
      .leftJoin('channel_members', 'cm', 'cm.channel_id = c.id')
      .where('c.workspace_id = :workspaceId', { workspaceId })
      .andWhere('c.is_archived = false')
      .andWhere('c.type = :public', { public: ChannelType.PUBLIC })
      .setParameter('userId', userId)
      .groupBy('c.id')
      .orderBy('c.name', 'ASC');

    if (search) {
      query = query.andWhere('c.name ILIKE :search', { search: `%${search}%` });
    }

    const rows = await query.getRawMany();
    return rows.map((r) => ({
      id: r.c_id,
      name: r.c_name,
      type: r.c_type,
      topic: r.c_topic,
      description: r.c_description,
      isDefault: r.c_is_default,
      createdAt: r.c_created_at,
      memberCount: r.memberCount ?? 0,
      isMember: r.isMember ?? false,
    }));
  }

  async findById(channelId: string): Promise<Channel> {
    const channel = await this.channelRepo.findOne({ where: { id: channelId } });
    if (!channel) throw new NotFoundException('Channel not found');
    return channel;
  }

  async update(channelId: string, dto: UpdateChannelDto): Promise<Channel> {
    const channel = await this.findById(channelId);
    Object.assign(channel, dto);
    return this.channelRepo.save(channel);
  }

  async addMember(channelId: string, userId: string): Promise<ChannelMember> {
    const existing = await this.memberRepo.findOne({ where: { channelId, userId } });
    if (existing) return existing;
    return this.memberRepo.save(this.memberRepo.create({ channelId, userId }));
  }

  async removeMember(channelId: string, userId: string): Promise<void> {
    await this.memberRepo.delete({ channelId, userId });
  }

  async getMembers(channelId: string): Promise<ChannelMember[]> {
    return this.memberRepo.find({ where: { channelId }, relations: ['user'], order: { joinedAt: 'ASC' } });
  }

  async isMember(channelId: string, userId: string): Promise<boolean> {
    return (await this.memberRepo.count({ where: { channelId, userId } })) > 0;
  }

  async archive(channelId: string): Promise<Channel> {
    const channel = await this.findById(channelId);
    if (channel.isDefault) throw new ForbiddenException('Cannot archive the default channel');
    channel.isArchived = true;
    return this.channelRepo.save(channel);
  }

  async updateLastRead(channelId: string, userId: string): Promise<void> {
    await this.memberRepo.update({ channelId, userId }, { lastReadAt: new Date() });
  }

  async getUnreadCounts(userId: string): Promise<{ channelId: string; unreadCount: number }[]> {
    const results = await this.memberRepo.query(`
      SELECT cm.channel_id as "channelId",
        COUNT(m.id)::int as "unreadCount"
      FROM channel_members cm
      LEFT JOIN messages m ON m.channel_id = cm.channel_id
        AND m.is_deleted = false
        AND m.created_at > COALESCE(cm.last_read_at, '1970-01-01')
      WHERE cm.user_id = $1
      GROUP BY cm.channel_id
      HAVING COUNT(m.id) > 0
    `, [userId]);
    return results;
  }
}
