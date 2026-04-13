import { Controller, Get, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { DraftsService } from './drafts.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@Controller('drafts')
@UseGuards(JwtAuthGuard)
export class DraftsController {
  constructor(private draftsService: DraftsService) {}

  @Put()
  upsert(
    @Body() body: { channelId?: string; dmConversationId?: string; threadParentId?: string; content: string },
    @CurrentUser() user: User,
  ) {
    return this.draftsService.upsert(user.id, body);
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.draftsService.findAll(user.id);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: User) {
    return this.draftsService.delete(id, user.id);
  }
}
