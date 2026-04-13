# Sprint B: Threads-UI, Reaktionen, Dateien, Suche

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Thread-Darstellung im Frontend, Emoji-Reaktionen (Standard + Custom), Datei-Upload mit S3/MinIO und Vorschau, Volltextsuche ueber Meilisearch.

**Architecture:** Erweitert Sprint A um: Reaction-Entity + API, FileAttachment-Entity + S3-Upload, CustomEmoji-Entity + Upload, Meilisearch-Indexierung, Thread-Panel im Frontend, Emoji-Picker, Drag-and-Drop-Upload, Such-UI.

**Tech Stack:** Bestehend aus Sprint A + multer (File Upload), meilisearch (SDK), sharp (Bild-Thumbnails)

**Sprint-Scope:** Tasks 1-10

---

## Task 1: Reaction Entity & API

**Files:**
- Create: `packages/backend/src/reactions/reaction.entity.ts`
- Create: `packages/backend/src/reactions/reactions.service.ts`
- Create: `packages/backend/src/reactions/reactions.controller.ts`
- Create: `packages/backend/src/reactions/reactions.module.ts`
- Modify: `packages/backend/src/app.module.ts`
- Modify: `packages/backend/src/gateway/chat.gateway.ts`

**reaction.entity.ts:**
```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Unique } from 'typeorm';
import { Message } from '../messages/message.entity';
import { User } from '../users/user.entity';

@Entity('reactions')
@Unique(['messageId', 'userId', 'emojiCode'])
export class Reaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'message_id' })
  messageId: string;

  @ManyToOne(() => Message, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'message_id' })
  message: Message;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'emoji_code', length: 100 })
  emojiCode: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

**reactions.service.ts:**
```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reaction } from './reaction.entity';

@Injectable()
export class ReactionsService {
  constructor(@InjectRepository(Reaction) private readonly reactionRepo: Repository<Reaction>) {}

  async toggle(messageId: string, userId: string, emojiCode: string): Promise<{ added: boolean; reaction?: Reaction }> {
    const existing = await this.reactionRepo.findOne({ where: { messageId, userId, emojiCode } });
    if (existing) {
      await this.reactionRepo.remove(existing);
      return { added: false };
    }
    const reaction = await this.reactionRepo.save(this.reactionRepo.create({ messageId, userId, emojiCode }));
    return { added: true, reaction };
  }

  async getByMessage(messageId: string): Promise<Reaction[]> {
    return this.reactionRepo.find({ where: { messageId }, relations: ['user'], order: { createdAt: 'ASC' } });
  }

  async getGroupedByMessage(messageId: string): Promise<{ emoji: string; count: number; userIds: string[] }[]> {
    const reactions = await this.getByMessage(messageId);
    const grouped = new Map<string, string[]>();
    for (const r of reactions) {
      if (!grouped.has(r.emojiCode)) grouped.set(r.emojiCode, []);
      grouped.get(r.emojiCode)!.push(r.userId);
    }
    return Array.from(grouped.entries()).map(([emoji, userIds]) => ({ emoji, count: userIds.length, userIds }));
  }
}
```

**reactions.controller.ts:**
```typescript
import { Controller, Post, Delete, Get, Param, Body, UseGuards } from '@nestjs/common';
import { ReactionsService } from './reactions.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@Controller('messages/:messageId/reactions')
@UseGuards(JwtAuthGuard)
export class ReactionsController {
  constructor(private reactionsService: ReactionsService) {}

  @Post()
  toggle(@Param('messageId') messageId: string, @Body('emojiCode') emojiCode: string, @CurrentUser() user: User) {
    return this.reactionsService.toggle(messageId, user.id, emojiCode);
  }

  @Get()
  getAll(@Param('messageId') messageId: string) {
    return this.reactionsService.getGroupedByMessage(messageId);
  }
}
```

**reactions.module.ts:**
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reaction } from './reaction.entity';
import { ReactionsService } from './reactions.service';
import { ReactionsController } from './reactions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Reaction])],
  controllers: [ReactionsController],
  providers: [ReactionsService],
  exports: [ReactionsService],
})
export class ReactionsModule {}
```

Add `ReactionsModule` to `app.module.ts`.

Add WebSocket events to `chat.gateway.ts`:
```typescript
@SubscribeMessage('reaction:toggle')
async handleReaction(@ConnectedSocket() socket: Socket, @MessageBody() data: { messageId: string; emojiCode: string; channelId: string }) {
  const user = socket.data.user;
  if (!user) return;
  const result = await this.reactionsService.toggle(data.messageId, user.id, data.emojiCode);
  const event = result.added ? 'reaction:add' : 'reaction:remove';
  this.server.to(`channel:${data.channelId}`).emit(event, {
    messageId: data.messageId, emojiCode: data.emojiCode, userId: user.id, displayName: user.displayName,
  });
}
```

