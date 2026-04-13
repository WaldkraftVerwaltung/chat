import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { UserGroupsService } from './user-groups.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@Controller('user-groups')
@UseGuards(JwtAuthGuard)
export class UserGroupsController {
  constructor(private userGroupsService: UserGroupsService) {}

  @Post()
  create(@Body() body: { name: string; handle: string; description?: string }, @CurrentUser() user: User) {
    return this.userGroupsService.create({ ...body, workspaceId: user.workspaceId, createdBy: user.id });
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.userGroupsService.findAll(user.workspaceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userGroupsService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: { name?: string; description?: string }) {
    return this.userGroupsService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.userGroupsService.delete(id);
  }

  @Post(':id/members')
  addMember(@Param('id') id: string, @Body('userId') userId: string) {
    return this.userGroupsService.addMember(id, userId);
  }

  @Delete(':id/members/:userId')
  removeMember(@Param('id') id: string, @Param('userId') userId: string) {
    return this.userGroupsService.removeMember(id, userId);
  }
}
