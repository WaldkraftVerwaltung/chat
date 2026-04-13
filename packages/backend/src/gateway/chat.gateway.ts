import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket, MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsAuthService } from './ws-auth.guard';
import { MessagesService } from '../messages/messages.service';

@WebSocketGateway({ cors: { origin: '*', credentials: true }, namespace: '/' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, Set<string>>();

  constructor(
    private wsAuth: WsAuthService,
    private messagesService: MessagesService,
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

  emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  emitToChannel(channelId: string, event: string, data: any) {
    this.server.to(`channel:${channelId}`).emit(event, data);
  }
}