Inject ReactionsService in ChatGateway constructor and GatewayModule imports.

- [ ] Create all files
- [ ] Update app.module.ts and chat.gateway.ts
- [ ] Commit: `git add -A && git commit -m "feat: Reactions module with toggle, grouped API, WebSocket events"`

---

## Task 2: Reactions Frontend

**Files:**
- Create: `packages/frontend/src/components/channel/ReactionBar.tsx`
- Create: `packages/frontend/src/components/channel/EmojiPicker.tsx`
- Modify: `packages/frontend/src/components/channel/MessageItem.tsx`
- Modify: `packages/frontend/src/hooks/useSocket.ts`
- Modify: `packages/frontend/src/stores/messages.store.ts`

**Add reactions to message store** — extend the Message interface with `reactions?: { emoji: string; count: number; userIds: string[] }[]` and add `setReactions(messageId, reactions)` method.

**ReactionBar.tsx:**
```typescript
'use client';
import { useState } from 'react';
import { getSocket } from '@/lib/socket';
import { useAuthStore } from '@/stores/auth.store';

interface ReactionBarProps {
  messageId: string;
  channelId: string;
  reactions: { emoji: string; count: number; userIds: string[] }[];
}

export function ReactionBar({ messageId, channelId, reactions }: ReactionBarProps) {
  const userId = useAuthStore((s) => s.user?.id);
  const [showPicker, setShowPicker] = useState(false);

  function toggleReaction(emojiCode: string) {
    getSocket().emit('reaction:toggle', { messageId, emojiCode, channelId });
    setShowPicker(false);
  }

  return (
    <div className="flex items-center gap-1 mt-1 flex-wrap">
      {reactions.map((r) => (
        <button key={r.emoji} onClick={() => toggleReaction(r.emoji)}
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors ${
            r.userIds.includes(userId || '') ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}>
          <span>{r.emoji}</span>
          <span>{r.count}</span>
        </button>
      ))}
      <button onClick={() => setShowPicker(!showPicker)} className="rounded-full border border-dashed border-gray-300 px-2 py-0.5 text-xs text-gray-400 hover:bg-gray-50">+</button>
      {showPicker && (
        <div className="absolute z-10 mt-8 rounded-lg border bg-white p-2 shadow-lg">
          <div className="grid grid-cols-8 gap-1">
            {['👍','👎','❤️','😂','😮','😢','🎉','🔥','👀','✅','❌','💯','🚀','💪','🙏','👏'].map((emoji) => (
              <button key={emoji} onClick={() => toggleReaction(emoji)} className="rounded p-1 text-lg hover:bg-gray-100">{emoji}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

**Update MessageItem.tsx** to show ReactionBar below the message content.

**Update useSocket.ts** to listen for `reaction:add` and `reaction:remove` events and update the messages store.

- [ ] Create/modify all files
- [ ] Commit: `git add -A && git commit -m "feat: Reactions UI with emoji picker and real-time updates"`

---

## Task 3: Thread Panel Frontend

**Files:**
- Create: `packages/frontend/src/components/channel/ThreadPanel.tsx`
- Create: `packages/frontend/src/components/channel/ThreadReply.tsx`
- Create: `packages/frontend/src/stores/threads.store.ts`
- Modify: `packages/frontend/src/components/channel/MessageItem.tsx`
- Modify: `packages/frontend/src/app/(workspace)/channel/[channelId]/page.tsx`

**threads.store.ts:**
```typescript
import { create } from 'zustand';
import { apiFetch } from '@/lib/api';

interface ThreadsState {
  activeThreadId: string | null;
  replies: Record<string, any[]>;
  openThread: (messageId: string) => void;
  closeThread: () => void;
  fetchReplies: (messageId: string) => Promise<void>;
  addReply: (parentId: string, reply: any) => void;
}

