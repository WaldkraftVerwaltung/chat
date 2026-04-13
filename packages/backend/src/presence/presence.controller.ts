import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PresenceService } from './presence.service';
import { JwtAuthGuard } from '../auth/auth.guard';

@Controller('presence')
@UseGuards(JwtAuthGuard)
export class PresenceController {
  constructor(private presenceService: PresenceService) {}

  @Get()
  async getPresence(@Query('userIds') userIds: string) {
    const ids = userIds.split(',').filter(Boolean);
    return this.presenceService.getMultiplePresence(ids);
  }
}
