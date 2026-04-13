import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/auth.guard';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get()
  async search(
    @Query('q') q: string,
    @Query('channel') channelId?: string,
    @Query('from') userId?: string,
    @Query('before') before?: string,
    @Query('after') after?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const { query, filters } = this.searchService.parseSearchQuery(q || '');

    return this.searchService.search(query, {
      channelId: channelId || (filters.in ? undefined : undefined),
      userId: userId || filters.from,
      before: before || filters.before ? new Date(before || filters.before) : undefined,
      after: after || filters.after ? new Date(after || filters.after) : undefined,
      hasFile: filters.has === 'file' || undefined,
      hasLink: filters.has === 'link' || undefined,
      isPinned: filters.has === 'pin' || undefined,
      limit: limit ? parseInt(limit) : 20,
      offset: offset ? parseInt(offset) : 0,
    });
  }
}
