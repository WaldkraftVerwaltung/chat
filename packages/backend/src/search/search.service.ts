import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Meilisearch as MeiliSearch, Index } from 'meilisearch';

interface IndexedMessage {
  id: string;
  content: string;
  channelId: string | null;
  dmConversationId: string | null;
  userId: string;
  userName: string;
  channelName: string | null;
  isPinned: boolean;
  hasFile: boolean;
  hasLink: boolean;
  createdAt: number;
}

@Injectable()
export class SearchService implements OnModuleInit {
  private client: MeiliSearch;
  private messagesIndex: Index;

  constructor(private config: ConfigService) {}

  async onModuleInit() {
    try {
      this.client = new MeiliSearch({
        host: this.config.get<string>('meilisearch.url')!,
        apiKey: this.config.get<string>('meilisearch.key'),
      });

      // Get or create index
      this.messagesIndex = this.client.index('messages');
      try {
        await (this.client as any).createIndex?.('messages', { primaryKey: 'id' });
      } catch {} // Index may already exist, or method may not exist

      await this.messagesIndex.updateFilterableAttributes([
        'channelId', 'userId', 'isPinned', 'hasFile', 'hasLink', 'createdAt',
      ]);
      await this.messagesIndex.updateSortableAttributes(['createdAt']);
      await this.messagesIndex.updateSearchableAttributes(['content', 'userName', 'channelName']);

      console.log('Meilisearch initialized successfully');
    } catch (err) {
      console.error('Meilisearch initialization failed:', err);
      // Don't crash the app if Meilisearch is down
    }
  }

  async indexMessage(message: {
    id: string; content: string; channelId: string | null; dmConversationId: string | null;
    userId: string; userName: string; channelName: string | null; isPinned: boolean;
    hasFile: boolean; createdAt: Date;
  }): Promise<void> {
    if (!this.messagesIndex) return;
    const doc: IndexedMessage = {
      id: message.id,
      content: message.content,
      channelId: message.channelId,
      dmConversationId: message.dmConversationId,
      userId: message.userId,
      userName: message.userName,
      channelName: message.channelName,
      isPinned: message.isPinned,
      hasFile: message.hasFile,
      hasLink: message.content.includes('http://') || message.content.includes('https://'),
      createdAt: message.createdAt.getTime(),
    };
    await this.messagesIndex.addDocuments([doc as any]);
  }

  async deleteMessage(messageId: string): Promise<void> {
    if (!this.messagesIndex) return;
    await this.messagesIndex.deleteDocument(messageId);
  }

  async search(query: string, options: {
    channelId?: string; userId?: string; before?: Date; after?: Date;
    hasFile?: boolean; hasLink?: boolean; isPinned?: boolean;
    limit?: number; offset?: number;
  } = {}): Promise<any> {
    const filters: string[] = [];

    if (options.channelId) filters.push(`channelId = "${options.channelId}"`);
    if (options.userId) filters.push(`userId = "${options.userId}"`);
    if (options.isPinned) filters.push('isPinned = true');
    if (options.hasFile) filters.push('hasFile = true');
    if (options.hasLink) filters.push('hasLink = true');
    if (options.before) filters.push(`createdAt < ${options.before.getTime()}`);
    if (options.after) filters.push(`createdAt > ${options.after.getTime()}`);

    if (!this.messagesIndex) return { hits: [], estimatedTotalHits: 0 };
    return this.messagesIndex.search(query, {
      filter: filters.length > 0 ? filters.join(' AND ') : undefined,
      sort: ['createdAt:desc'],
      limit: options.limit || 20,
      offset: options.offset || 0,
      attributesToHighlight: ['content'],
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>',
    });
  }

  parseSearchQuery(rawQuery: string): { query: string; filters: Record<string, string> } {
    const filters: Record<string, string> = {};
    let query = rawQuery;

    const modifiers = [
      { regex: /from:@?(\S+)/gi, key: 'from' },
      { regex: /in:#?(\S+)/gi, key: 'in' },
      { regex: /before:(\S+)/gi, key: 'before' },
      { regex: /after:(\S+)/gi, key: 'after' },
      { regex: /on:(\S+)/gi, key: 'on' },
      { regex: /has:(\S+)/gi, key: 'has' },
    ];

    for (const mod of modifiers) {
      const match = mod.regex.exec(rawQuery);
      if (match) {
        filters[mod.key] = match[1];
        query = query.replace(match[0], '').trim();
      }
    }

    return { query, filters };
  }
}
