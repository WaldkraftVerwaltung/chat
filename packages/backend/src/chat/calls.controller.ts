import { Controller, Post, Get, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CallsService } from './calls.service';

@Controller('calls')
export class CallsController {
  constructor(private readonly callsService: CallsService) {}

  @Post('channels/:channelId/start')
  @UseGuards(JwtAuthGuard)
  async startCall(@Param('channelId') channelId: string, @Req() req: any) {
    const userId = req.user.id;
    const token = await this.callsService.issueToken(channelId, userId);
    return {
      success: true,
      room: token.room,
      token: token.token,
      url: token.url,
      mediaType: 'video',
    };
  }

  @Get('channels/:channelId/token')
  @UseGuards(JwtAuthGuard)
  async getToken(@Param('channelId') channelId: string, @Req() req: any) {
    const userId = req.user.id;
    const token = await this.callsService.issueToken(channelId, userId);
    return token;
  }
}
