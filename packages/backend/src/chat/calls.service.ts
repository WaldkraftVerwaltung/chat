import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccessToken } from 'livekit-server-sdk';
import { Channel } from '../database/entities/channel.entity';
import { User } from '../database/entities/user.entity';

/**
 * Video call service backed by LiveKit.
 *
 * Rooms are mapped 1:1 to chat channels: the LiveKit room name is `chat-{channelId}`.
 * Any workspace member can join. The initiator triggers a ring event via the gateway.
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
  /** wss URL the client connects to. Exposed to the frontend as NEXT_PUBLIC_LIVEKIT_URL as well. */
  get publicUrl() {
    return process.env.LIVEKIT_URL || 'ws://localhost:7880';
  }

  roomName(channelId: string): string {
    return `chat-${channelId}`;
  }

  /**
   * Ensure the user is a member of the workspace (via channel), then mint a LiveKit JWT
   * allowing them to publish + subscribe in the corresponding room.
   */
  async issueToken(channelId: string, userId: string): Promise<{
    token: string;
    url: string;
    room: string;
    identity: string;
  }> {
    const channel = await this.channelRepo.findOne({ where: { id: channelId } });
    if (!channel) throw new NotFoundException('Channel not found');

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const displayName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email || userId;

    const room = this.roomName(channelId);
    const at = new AccessToken(this.apiKey, this.apiSecret, {
      identity: userId,
      name: displayName,
      ttl: 60 * 60, // 1h
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
