import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { ChannelType } from '@chat/shared';

@Controller('channels')
@UseGuards(JwtAuthGuard)
export class ChannelsController {
  constructor(private channelsService: ChannelsService) {}

  @Post()
  create(@Body() dto: CreateChannelDto, @CurrentUser() user: User) {
    return this.channelsService.create(dto, user.id, user.workspaceId);
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.channelsService.findAll(user.workspaceId, user.id);
  }

  @Get('unread-counts')
  getUnreadCounts(@CurrentUser() user: User) {
    return this.channelsService.getUnreadCounts(user.id);
  }

  @Get('browse')
  browse(@CurrentUser() user: User, @Query('search') search?: string) {
    return this.channelsService.browse(user.workspaceId, user.id, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.channelsService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateChannelDto) {
    return this.channelsService.update(id, dto);
  }

  @Post(':id/join')
  async join(@Param('id') id: string, @CurrentUser() user: User) {
    const channel = await this.channelsService.findById(id);
    if (channel.type === ChannelType.PRIVATE) {
      throw new ForbiddenException('Private channels require an invitation');
    }
    return this.channelsService.addMember(id, user.id);
  }

  @Post(':id/leave')
  leave(@Param('id') id: string, @CurrentUser() user: User) {
    return this.channelsService.removeMember(id, user.id);
  }

  @Get(':id/members')
  getMembers(@Param('id') id: string) {
    return this.channelsService.getMembers(id);
  }

  @Post(':id/archive')
  archive(@Param('id') id: string) {
    return this.channelsService.archive(id);
  }
}
