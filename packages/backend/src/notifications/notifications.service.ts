import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationsService {
  constructor(@InjectRepository(Notification) private readonly notifRepo: Repository<Notification>) {}

  async create(data: Partial<Notification>): Promise<Notification> {
    return this.notifRepo.save(this.notifRepo.create(data));
  }

  async findByUser(userId: string, limit = 50, unreadOnly = false): Promise<Notification[]> {
    const where: any = { userId };
    if (unreadOnly) where.isRead = false;
    return this.notifRepo.find({ where, relations: ['actor', 'channel'], order: { createdAt: 'DESC' }, take: limit });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notifRepo.count({ where: { userId, isRead: false } });
  }

  async markAsRead(ids: string[], userId: string): Promise<void> {
    if (ids.length === 0) return;
    await this.notifRepo.createQueryBuilder().update().set({ isRead: true })
      .where('id IN (:...ids) AND user_id = :userId', { ids, userId }).execute();
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notifRepo.update({ userId, isRead: false }, { isRead: true });
  }
}
