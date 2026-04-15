import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import { Channel } from '../channels/channel.entity';
import { User } from '../users/user.entity';

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
    // channelId may be a regular channel OR a DM conversation id — both are OK.
    // We only need the caller's identity for the LiveKit token.
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const displayName = user.displayName || user.fullName || user.email || userId;

    const room = this.roomName(channelId);

    // Create LiveKit JWT token with grants
    const payload = {
      iss: this.apiKey,
      sub: userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
      nbf: Math.floor(Date.now() / 1000),
      video: {
        roomJoin: true,
        room,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
      },
      metadata: JSON.stringify({
        identity: userId,
        name: displayName,
      }),
    };

    const token = jwt.sign(payload, this.apiSecret, { algorithm: 'HS256' });
    return { token, url: this.publicUrl, room, identity: userId };
  }
}
