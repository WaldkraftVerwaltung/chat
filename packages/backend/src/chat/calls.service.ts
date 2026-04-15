import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccessToken } from 'livekit-server-sdk';
import { Channel } from '../channels/channel.entity';
import { User } from '../users/user.entity';

/**
 * Video call service backed by LiveKit.
 *
 * Rooms are mapped 1:1 to chat channels OR DM conversations: the LiveKit
 * room name is `chat-{channelId}`. Any authenticated workspace member can join.
 */
@Injectable()
export class CallsService {
  private readonly logger = new Logger(CallsService.name);

  constructor(
    @InjectRepository(Channel)
    private readonly channelRepo: Repository<Channel>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  private get apiKey() {
    return process.env.LIVEKIT_API_KEY || 'devkey';
  }
  private get apiSecret() {
    return process.env.LIVEKIT_API_SECRET || 'devsecretdevsecretdevsecretdevsecret';
  }
  /** wss URL the client connects to. Exposed to the frontend as NEXT_PUBLIC_LIVEKIT_URL. */
  get publicUrl() {
    return process.env.LIVEKIT_URL || 'ws://localhost:7880';
  }

  roomName(channelId: string): string {
    return `chat-${channelId}`;
  }

  /**
   * Mint a LiveKit access token for the given user + channel (or DM).
   */
  async issueToken(channelId: string, userId: string): Promise<{
    token: string;
    url: string;
    room: string;
    identity: string;
  }> {
    // channelId may be a regular channel OR a DM conversation id — both are OK.
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const displayName = user.displayName || user.fullName || user.email || userId;
    const room = this.roomName(channelId);

    const at = new AccessToken(this.apiKey, this.apiSecret, {
      identity: userId,
      name: displayName,
      ttl: 60 * 60, // 1 hour
    });
    at.addGrant({
      roomJoin: true,
      room,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();
    return { token, url: this.publicUrl, room, identity: userId };
  }
}
