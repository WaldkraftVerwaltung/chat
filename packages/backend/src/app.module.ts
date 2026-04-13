import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ChannelsModule } from './channels/channels.module';
import { MessagesModule } from './messages/messages.module';
import { GatewayModule } from './gateway/gateway.module';
import { DmModule } from './dm/dm.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { ReactionsModule } from './reactions/reactions.module';
import { FilesModule } from './files/files.module';
import { EmojiModule } from './emoji/emoji.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    ChannelsModule,
    MessagesModule,
    GatewayModule,
    DmModule,
    WorkspacesModule,
    ReactionsModule,
    FilesModule,
    EmojiModule,
  ],
})
export class AppModule {}
