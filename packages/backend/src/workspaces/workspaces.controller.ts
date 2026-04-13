import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@Controller('workspace')
@UseGuards(JwtAuthGuard)
export class WorkspacesController {
  constructor(private workspacesService: WorkspacesService) {}

  @Get()
  async getWorkspace(@CurrentUser() user: User) {
    return this.workspacesService.findById(user.workspaceId);
  }

  @Patch()
  async updateWorkspace(@CurrentUser() user: User, @Body() body: { name?: string; settings?: Record<string, any> }) {
    return this.workspacesService.update(user.workspaceId, body);
  }
}
