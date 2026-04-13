import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserGroup } from './user-group.entity';
import { UserGroupMember } from './user-group-member.entity';

@Injectable()
export class UserGroupsService {
  constructor(
    @InjectRepository(UserGroup) private readonly groupRepo: Repository<UserGroup>,
    @InjectRepository(UserGroupMember) private readonly memberRepo: Repository<UserGroupMember>,
  ) {}

  async create(data: { name: string; handle: string; description?: string; workspaceId: string; createdBy: string }): Promise<UserGroup> {
    const existing = await this.groupRepo.findOne({ where: { handle: data.handle } });
    if (existing) throw new ConflictException(`Group @${data.handle} already exists`);
    const group = this.groupRepo.create(data);
    return this.groupRepo.save(group);
  }

  async findAll(workspaceId: string): Promise<UserGroup[]> {
    return this.groupRepo.find({ where: { workspaceId }, relations: ['members', 'members.user'], order: { name: 'ASC' } });
  }

  async findById(id: string): Promise<UserGroup> {
    const group = await this.groupRepo.findOne({ where: { id }, relations: ['members', 'members.user'] });
    if (!group) throw new NotFoundException('Group not found');
    return group;
  }

  async findByHandle(handle: string, workspaceId: string): Promise<UserGroup | null> {
    return this.groupRepo.findOne({ where: { handle, workspaceId }, relations: ['members'] });
  }

  async update(id: string, data: Partial<UserGroup>): Promise<UserGroup> {
    const group = await this.findById(id);
    Object.assign(group, data);
    return this.groupRepo.save(group);
  }

  async delete(id: string): Promise<void> {
    await this.groupRepo.delete(id);
  }

  async addMember(groupId: string, userId: string): Promise<UserGroupMember> {
    const existing = await this.memberRepo.findOne({ where: { groupId, userId } });
    if (existing) return existing;
    return this.memberRepo.save(this.memberRepo.create({ groupId, userId }));
  }

  async removeMember(groupId: string, userId: string): Promise<void> {
    await this.memberRepo.delete({ groupId, userId });
  }

  async getMemberUserIds(groupId: string): Promise<string[]> {
    const members = await this.memberRepo.find({ where: { groupId } });
    return members.map((m) => m.userId);
  }
}
