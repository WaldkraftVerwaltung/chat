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
  create(@Body() body: { userIds: string[] }, @CurrentUser() user: User) {
    const allIds = [...new Set([user.id, ...(body.userIds || [])])];
    return this.dmService.findOrCreate(user.workspaceId, allIds);
  }

  @Get()
  findAll(@CurrentUser() user: User) { return this.dmService.findByUser(user.id); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.dmService.findById(id); }

  @Post('cleanup-duplicates')
  async cleanupDuplicates(@CurrentUser() user: User) {
    const removed = await this.dmService.removeDuplicates(user.workspaceId);
    return { removed };
  }
}
