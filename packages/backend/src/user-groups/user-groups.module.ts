import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserGroup } from './user-group.entity';
import { UserGroupMember } from './user-group-member.entity';
import { UserGroupsService } from './user-groups.service';
import { UserGroupsController } from './user-groups.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserGroup, UserGroupMember])],
  controllers: [UserGroupsController],
  providers: [UserGroupsService],
  exports: [UserGroupsService],
})
export class UserGroupsModule {}
