import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { Presence } from '@chat/shared';

@Injectable()
export class PresenceService implements OnModuleInit {
  private redis: Redis;
  private readonly PREFIX = 'presence:';
  private readonly TTL = 120;

  constructor(private config: ConfigService) {}

  onModuleInit() {
    this.redis = new Redis(this.config.get<string>('redis.url')!);
  }

  async setPresence(userId: string, presence: Presence): Promise<void> {
    await this.redis.setex(`${this.PREFIX}${userId}`, this.TTL, presence);
  }

  async getPresence(userId: string): Promise<Presence> {
    const val = await this.redis.get(`${this.PREFIX}${userId}`);
    return (val as Presence) || Presence.AWAY;
  }

  async getMultiplePresence(userIds: string[]): Promise<Record<string, Presence>> {
    if (userIds.length === 0) return {};
    const pipeline = this.redis.pipeline();
    for (const id of userIds) pipeline.get(`${this.PREFIX}${id}`);
    const results = await pipeline.exec();
    const map: Record<string, Presence> = {};
    userIds.forEach((id, i) => { map[id] = (results?.[i]?.[1] as Presence) || Presence.AWAY; });
    return map;
  }

  async heartbeat(userId: string): Promise<void> {
    await this.redis.expire(`${this.PREFIX}${userId}`, this.TTL);
  }

  async removePresence(userId: string): Promise<void> {
    await this.redis.del(`${this.PREFIX}${userId}`);
  }
}
