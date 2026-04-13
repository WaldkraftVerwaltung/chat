import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { DmService } from './dm.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@Controller('dms')
@UseGuards(JwtAuthGuard)
export class DmController {
  constructor(private dmService: DmService) {}

  @Post()
  create(@Body('userIds') userIds: string[], @CurrentUser() user: User) {
    return this.dmService.findOrCreate(user.workspaceId, [...new Set([user.id, ...userIds])]);
  }

  @Get()
  findAll(@CurrentUser() user: User) { return this.dmService.findByUser(user.id); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.dmService.findById(id); }
}
