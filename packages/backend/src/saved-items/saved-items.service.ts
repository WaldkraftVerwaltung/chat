import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavedItem } from './saved-item.entity';

@Injectable()
export class SavedItemsService {
  constructor(
    @InjectRepository(SavedItem) private readonly savedItemRepo: Repository<SavedItem>,
  ) {}

  async save(userId: string, messageId: string): Promise<SavedItem> {
    const existing = await this.savedItemRepo.findOne({ where: { userId, messageId } });
    if (existing) return existing;
    const item = this.savedItemRepo.create({ userId, messageId, status: 'in_progress' });
    return this.savedItemRepo.save(item);
  }

  async findAll(userId: string): Promise<SavedItem[]> {
    return this.savedItemRepo.find({
      where: { userId },
      relations: ['message', 'message.user'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(id: string, userId: string, status: 'in_progress' | 'completed' | 'archived'): Promise<SavedItem> {
    const item = await this.savedItemRepo.findOne({ where: { id, userId } });
    if (!item) throw new NotFoundException('Saved item not found');
    item.status = status;
    return this.savedItemRepo.save(item);
  }

  async unsave(id: string, userId: string): Promise<void> {
    await this.savedItemRepo.delete({ id, userId });
  }

  async setReminder(userId: string, messageId: string, minutes: number): Promise<SavedItem> {
    const remindAt = new Date(Date.now() + minutes * 60 * 1000);
    let item = await this.savedItemRepo.findOne({ where: { userId, messageId } });
    if (item) {
      item.remindAt = remindAt;
      return this.savedItemRepo.save(item);
    }
    item = this.savedItemRepo.create({ userId, messageId, status: 'in_progress', remindAt });
    return this.savedItemRepo.save(item);
  }
}
