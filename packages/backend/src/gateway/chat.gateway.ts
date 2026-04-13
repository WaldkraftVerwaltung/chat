import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket, MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsAuthService } from './ws-auth.guard';
import { MessagesService } from '../messages/messages.service';
import { ReactionsService } from '../reactions/reactions.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MentionDetectorService } from '../notifications/mention-detector.service';
import { ChannelsService } from '../channels/channels.service';

@WebSocketGateway({ cors: { origin: '*', credentials: true }, namespace: '/' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, Set<string>>();

  constructor(
    private wsAuth: WsAuthService,
    private messagesService: MessagesService,
    private reactionsService: ReactionsService,
    private notificationsService: NotificationsService,
    private mentionDetector: MentionDetectorService,
    private channelsService: ChannelsService,
  ) {}

  async handleConnection(socket: Socket) {
    const user = await this.wsAuth.authenticate(socket);
    if (!user) { socket.disconnect(); return; }
    socket.data.user = user;
    if (!this.userSockets.has(user.id)) this.userSockets.set(user.id, new Set());
    this.userSockets.get(user.id).add(socket.id);
    socket.join(`user:${user.id}`);
  }

  handleDisconnect(socket: Socket) {
    const user = socket.data.user;
    if (user) {
      this.userSockets.get(user.id)?.delete(socket.id);
      if (this.userSockets.get(user.id)?.size === 0) this.userSockets.delete(user.id);
    }
  }

  @SubscribeMessage('channel:join')
  handleJoinChannel(@ConnectedSocket() socket: Socket, @MessageBody() data: { channelId: string }) {
    socket.join(`channel:${data.channelId}`);
  }

  @SubscribeMessage('channel:leave')
  handleLeaveChannel(@ConnectedSocket() socket: Socket, @MessageBody() data: { channelId: string }) {
    socket.leave(`channel:${data.channelId}`);
  }

  @SubscribeMessage('message:send')
  async handleMessage(@ConnectedSocket() socket: Socket, @MessageBody() data: { channelId: string; content: string; threadParentId?: string }) {
    const user = socket.data.user;
    if (!user) return;
    const message = await this.messagesService.create(
      { content: data.content, threadParentId: data.threadParentId },
      data.channelId, user.id,
    );
    this.server.to(`channel:${data.channelId}`).emit('message:new', message);
    if (data.threadParentId) {
      this.server.to(`channel:${data.channelId}`).emit('thread:reply', { parentId: data.threadParentId, message });
    }

    // Mention detection and notification triggers
    const members = await this.channelsService.getMembers(data.channelId);
    const userMap = new Map(members.map((m) => [m.userId, m.user?.displayName || '']));
    const mentions = this.mentionDetector.detect(data.content, userMap);

    for (const mention of mentions) {
      if (mention.type === 'user' && mention.userId && mention.userId !== user.id) {
        const notif = await this.notificationsService.create({
          userId: mention.userId, type: 'mention', messageId: message.id,
          channelId: data.channelId, actorId: user.id,
          summary: `${user.displayName} hat dich in #${data.channelId} erwaehnt`,
        });
        this.server.to(`user:${mention.userId}`).emit('notification', notif);
      }
      if (mention.type === 'channel' || mention.type === 'here') {
        for (const member of members) {
          if (member.userId === user.id) continue;
          const notif = await this.notificationsService.create({
            userId: member.userId, type: 'mention', messageId: message.id,
            channelId: data.channelId, actorId: user.id,
            summary: `${user.displayName} hat @${mention.type} in einem Channel verwendet`,
          });
          this.server.to(`user:${member.userId}`).emit('notification', notif);
        }
      }
    }

    // Thread reply notification
    if (data.threadParentId) {
      const parent = await this.messagesService.findById(data.threadParentId);
      if (parent.userId !== user.id) {
        const notif = await this.notificationsService.create({
          userId: parent.userId, type: 'thread_reply', messageId: message.id,
          channelId: data.channelId, actorId: user.id,
          summary: `${user.displayName} hat auf deinen Thread geantwortet`,
        });
        this.server.to(`user:${parent.userId}`).emit('notification', notif);
      }
    }
  }

  @SubscribeMessage('reaction:toggle')
  async handleReaction(@ConnectedSocket() socket: Socket, @MessageBody() data: { messageId: string; emojiCode: string; channelId: string }) {
    const user = socket.data.user;
    if (!user) return;
    const result = await this.reactionsService.toggle(data.messageId, user.id, data.emojiCode);
    const event = result.added ? 'reaction:add' : 'reaction:remove';
    this.server.to(`channel:${data.channelId}`).emit(event, {
      messageId: data.messageId, emojiCode: data.emojiCode, userId: user.id, displayName: user.displayName,
    });
  }

  @SubscribeMessage('typing:start')
  handleTypingStart(@ConnectedSocket() socket: Socket, @MessageBody() data: { channelId: string }) {
    const user = socket.data.user;
    if (!user) return;
    socket.to(`channel:${data.channelId}`).emit('typing:start', {
      channelId: data.channelId, userId: user.id, displayName: user.displayName,
    });
  }

  @SubscribeMessage('typing:stop')
  handleTypingStop(@ConnectedSocket() socket: Socket, @MessageBody() data: { channelId: string }) {
    const user = socket.data.user;
    if (!user) return;
    socket.to(`channel:${data.channelId}`).emit('typing:stop', { channelId: data.channelId, userId: user.id });
  }

  @SubscribeMessage('mark:read')
  async handleMarkRead(@ConnectedSocket() socket: Socket, @MessageBody() data: { channelId: string }) {
    const user = socket.data.user;
    if (!user) return;
    await this.channelsService.updateLastRead(data.channelId, user.id);
    return { status: 'ok' };
  }

  emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  emitToChannel(channelId: string, event: string, data: any) {
    this.server.to(`channel:${channelId}`).emit(event, data);
  }
}
