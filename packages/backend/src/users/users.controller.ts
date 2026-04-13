import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from './user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user: User) {
    const { passwordHash, twoFactorSecret, ...profile } = user;
    return profile;
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.usersService.findAll(user.workspaceId);
  }
}
