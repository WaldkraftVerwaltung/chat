import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { SavedItemsService } from './saved-items.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@Controller('saved-items')
@UseGuards(JwtAuthGuard)
export class SavedItemsController {
  constructor(private savedItemsService: SavedItemsService) {}

  @Post()
  save(@Body('messageId') messageId: string, @CurrentUser() user: User) {
    return this.savedItemsService.save(user.id, messageId);
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.savedItemsService.findAll(user.id);
  }

  @Patch(':id')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'in_progress' | 'completed' | 'archived',
    @CurrentUser() user: User,
  ) {
    return this.savedItemsService.updateStatus(id, user.id, status);
  }

  @Delete(':id')
  unsave(@Param('id') id: string, @CurrentUser() user: User) {
    return this.savedItemsService.unsave(id, user.id);
  }
}