export const useThreadsStore = create<ThreadsState>((set) => ({
  activeThreadId: null,
  replies: {},
  openThread: (messageId) => set({ activeThreadId: messageId }),
  closeThread: () => set({ activeThreadId: null }),
  fetchReplies: async (messageId) => {
    const replies = await apiFetch<any[]>(`/messages/${messageId}/thread`);
    set((s) => ({ replies: { ...s.replies, [messageId]: replies } }));
  },
  addReply: (parentId, reply) => set((s) => {
    const existing = s.replies[parentId] || [];
    if (existing.some((r: any) => r.id === reply.id)) return s;
    return { replies: { ...s.replies, [parentId]: [...existing, reply] } };
  }),
}));
```

**ThreadPanel.tsx** — Right sidebar panel showing the parent message and thread replies with a reply input. Includes close button.

**ThreadReply.tsx** — Similar to MessageItem but simplified for thread context.

**Update MessageItem.tsx** — Add reply count indicator and click handler to open thread panel.

**Update channel page** — Conditionally render ThreadPanel to the right of the message list.

**Update useSocket.ts** — Listen for `thread:reply` events and update threads store.

- [ ] Create/modify all files
- [ ] Commit: `git add -A && git commit -m "feat: Thread panel with replies, real-time thread updates"`

---

## Task 4: File Upload Backend (S3/MinIO)

**Files:**
- Create: `packages/backend/src/files/file-attachment.entity.ts`
- Create: `packages/backend/src/files/files.service.ts`
- Create: `packages/backend/src/files/files.controller.ts`
- Create: `packages/backend/src/files/files.module.ts`
- Create: `packages/backend/src/files/s3.service.ts`
- Modify: `packages/backend/src/app.module.ts`

Install: `cd packages/backend && npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner multer @types/multer sharp @types/sharp`

**s3.service.ts** — Wrapper around AWS S3 client for MinIO. Methods: `upload(key, buffer, contentType)`, `getSignedUrl(key)`, `delete(key)`.

**file-attachment.entity.ts:**
```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Message } from '../messages/message.entity';
import { User } from '../users/user.entity';

@Entity('file_attachments')
export class FileAttachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'message_id', nullable: true })
  messageId: string | null;

  @ManyToOne(() => Message, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'message_id' })
  message: Message;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  filename: string;

  @Column({ name: 'original_filename' })
  originalFilename: string;

  @Column({ name: 'mime_type' })
  mimeType: string;

  @Column({ name: 'size_bytes', type: 'bigint' })
  sizeBytes: number;

  @Column({ name: 'storage_key' })
  storageKey: string;

  @Column({ name: 'thumbnail_key', nullable: true })
  thumbnailKey: string | null;

  @Column({ nullable: true })
  width: number | null;

  @Column({ nullable: true })
  height: number | null;

  @Column({ nullable: true })
  description: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

**files.service.ts** — Upload file to S3, create DB record, generate thumbnail for images (using sharp), return presigned URL for download.

**files.controller.ts:**
- `POST /files/upload` — Multipart upload with `@UseInterceptors(FileInterceptor('file'))`, accepts message_id optionally
- `GET /files/:id` — File metadata
- `GET /files/:id/download` — Redirect to presigned S3 URL
- `DELETE /files/:id` — Delete from S3 + DB

- [ ] Create all files
- [ ] Commit: `git add -A && git commit -m "feat: File upload module with S3/MinIO storage and thumbnails"`

---

## Task 5: File Upload Frontend

**Files:**
- Create: `packages/frontend/src/components/channel/FileUpload.tsx`
- Create: `packages/frontend/src/components/channel/FilePreview.tsx`
- Modify: `packages/frontend/src/components/channel/MessageInput.tsx`
- Modify: `packages/frontend/src/components/channel/MessageItem.tsx`

**FileUpload.tsx** — Drag-and-drop zone + click-to-upload. Shows upload progress. Supports multiple files (max 10). Clipboard paste support.

**FilePreview.tsx** — Renders inline preview based on mime type: images (thumbnail), PDFs (icon), audio/video (player icon), code files (icon).

**Update MessageInput.tsx** — Add file attach button (+), integrate FileUpload, send files with message via REST API then send message via WebSocket.

**Update MessageItem.tsx** — Display file attachments below message content with FilePreview.

- [ ] Create/modify all files
- [ ] Commit: `git add -A && git commit -m "feat: File upload UI with drag-and-drop and inline previews"`

---

## Task 6: Custom Emoji Backend

**Files:**
- Create: `packages/backend/src/emoji/custom-emoji.entity.ts`
- Create: `packages/backend/src/emoji/emoji.service.ts`
- Create: `packages/backend/src/emoji/emoji.controller.ts`
- Create: `packages/backend/src/emoji/emoji.module.ts`
- Modify: `packages/backend/src/app.module.ts`

