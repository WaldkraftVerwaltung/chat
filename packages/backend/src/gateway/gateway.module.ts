import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ChatGateway } from './chat.gateway';
import { WsAuthService } from './ws-auth.guard';
import { UsersModule } from '../users/users.module';
import { MessagesModule } from '../messages/messages.module';
import { ReactionsModule } from '../reactions/reactions.module';

@Module({
  imports: [JwtModule.register({}), UsersModule, MessagesModule, ReactionsModule],
  providers: [ChatGateway, WsAuthService],
  exports: [ChatGateway],
})
export class GatewayModule {}
