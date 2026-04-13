import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Socket } from 'socket.io';
import { UsersService } from '../users/users.service';

@Injectable()
export class WsAuthService {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
    private usersService: UsersService,
  ) {}

  async authenticate(socket: Socket) {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
    if (!token) return null;
    try {
      const payload = this.jwtService.verify(token, { secret: this.config.get<string>('jwt.secret') });
      const user = await this.usersService.findById(payload.sub);
      return user?.isActive ? user : null;
    } catch {
      return null;
    }
  }
}