**custom-emoji.entity.ts:**
```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Workspace } from '../workspaces/workspace.entity';
import { User } from '../users/user.entity';

@Entity('custom_emoji')
export class CustomEmoji {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'workspace_id' })
  workspaceId: string;

  @ManyToOne(() => Workspace)
  @JoinColumn({ name: 'workspace_id' })
  workspace: Workspace;

  @Column({ length: 100 })
  name: string;

  @Column({ name: 'image_url' })
  imageUrl: string;

  @Column({ name: 'uploaded_by' })
  uploadedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaded_by' })
  uploader: User;

  @Column({ name: 'alias_for', nullable: true })
  aliasFor: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

**emoji.controller.ts:**
- `GET /emoji` — List all custom emoji for workspace
- `POST /emoji` — Upload new emoji (multipart: image file + name)
- `DELETE /emoji/:id` — Delete emoji

- [ ] Create all files
- [ ] Commit: `git add -A && git commit -m "feat: Custom emoji module with upload and management"`

---

## Task 7: Meilisearch Integration Backend

**Files:**
- Create: `packages/backend/src/search/search.service.ts`
- Create: `packages/backend/src/search/search.controller.ts`
- Create: `packages/backend/src/search/search.module.ts`
- Modify: `packages/backend/src/messages/messages.service.ts` (index on create)
- Modify: `packages/backend/src/app.module.ts`

Install: `cd packages/backend && npm install meilisearch`

**search.service.ts:**
- Initialize Meilisearch client with configured URL and key
- Create `messages` index with filterable attributes: `channelId`, `userId`, `createdAt`, `isPinned`, `hasFile`, `hasLink`
- `indexMessage(message)` — Add/update message in index
- `deleteMessage(messageId)` — Remove from index
- `search(query, filters)` — Parse search modifiers (`from:`, `in:`, `has:`, `before:`, `after:`) and convert to Meilisearch filters
- Return results with highlights

**search.controller.ts:**
- `GET /search?q=...&channel=...&from=...&before=...&after=...` — Search endpoint

**Update messages.service.ts** — Call `searchService.indexMessage()` after create, and `deleteMessage()` after delete.

- [ ] Create all files
- [ ] Commit: `git add -A && git commit -m "feat: Meilisearch integration with message indexing and search modifiers"`

---

## Task 8: Search Frontend

**Files:**
- Create: `packages/frontend/src/components/search/SearchModal.tsx`
- Create: `packages/frontend/src/components/search/SearchResults.tsx`
- Create: `packages/frontend/src/stores/search.store.ts`
- Modify: `packages/frontend/src/components/sidebar/Sidebar.tsx` (add search button)
- Modify: `packages/frontend/src/app/(workspace)/layout.tsx` (keyboard shortcut)

**search.store.ts** — `query`, `results`, `loading`, `filters`, `search()` method.

**SearchModal.tsx** — Modal with search input (Cmd+K triggers), result tabs (Messages, Files), search modifier hints, filter chips.

**SearchResults.tsx** — Renders search results with highlighted matches, channel name, user name, timestamp, click to navigate.

- [ ] Create/modify all files
- [ ] Commit: `git add -A && git commit -m "feat: Search UI with modal, results, and keyboard shortcut"`

---

## Task 9: Message Enhancements (Reactions + Files in Messages)

**Files:**
- Modify: `packages/backend/src/messages/messages.service.ts`
- Modify: `packages/backend/src/messages/messages.controller.ts`

Enhance `findByChannel` to include reactions (grouped) and file attachments in the message response. Use query builder to left join reactions and files, then group reactions in the service layer.

Update message find methods to include relations: `['user', 'files']` where `files` is a OneToMany on Message entity (add the relation to message.entity.ts).

- [ ] Modify files
- [ ] Commit: `git add -A && git commit -m "feat: Messages include reactions and file attachments in responses"`

---

## Task 10: Final Integration + Push

- [ ] Verify all modules are imported in app.module.ts
- [ ] Run `cd packages/shared && npx tsc --noEmit` to verify types
- [ ] Push: `git push origin main`
- [ ] Commit if any fixes needed

---

## Sprint B Summary

After completing all 10 tasks:

| Feature | Status |
|---------|--------|
| Emoji Reactions (toggle, grouped, real-time) | Done |
| Reaction UI (emoji picker, reaction bar) | Done |
| Thread Panel (right sidebar, replies, input) | Done |
| File Upload (S3/MinIO, thumbnails) | Done |
| File Preview (inline images, icons) | Done |
| Custom Emoji (upload, list, delete) | Done |
| Meilisearch (indexing, search modifiers) | Done |
| Search UI (modal, Cmd+K, results) | Done |
| Messages with reactions + files | Done |

**Next: Sprint C** — Benachrichtigungen, Praesenz-System, Sidebar mit Sektionen, Navigation
