import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
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
import { SearchModule } from './search/search.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PresenceModule } from './presence/presence.module';
import { UserGroupsModule } from './user-groups/user-groups.module';
import { SavedItemsModule } from './saved-items/saved-items.module';
import { DraftsModule } from './drafts/drafts.module';
import { CallsModule } from './chat/calls.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    ScheduleModule.forRoot(),
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
    SearchModule,
    NotificationsModule,
    PresenceModule,
    UserGroupsModule,
    SavedItemsModule,
    DraftsModule,
    CallsModule,
  ],
})
export class AppModule {}
