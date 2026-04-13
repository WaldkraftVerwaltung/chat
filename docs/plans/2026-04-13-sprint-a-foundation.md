# Sprint A: Foundation — Infrastruktur, Auth, Users, Channels, Messaging

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lauffaehige Chat-Plattform mit Monorepo-Setup, Authentifizierung, Benutzerverwaltung, Channels und Echtzeit-Messaging.

**Architecture:** NestJS-Backend mit WebSocket-Gateway, Next.js-Frontend, PostgreSQL via TypeORM, Redis fuer Pub/Sub und Praesenz-Cache. Monorepo via npm workspaces + Turborepo. Docker Compose fuer lokale Entwicklung und Produktion.

**Tech Stack:** NestJS 10+, Next.js 14+ (App Router), TypeORM, PostgreSQL 16, Redis 7, Socket.IO, MinIO (S3), Meilisearch, Docker Compose, Caddy, TypeScript 5+

**Sprint-Scope:** Tasks 1-15 (Infrastruktur → Auth → Users → Channels → Messaging → WebSocket)

**Folge-Sprints:**
- Sprint B: Threads, Reaktionen, Dateien, Suche
- Sprint C: Benachrichtigungen, Praesenz, Sidebar/Navigation
- Sprint D: Benutzergruppen, Berechtigungen, Polish

---

## File Structure

```
chat/
├── package.json                          # Root: npm workspaces + Turborepo scripts
├── turbo.json                            # Turborepo pipeline config
├── tsconfig.base.json                    # Shared TypeScript config
├── docker-compose.yml                    # Production compose
├── docker-compose.dev.yml                # Dev compose (hot-reload volumes)
├── .env.example                          # Env template
├── Caddyfile                             # Reverse proxy config
├── packages/
│   ├── shared/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts                  # Re-exports
│   │       ├── types/
│   │       │   ├── user.types.ts         # User, Role, Presence enums + DTOs
│   │       │   ├── channel.types.ts      # Channel types + DTOs
│   │       │   ├── message.types.ts      # Message types + DTOs
│   │       │   └── workspace.types.ts    # Workspace types + DTOs
│   │       ├── enums/
│   │       │   ├── role.enum.ts
│   │       │   ├── presence.enum.ts
│   │       │   └── channel-type.enum.ts
│   │       └── validation/
│   │           ├── channel.validation.ts  # Channel name rules
│   │           └── message.validation.ts  # Message length, format rules
│   ├── backend/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tsconfig.build.json
│   │   ├── nest-cli.json
│   │   ├── Dockerfile
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── config/
│   │   │   │   └── configuration.ts       # Env config with validation
│   │   │   ├── database/
│   │   │   │   ├── database.module.ts
│   │   │   │   └── migrations/            # TypeORM migrations
│   │   │   ├── auth/
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.guard.ts          # JWT guard
│   │   │   │   ├── strategies/
│   │   │   │   │   └── jwt.strategy.ts
│   │   │   │   └── dto/
│   │   │   │       ├── register.dto.ts
│   │   │   │       └── login.dto.ts
│   │   │   ├── users/
│   │   │   │   ├── users.module.ts
│   │   │   │   ├── users.controller.ts
│   │   │   │   ├── users.service.ts
│   │   │   │   ├── user.entity.ts
│   │   │   │   └── dto/
│   │   │   │       └── update-profile.dto.ts
│   │   │   ├── workspaces/
│   │   │   │   ├── workspaces.module.ts
│   │   │   │   ├── workspaces.controller.ts
│   │   │   │   ├── workspaces.service.ts
│   │   │   │   └── workspace.entity.ts
│   │   │   ├── channels/
│   │   │   │   ├── channels.module.ts
│   │   │   │   ├── channels.controller.ts
│   │   │   │   ├── channels.service.ts
│   │   │   │   ├── channel.entity.ts
│   │   │   │   ├── channel-member.entity.ts
│   │   │   │   └── dto/
│   │   │   │       ├── create-channel.dto.ts
│   │   │   │       └── update-channel.dto.ts
│   │   │   ├── messages/
│   │   │   │   ├── messages.module.ts
│   │   │   │   ├── messages.controller.ts
│   │   │   │   ├── messages.service.ts
│   │   │   │   ├── message.entity.ts
│   │   │   │   └── dto/
│   │   │   │       ├── create-message.dto.ts
│   │   │   │       └── update-message.dto.ts
│   │   │   ├── dm/
│   │   │   │   ├── dm.module.ts
│   │   │   │   ├── dm.controller.ts
│   │   │   │   ├── dm.service.ts
│   │   │   │   ├── dm-conversation.entity.ts
│   │   │   │   └── dm-participant.entity.ts
│   │   │   ├── gateway/
│   │   │   │   ├── gateway.module.ts
│   │   │   │   ├── chat.gateway.ts         # Socket.IO gateway
│   │   │   │   └── ws-auth.guard.ts        # WebSocket JWT auth
│   │   │   └── common/
│   │   │       ├── decorators/
│   │   │       │   └── current-user.decorator.ts
│   │   │       ├── filters/
│   │   │       │   └── http-exception.filter.ts
│   │   │       └── interceptors/
│   │   │           └── transform.interceptor.ts
│   │   └── test/
│   │       ├── jest-e2e.json
│   │       ├── setup.ts                    # Test DB setup/teardown
│   │       ├── auth.e2e-spec.ts
│   │       ├── channels.e2e-spec.ts
│   │       └── messages.e2e-spec.ts
│   └── frontend/
│       ├── package.json
│       ├── tsconfig.json
│       ├── next.config.ts
│       ├── Dockerfile
│       ├── tailwind.config.ts
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx              # Root layout with providers
│       │   │   ├── page.tsx                # Redirect to /login or /workspace
│       │   │   ├── login/
│       │   │   │   └── page.tsx
│       │   │   ├── register/
│       │   │   │   └── page.tsx
│       │   │   └── (workspace)/
│       │   │       ├── layout.tsx          # Sidebar + main area layout
│       │   │       ├── page.tsx            # Home/redirect to #general
│       │   │       └── channel/
│       │   │           └── [channelId]/
│       │   │               └── page.tsx    # Channel view
│       │   ├── components/
│       │   │   ├── sidebar/
│       │   │   │   ├── Sidebar.tsx
│       │   │   │   ├── ChannelList.tsx
│       │   │   │   └── DmList.tsx
│       │   │   ├── channel/
│       │   │   │   ├── ChannelHeader.tsx
│       │   │   │   ├── MessageList.tsx
│       │   │   │   ├── MessageItem.tsx
│       │   │   │   └── MessageInput.tsx
│       │   │   ├── auth/
│       │   │   │   ├── LoginForm.tsx
│       │   │   │   └── RegisterForm.tsx
│       │   │   └── ui/                     # Reusable primitives
│       │   │       ├── Button.tsx
│       │   │       ├── Input.tsx
│       │   │       ├── Avatar.tsx
│       │   │       └── Modal.tsx
│       │   ├── lib/
│       │   │   ├── api.ts                  # Axios/fetch client with JWT
│       │   │   ├── socket.ts               # Socket.IO client singleton
│       │   │   └── auth.ts                 # Token storage + refresh
│       │   ├── hooks/
│       │   │   ├── useSocket.ts
│       │   │   ├── useMessages.ts
│       │   │   └── useAuth.ts
│       │   └── stores/
│       │       ├── auth.store.ts           # Zustand: user, tokens
│       │       ├── channels.store.ts       # Zustand: channels, active channel
│       │       └── messages.store.ts       # Zustand: messages per channel
│       └── public/
│           └── favicon.ico
```

---

## Task 1: Monorepo Scaffolding

**Files:**
- Create: `package.json`, `turbo.json`, `tsconfig.base.json`, `.gitignore`, `.env.example`
- Create: `packages/shared/package.json`, `packages/shared/tsconfig.json`, `packages/shared/src/index.ts`

- [ ] **Step 1: Initialize root package.json with workspaces**

```json
{
  "name": "chat",
  "private": true,
  "workspaces": ["packages/*"],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "db:migrate": "cd packages/backend && npm run migration:run",
    "db:generate": "cd packages/backend && npm run migration:generate"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.4.0"
  }
}
```

- [ ] **Step 2: Create turbo.json**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"]
    },
    "lint": {}
  }
}
```

- [ ] **Step 3: Create tsconfig.base.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

- [ ] **Step 4: Create shared package**

`packages/shared/package.json`:
```json
{
  "name": "@chat/shared",
  "version": "0.1.0",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  }
}
```

`packages/shared/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

`packages/shared/src/index.ts`:
```typescript
export * from './enums/role.enum';
export * from './enums/presence.enum';
export * from './enums/channel-type.enum';
```

- [ ] **Step 5: Create .gitignore and .env.example**

`.gitignore`:
```
node_modules/
dist/
.next/
.env
*.log
.turbo/
coverage/
```

`.env.example`:
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=chat
DB_USER=chat
DB_PASSWORD=chat_dev_password

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=change-me-in-production
JWT_REFRESH_SECRET=change-me-in-production-refresh

# Meilisearch
MEILI_URL=http://localhost:7700
MEILI_KEY=change-me-in-production

# S3 / MinIO
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=chat-files

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: monorepo scaffolding with npm workspaces + Turborepo"
```

---

## Task 2: Shared Enums & Types

**Files:**
- Create: `packages/shared/src/enums/role.enum.ts`
- Create: `packages/shared/src/enums/presence.enum.ts`
- Create: `packages/shared/src/enums/channel-type.enum.ts`
- Create: `packages/shared/src/types/user.types.ts`
- Create: `packages/shared/src/types/channel.types.ts`
- Create: `packages/shared/src/types/message.types.ts`
- Create: `packages/shared/src/types/workspace.types.ts`
- Modify: `packages/shared/src/index.ts`

- [ ] **Step 1: Create role enum**

`packages/shared/src/enums/role.enum.ts`:
```typescript
export enum UserRole {
  PRIMARY_OWNER = 'primary_owner',
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  GUEST = 'guest',
}

export enum GuestType {
  SINGLE_CHANNEL = 'single_channel',
  MULTI_CHANNEL = 'multi_channel',
}
```

- [ ] **Step 2: Create presence enum**

`packages/shared/src/enums/presence.enum.ts`:
```typescript
export enum Presence {
  ACTIVE = 'active',
  AWAY = 'away',
  DND = 'dnd',
}
```

- [ ] **Step 3: Create channel-type enum**

`packages/shared/src/enums/channel-type.enum.ts`:
```typescript
export enum ChannelType {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

export enum PostingPermission {
  EVERYONE = 'everyone',
  ADMINS = 'admins',
  SPECIFIC = 'specific',
}

export enum NotificationPreference {
  ALL = 'all',
  MENTIONS = 'mentions',
  MUTE = 'mute',
}
```

- [ ] **Step 4: Create type definitions**

`packages/shared/src/types/user.types.ts`:
```typescript
import { UserRole, GuestType, Presence } from '../enums/role.enum';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  fullName: string | null;
  title: string | null;
  phone: string | null;
  timezone: string;
  avatarUrl: string | null;
  statusText: string | null;
  statusEmoji: string | null;
  statusExpiration: Date | null;
  presence: Presence;
  role: UserRole;
  guestType: GuestType | null;
  isActive: boolean;
  lastActiveAt: Date | null;
  createdAt: Date;
}

export interface UpdateProfileDto {
  displayName?: string;
  fullName?: string;
  title?: string;
  phone?: string;
  timezone?: string;
}

export interface UpdateStatusDto {
  statusText: string | null;
  statusEmoji: string | null;
  statusExpiration: Date | null;
}
```

`packages/shared/src/types/channel.types.ts`:
```typescript
import { ChannelType, PostingPermission, NotificationPreference } from '../enums/channel-type.enum';

export interface ChannelInfo {
  id: string;
  name: string;
  type: ChannelType;
  topic: string | null;
  description: string | null;
  createdBy: string;
  isArchived: boolean;
  isDefault: boolean;
  postingPermission: PostingPermission;
  memberCount: number;
  createdAt: Date;
}

export interface CreateChannelDto {
  name: string;
  type: ChannelType;
  description?: string;
  topic?: string;
}

export interface UpdateChannelDto {
  topic?: string;
  description?: string;
  postingPermission?: PostingPermission;
}

export interface ChannelMemberInfo {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  notificationPreference: NotificationPreference;
  joinedAt: Date;
}
```

`packages/shared/src/types/message.types.ts`:
```typescript
export interface MessageInfo {
  id: string;
  channelId: string | null;
  dmConversationId: string | null;
  threadParentId: string | null;
  userId: string;
  content: string;
  isEdited: boolean;
  editedAt: Date | null;
  isDeleted: boolean;
  isPinned: boolean;
  alsoSentToChannel: boolean;
  isSystemMessage: boolean;
  systemMessageType: string | null;
  createdAt: Date;
  // Populated
  user?: { id: string; displayName: string; avatarUrl: string | null };
  replyCount?: number;
  latestReplyAt?: Date | null;
}

export interface CreateMessageDto {
  content: string;
  threadParentId?: string;
  alsoSentToChannel?: boolean;
}

export interface UpdateMessageDto {
  content: string;
}
```

`packages/shared/src/types/workspace.types.ts`:
```typescript
export interface WorkspaceInfo {
  id: string;
  name: string;
  slug: string;
  iconUrl: string | null;
  createdAt: Date;
}
```

- [ ] **Step 5: Update index.ts to re-export all types**

`packages/shared/src/index.ts`:
```typescript
// Enums
export * from './enums/role.enum';
export * from './enums/presence.enum';
export * from './enums/channel-type.enum';

// Types
export * from './types/user.types';
export * from './types/channel.types';
export * from './types/message.types';
export * from './types/workspace.types';
```

- [ ] **Step 6: Build shared package and verify**

Run: `cd packages/shared && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: shared enums and type definitions"
```

---

## Task 3: Docker Compose Development Environment

**Files:**
- Create: `docker-compose.dev.yml`
- Create: `docker-compose.yml`

- [ ] **Step 1: Create docker-compose.dev.yml**

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    ports:
      - '5432:5432'
    environment:
      POSTGRES_DB: chat
      POSTGRES_USER: chat
      POSTGRES_PASSWORD: chat_dev_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data

  meilisearch:
    image: getmeili/meilisearch:v1.7
    ports:
      - '7700:7700'
    environment:
      MEILI_MASTER_KEY: dev-meili-key
    volumes:
      - meili_data:/meili_data

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    ports:
      - '9000:9000'
      - '9001:9001'
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data

volumes:
  postgres_data:
  redis_data:
  meili_data:
  minio_data:
```

- [ ] **Step 2: Create production docker-compose.yml**

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - redis_data:/data

  meilisearch:
    image: getmeili/meilisearch:v1.7
    restart: unless-stopped
    volumes:
      - meili_data:/meili_data
    environment:
      MEILI_MASTER_KEY: ${MEILI_KEY}

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    restart: unless-stopped
    volumes:
      - minio_data:/data
    environment:
      MINIO_ROOT_USER: ${S3_ACCESS_KEY}
      MINIO_ROOT_PASSWORD: ${S3_SECRET_KEY}

  backend:
    build:
      context: .
      dockerfile: packages/backend/Dockerfile
    restart: unless-stopped
    depends_on: [postgres, redis, meilisearch, minio]
    ports:
      - '3001:3001'
    env_file: .env

  frontend:
    build:
      context: .
      dockerfile: packages/frontend/Dockerfile
    restart: unless-stopped
    depends_on: [backend]
    ports:
      - '3000:3000'
    env_file: .env

  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
    depends_on: [frontend, backend]

volumes:
  postgres_data:
  redis_data:
  meili_data:
  minio_data:
  caddy_data:
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: Docker Compose for dev and production environments"
```

---

## Task 4: NestJS Backend Scaffolding

**Files:**
- Create: `packages/backend/package.json`, `packages/backend/tsconfig.json`, `packages/backend/tsconfig.build.json`, `packages/backend/nest-cli.json`
- Create: `packages/backend/src/main.ts`, `packages/backend/src/app.module.ts`
- Create: `packages/backend/src/config/configuration.ts`
- Create: `packages/backend/src/database/database.module.ts`
- Create: `packages/backend/Dockerfile`

- [ ] **Step 1: Create backend package.json**

```json
{
  "name": "@chat/backend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "nest start --watch",
    "build": "nest build",
    "start": "node dist/main",
    "test": "jest",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "migration:generate": "typeorm migration:generate -d dist/database/data-source.js",
    "migration:run": "typeorm migration:run -d dist/database/data-source.js"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "@nestjs/typeorm": "^10.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/platform-socket.io": "^10.0.0",
    "@nestjs/websockets": "^10.0.0",
    "@chat/shared": "*",
    "typeorm": "^0.3.0",
    "pg": "^8.12.0",
    "ioredis": "^5.3.0",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.0",
    "bcrypt": "^5.1.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.0",
    "reflect-metadata": "^0.2.0",
    "rxjs": "^7.8.0",
    "socket.io": "^4.7.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "@types/bcrypt": "^5.0.0",
    "@types/passport-jwt": "^4.0.0",
    "@types/node": "^20.0.0",
    "jest": "^29.0.0",
    "ts-jest": "^29.0.0",
    "@types/jest": "^29.0.0",
    "typescript": "^5.4.0",
    "ts-node": "^10.0.0"
  }
}
```

- [ ] **Step 2: Create tsconfig files and nest-cli.json**

`packages/backend/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "paths": {
      "@chat/shared": ["../shared/src"]
    }
  },
  "include": ["src"]
}
```

`packages/backend/tsconfig.build.json`:
```json
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "test", "dist", "**/*.spec.ts"]
}
```

`packages/backend/nest-cli.json`:
```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "tsConfigPath": "tsconfig.build.json"
  }
}
```

- [ ] **Step 3: Create configuration module**

`packages/backend/src/config/configuration.ts`:
```typescript
export default () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'chat',
    user: process.env.DB_USER || 'chat',
    password: process.env.DB_PASSWORD || 'chat_dev_password',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-jwt-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-jwt-refresh-secret',
    expiresIn: '15m',
    refreshExpiresIn: '30d',
  },
  meilisearch: {
    url: process.env.MEILI_URL || 'http://localhost:7700',
    key: process.env.MEILI_KEY || 'dev-meili-key',
  },
  s3: {
    endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
    accessKey: process.env.S3_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.S3_SECRET_KEY || 'minioadmin',
    bucket: process.env.S3_BUCKET || 'chat-files',
  },
});
```

- [ ] **Step 4: Create database module**

`packages/backend/src/database/database.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('database.host'),
        port: config.get('database.port'),
        database: config.get('database.name'),
        username: config.get('database.user'),
        password: config.get('database.password'),
        autoLoadEntities: true,
        synchronize: false,
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
      }),
    }),
  ],
})
export class DatabaseModule {}
```

- [ ] **Step 5: Create app.module.ts and main.ts**

`packages/backend/src/app.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DatabaseModule,
  ],
})
export class AppModule {}
```

`packages/backend/src/main.ts`:
```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({ origin: true, credentials: true });
  app.setGlobalPrefix('api');

  const port = config.get<number>('port');
  await app.listen(port);
  console.log(`Backend running on http://localhost:${port}`);
}
bootstrap();
```

- [ ] **Step 6: Create Dockerfile**

`packages/backend/Dockerfile`:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json turbo.json tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/backend/package.json packages/backend/
RUN npm ci
COPY packages/shared/ packages/shared/
COPY packages/backend/ packages/backend/
RUN npx turbo run build --filter=@chat/backend

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/packages/backend/dist ./dist
COPY --from=builder /app/packages/backend/node_modules ./node_modules
COPY --from=builder /app/packages/backend/package.json ./
EXPOSE 3001
CMD ["node", "dist/main.js"]
```

- [ ] **Step 7: Install dependencies and verify build**

Run: `cd /tmp/chat-init && npm install && cd packages/shared && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: NestJS backend scaffolding with config and database module"
```

---

## Task 5: Workspace & User Entities + Initial Migration

**Files:**
- Create: `packages/backend/src/workspaces/workspace.entity.ts`
- Create: `packages/backend/src/users/user.entity.ts`
- Create: `packages/backend/src/common/decorators/current-user.decorator.ts`

- [ ] **Step 1: Create Workspace entity**

`packages/backend/src/workspaces/workspace.entity.ts`:
```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('workspaces')
export class Workspace {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100, unique: true })
  slug: string;

  @Column({ name: 'icon_url', nullable: true })
  iconUrl: string | null;

  @Column({ type: 'jsonb', default: {} })
  settings: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

- [ ] **Step 2: Create User entity**

`packages/backend/src/users/user.entity.ts`:
```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserRole, GuestType, Presence } from '@chat/shared';
import { Workspace } from '../workspaces/workspace.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'workspace_id' })
  workspaceId: string;

  @ManyToOne(() => Workspace)
  @JoinColumn({ name: 'workspace_id' })
  workspace: Workspace;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ name: 'display_name', length: 80 })
  displayName: string;

  @Column({ name: 'full_name', length: 200, nullable: true })
  fullName: string | null;

  @Column({ length: 200, nullable: true })
  title: string | null;

  @Column({ length: 50, nullable: true })
  phone: string | null;

  @Column({ length: 100, default: 'Europe/Berlin' })
  timezone: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string | null;

  @Column({ name: 'status_text', length: 100, nullable: true })
  statusText: string | null;

  @Column({ name: 'status_emoji', length: 50, nullable: true })
  statusEmoji: string | null;

  @Column({ name: 'status_expiration', type: 'timestamptz', nullable: true })
  statusExpiration: Date | null;

  @Column({ type: 'enum', enum: Presence, default: Presence.AWAY })
  presence: Presence;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.MEMBER })
  role: UserRole;

  @Column({ name: 'guest_type', type: 'enum', enum: GuestType, nullable: true })
  guestType: GuestType | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'last_active_at', type: 'timestamptz', nullable: true })
  lastActiveAt: Date | null;

  @Column({ name: 'two_factor_enabled', default: false })
  twoFactorEnabled: boolean;

  @Column({ name: 'two_factor_secret', nullable: true })
  twoFactorSecret: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

- [ ] **Step 3: Create CurrentUser decorator**

`packages/backend/src/common/decorators/current-user.decorator.ts`:
```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: Workspace and User entities with TypeORM"
```

---

## Task 6: Auth Module (Register + Login + JWT)

**Files:**
- Create: `packages/backend/src/auth/auth.module.ts`
- Create: `packages/backend/src/auth/auth.controller.ts`
- Create: `packages/backend/src/auth/auth.service.ts`
- Create: `packages/backend/src/auth/auth.guard.ts`
- Create: `packages/backend/src/auth/strategies/jwt.strategy.ts`
- Create: `packages/backend/src/auth/dto/register.dto.ts`
- Create: `packages/backend/src/auth/dto/login.dto.ts`
- Create: `packages/backend/src/users/users.module.ts`
- Create: `packages/backend/src/users/users.service.ts`
- Modify: `packages/backend/src/app.module.ts`

- [ ] **Step 1: Create DTOs**

`packages/backend/src/auth/dto/register.dto.ts`:
```typescript
import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @IsString()
  @MinLength(1)
  @MaxLength(80)
  displayName: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  fullName?: string;
}
```

`packages/backend/src/auth/dto/login.dto.ts`:
```typescript
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
```

- [ ] **Step 2: Create UsersService**

`packages/backend/src/users/users.service.ts`:
```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.userRepo.create(data);
    return this.userRepo.save(user);
  }

  async findAll(workspaceId: string): Promise<User[]> {
    return this.userRepo.find({
      where: { workspaceId, isActive: true },
      order: { displayName: 'ASC' },
    });
  }
}
```

`packages/backend/src/users/users.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

- [ ] **Step 3: Create JWT strategy and guard**

`packages/backend/src/auth/strategies/jwt.strategy.ts`:
```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private config: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('jwt.secret'),
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
```

`packages/backend/src/auth/auth.guard.ts`:
```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

- [ ] **Step 4: Create AuthService**

`packages/backend/src/auth/auth.service.ts`:
```typescript
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '@chat/shared';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto, workspaceId: string) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
      displayName: dto.displayName,
      fullName: dto.fullName || null,
      workspaceId,
      role: UserRole.MEMBER,
    });

    return this.generateTokens(user.id, user.email);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user.id, user.email);
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get<string>('jwt.refreshSecret'),
      });
      return this.generateTokens(payload.sub, payload.email);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('jwt.secret'),
      expiresIn: this.config.get<string>('jwt.expiresIn'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('jwt.refreshSecret'),
      expiresIn: this.config.get<string>('jwt.refreshExpiresIn'),
    });

    return { accessToken, refreshToken };
  }
}
```

- [ ] **Step 5: Create AuthController**

`packages/backend/src/auth/auth.controller.ts`:
```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

// Hardcoded workspace ID for single-workspace MVP — will be dynamic later
const DEFAULT_WORKSPACE_ID = '00000000-0000-0000-0000-000000000001';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto, DEFAULT_WORKSPACE_ID);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }
}
```

- [ ] **Step 6: Create AuthModule**

`packages/backend/src/auth/auth.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

- [ ] **Step 7: Update AppModule to include Auth and Users**

Replace `packages/backend/src/app.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: Auth module with register, login, JWT strategy"
```

---

## Task 7: Channel Entity & Service

**Files:**
- Create: `packages/backend/src/channels/channel.entity.ts`
- Create: `packages/backend/src/channels/channel-member.entity.ts`
- Create: `packages/backend/src/channels/channels.service.ts`
- Create: `packages/backend/src/channels/channels.controller.ts`
- Create: `packages/backend/src/channels/channels.module.ts`
- Create: `packages/backend/src/channels/dto/create-channel.dto.ts`
- Create: `packages/backend/src/channels/dto/update-channel.dto.ts`
- Modify: `packages/backend/src/app.module.ts`

- [ ] **Step 1: Create Channel entity**

`packages/backend/src/channels/channel.entity.ts`:
```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ChannelType, PostingPermission } from '@chat/shared';
import { Workspace } from '../workspaces/workspace.entity';
import { ChannelMember } from './channel-member.entity';

@Entity('channels')
export class Channel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'workspace_id' })
  workspaceId: string;

  @ManyToOne(() => Workspace)
  @JoinColumn({ name: 'workspace_id' })
  workspace: Workspace;

  @Column({ length: 80 })
  name: string;

  @Column({ type: 'enum', enum: ChannelType, default: ChannelType.PUBLIC })
  type: ChannelType;

  @Column({ length: 250, nullable: true })
  topic: string | null;

  @Column({ length: 250, nullable: true })
  description: string | null;

  @Column({ name: 'created_by' })
  createdBy: string;

  @Column({ name: 'is_archived', default: false })
  isArchived: boolean;

  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  @Column({
    name: 'posting_permission',
    type: 'enum',
    enum: PostingPermission,
    default: PostingPermission.EVERYONE,
  })
  postingPermission: PostingPermission;

  @OneToMany(() => ChannelMember, (m) => m.channel)
  members: ChannelMember[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

- [ ] **Step 2: Create ChannelMember entity**

`packages/backend/src/channels/channel-member.entity.ts`:
```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { NotificationPreference } from '@chat/shared';
import { Channel } from './channel.entity';
import { User } from '../users/user.entity';

@Entity('channel_members')
@Unique(['channelId', 'userId'])
export class ChannelMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'channel_id' })
  channelId: string;

  @ManyToOne(() => Channel, (c) => c.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_id' })
  channel: Channel;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'notification_preference',
    type: 'enum',
    enum: NotificationPreference,
    default: NotificationPreference.ALL,
  })
  notificationPreference: NotificationPreference;

  @Column({ name: 'last_read_at', type: 'timestamptz', nullable: true })
  lastReadAt: Date | null;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;
}
```

- [ ] **Step 3: Create DTOs**

`packages/backend/src/channels/dto/create-channel.dto.ts`:
```typescript
import { IsString, IsEnum, IsOptional, MaxLength, MinLength, Matches } from 'class-validator';
import { ChannelType } from '@chat/shared';

export class CreateChannelDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Channel name: only lowercase letters, numbers, and hyphens',
  })
  name: string;

  @IsEnum(ChannelType)
  type: ChannelType;

  @IsString()
  @IsOptional()
  @MaxLength(250)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(250)
  topic?: string;
}
```

`packages/backend/src/channels/dto/update-channel.dto.ts`:
```typescript
import { IsString, IsEnum, IsOptional, MaxLength } from 'class-validator';
import { PostingPermission } from '@chat/shared';

export class UpdateChannelDto {
  @IsString()
  @IsOptional()
  @MaxLength(250)
  topic?: string;

  @IsString()
  @IsOptional()
  @MaxLength(250)
  description?: string;

  @IsEnum(PostingPermission)
  @IsOptional()
  postingPermission?: PostingPermission;
}
```

- [ ] **Step 4: Create ChannelsService**

`packages/backend/src/channels/channels.service.ts`:
```typescript
import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel } from './channel.entity';
import { ChannelMember } from './channel-member.entity';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { ChannelType, NotificationPreference } from '@chat/shared';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channel)
    private readonly channelRepo: Repository<Channel>,
    @InjectRepository(ChannelMember)
    private readonly memberRepo: Repository<ChannelMember>,
  ) {}

  async create(dto: CreateChannelDto, userId: string, workspaceId: string): Promise<Channel> {
    const existing = await this.channelRepo.findOne({
      where: { name: dto.name, workspaceId },
    });
    if (existing) {
      throw new ConflictException(`Channel #${dto.name} already exists`);
    }

    const channel = this.channelRepo.create({
      ...dto,
      workspaceId,
      createdBy: userId,
    });
    const saved = await this.channelRepo.save(channel);

    // Creator auto-joins
    await this.addMember(saved.id, userId);

    return saved;
  }

  async findAll(workspaceId: string, userId: string): Promise<Channel[]> {
    // Public channels + private channels where user is member
    const qb = this.channelRepo
      .createQueryBuilder('c')
      .where('c.workspace_id = :workspaceId', { workspaceId })
      .andWhere('c.is_archived = false')
      .andWhere(
        `(c.type = :public OR EXISTS (
          SELECT 1 FROM channel_members cm WHERE cm.channel_id = c.id AND cm.user_id = :userId
        ))`,
        { public: ChannelType.PUBLIC, userId },
      )
      .orderBy('c.name', 'ASC');

    return qb.getMany();
  }

  async findById(channelId: string): Promise<Channel> {
    const channel = await this.channelRepo.findOne({ where: { id: channelId } });
    if (!channel) throw new NotFoundException('Channel not found');
    return channel;
  }

  async update(channelId: string, dto: UpdateChannelDto): Promise<Channel> {
    const channel = await this.findById(channelId);
    Object.assign(channel, dto);
    return this.channelRepo.save(channel);
  }

  async addMember(channelId: string, userId: string): Promise<ChannelMember> {
    const existing = await this.memberRepo.findOne({
      where: { channelId, userId },
    });
    if (existing) return existing;

    const member = this.memberRepo.create({ channelId, userId });
    return this.memberRepo.save(member);
  }

  async removeMember(channelId: string, userId: string): Promise<void> {
    await this.memberRepo.delete({ channelId, userId });
  }

  async getMembers(channelId: string): Promise<ChannelMember[]> {
    return this.memberRepo.find({
      where: { channelId },
      relations: ['user'],
      order: { joinedAt: 'ASC' },
    });
  }

  async isMember(channelId: string, userId: string): Promise<boolean> {
    const count = await this.memberRepo.count({ where: { channelId, userId } });
    return count > 0;
  }

  async archive(channelId: string): Promise<Channel> {
    const channel = await this.findById(channelId);
    if (channel.isDefault) {
      throw new ForbiddenException('Cannot archive the default channel');
    }
    channel.isArchived = true;
    return this.channelRepo.save(channel);
  }
}
```

- [ ] **Step 5: Create ChannelsController**

`packages/backend/src/channels/channels.controller.ts`:
```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@Controller('channels')
@UseGuards(JwtAuthGuard)
export class ChannelsController {
  constructor(private channelsService: ChannelsService) {}

  @Post()
  create(@Body() dto: CreateChannelDto, @CurrentUser() user: User) {
    return this.channelsService.create(dto, user.id, user.workspaceId);
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.channelsService.findAll(user.workspaceId, user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.channelsService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateChannelDto) {
    return this.channelsService.update(id, dto);
  }

  @Post(':id/join')
  join(@Param('id') id: string, @CurrentUser() user: User) {
    return this.channelsService.addMember(id, user.id);
  }

  @Post(':id/leave')
  leave(@Param('id') id: string, @CurrentUser() user: User) {
    return this.channelsService.removeMember(id, user.id);
  }

  @Get(':id/members')
  getMembers(@Param('id') id: string) {
    return this.channelsService.getMembers(id);
  }

  @Post(':id/archive')
  archive(@Param('id') id: string) {
    return this.channelsService.archive(id);
  }
}
```

- [ ] **Step 6: Create ChannelsModule and update AppModule**

`packages/backend/src/channels/channels.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './channel.entity';
import { ChannelMember } from './channel-member.entity';
import { ChannelsService } from './channels.service';
import { ChannelsController } from './channels.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Channel, ChannelMember])],
  controllers: [ChannelsController],
  providers: [ChannelsService],
  exports: [ChannelsService],
})
export class ChannelsModule {}
```

Update `app.module.ts` imports to include `ChannelsModule`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: Channels module with CRUD, membership, archive"
```

---

## Task 8: Message Entity & Service

**Files:**
- Create: `packages/backend/src/messages/message.entity.ts`
- Create: `packages/backend/src/messages/messages.service.ts`
- Create: `packages/backend/src/messages/messages.controller.ts`
- Create: `packages/backend/src/messages/messages.module.ts`
- Create: `packages/backend/src/messages/dto/create-message.dto.ts`
- Create: `packages/backend/src/messages/dto/update-message.dto.ts`

- [ ] **Step 1: Create Message entity**

`packages/backend/src/messages/message.entity.ts`:
```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Channel } from '../channels/channel.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'channel_id', nullable: true })
  channelId: string | null;

  @ManyToOne(() => Channel, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'channel_id' })
  channel: Channel;

  @Column({ name: 'dm_conversation_id', nullable: true })
  dmConversationId: string | null;

  @Column({ name: 'thread_parent_id', nullable: true })
  threadParentId: string | null;

  @ManyToOne(() => Message, { nullable: true })
  @JoinColumn({ name: 'thread_parent_id' })
  threadParent: Message;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'is_edited', default: false })
  isEdited: boolean;

  @Column({ name: 'edited_at', type: 'timestamptz', nullable: true })
  editedAt: Date | null;

  @Column({ name: 'is_deleted', default: false })
  isDeleted: boolean;

  @Column({ name: 'is_pinned', default: false })
  isPinned: boolean;

  @Column({ name: 'also_sent_to_channel', default: false })
  alsoSentToChannel: boolean;

  @Column({ name: 'is_system_message', default: false })
  isSystemMessage: boolean;

  @Column({ name: 'system_message_type', nullable: true })
  systemMessageType: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

- [ ] **Step 2: Create DTOs**

`packages/backend/src/messages/dto/create-message.dto.ts`:
```typescript
import { IsString, IsOptional, IsBoolean, MaxLength, IsUUID } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @MaxLength(40000)
  content: string;

  @IsUUID()
  @IsOptional()
  threadParentId?: string;

  @IsBoolean()
  @IsOptional()
  alsoSentToChannel?: boolean;
}
```

`packages/backend/src/messages/dto/update-message.dto.ts`:
```typescript
import { IsString, MaxLength } from 'class-validator';

export class UpdateMessageDto {
  @IsString()
  @MaxLength(40000)
  content: string;
}
```

- [ ] **Step 3: Create MessagesService**

`packages/backend/src/messages/messages.service.ts`:
```typescript
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
  ) {}

  async create(
    dto: CreateMessageDto,
    channelId: string,
    userId: string,
  ): Promise<Message> {
    const message = this.messageRepo.create({
      content: dto.content,
      channelId,
      userId,
      threadParentId: dto.threadParentId || null,
      alsoSentToChannel: dto.alsoSentToChannel || false,
    });
    const saved = await this.messageRepo.save(message);
    return this.findById(saved.id);
  }

  async findByChannel(
    channelId: string,
    limit = 50,
    before?: Date,
  ): Promise<Message[]> {
    const qb = this.messageRepo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.user', 'u')
      .where('m.channel_id = :channelId', { channelId })
      .andWhere('m.thread_parent_id IS NULL')
      .andWhere('m.is_deleted = false')
      .orderBy('m.created_at', 'DESC')
      .take(limit);

    if (before) {
      qb.andWhere('m.created_at < :before', { before });
    }

    const messages = await qb.getMany();
    return messages.reverse(); // Oldest first
  }

  async findById(id: string): Promise<Message> {
    const msg = await this.messageRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!msg) throw new NotFoundException('Message not found');
    return msg;
  }

  async update(id: string, dto: UpdateMessageDto, userId: string): Promise<Message> {
    const msg = await this.findById(id);
    if (msg.userId !== userId) {
      throw new ForbiddenException('Can only edit your own messages');
    }
    msg.content = dto.content;
    msg.isEdited = true;
    msg.editedAt = new Date();
    return this.messageRepo.save(msg);
  }

  async delete(id: string, userId: string): Promise<void> {
    const msg = await this.findById(id);
    if (msg.userId !== userId) {
      throw new ForbiddenException('Can only delete your own messages');
    }
    msg.isDeleted = true;
    msg.content = '';
    await this.messageRepo.save(msg);
  }

  async getThreadReplies(parentId: string, limit = 50): Promise<Message[]> {
    return this.messageRepo.find({
      where: { threadParentId: parentId, isDeleted: false },
      relations: ['user'],
      order: { createdAt: 'ASC' },
      take: limit,
    });
  }

  async getReplyCount(parentId: string): Promise<number> {
    return this.messageRepo.count({
      where: { threadParentId: parentId, isDeleted: false },
    });
  }

  async pin(id: string): Promise<Message> {
    const msg = await this.findById(id);
    msg.isPinned = true;
    return this.messageRepo.save(msg);
  }

  async unpin(id: string): Promise<Message> {
    const msg = await this.findById(id);
    msg.isPinned = false;
    return this.messageRepo.save(msg);
  }
}
```

- [ ] **Step 4: Create MessagesController**

`packages/backend/src/messages/messages.controller.ts`:
```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@Controller('channels/:channelId/messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Post()
  create(
    @Param('channelId') channelId: string,
    @Body() dto: CreateMessageDto,
    @CurrentUser() user: User,
  ) {
    return this.messagesService.create(dto, channelId, user.id);
  }

  @Get()
  findAll(
    @Param('channelId') channelId: string,
    @Query('limit') limit?: string,
    @Query('before') before?: string,
  ) {
    return this.messagesService.findByChannel(
      channelId,
      limit ? parseInt(limit, 10) : 50,
      before ? new Date(before) : undefined,
    );
  }
}

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessageActionsController {
  constructor(private messagesService: MessagesService) {}

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMessageDto,
    @CurrentUser() user: User,
  ) {
    return this.messagesService.update(id, dto, user.id);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: User) {
    return this.messagesService.delete(id, user.id);
  }

  @Get(':id/thread')
  getThread(@Param('id') id: string) {
    return this.messagesService.getThreadReplies(id);
  }

  @Post(':id/pin')
  pin(@Param('id') id: string) {
    return this.messagesService.pin(id);
  }

  @Delete(':id/pin')
  unpin(@Param('id') id: string) {
    return this.messagesService.unpin(id);
  }
}
```

- [ ] **Step 5: Create MessagesModule and update AppModule**

`packages/backend/src/messages/messages.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { MessagesService } from './messages.service';
import { MessagesController, MessageActionsController } from './messages.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  controllers: [MessagesController, MessageActionsController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
```

Update `app.module.ts` imports to include `MessagesModule`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: Messages module with CRUD, threads, pinning"
```

---

## Task 9: WebSocket Gateway (Echtzeit-Messaging)

**Files:**
- Create: `packages/backend/src/gateway/chat.gateway.ts`
- Create: `packages/backend/src/gateway/ws-auth.guard.ts`
- Create: `packages/backend/src/gateway/gateway.module.ts`
- Modify: `packages/backend/src/app.module.ts`

- [ ] **Step 1: Create WebSocket auth guard**

`packages/backend/src/gateway/ws-auth.guard.ts`:
```typescript
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Socket } from 'socket.io';
import { UsersService } from '../users/users.service';

@Injectable()
export class WsAuthService {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
    private usersService: UsersService,
  ) {}

  async authenticate(socket: Socket) {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) return null;

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.config.get<string>('jwt.secret'),
      });
      const user = await this.usersService.findById(payload.sub);
      return user?.isActive ? user : null;
    } catch {
      return null;
    }
  }
}
```

- [ ] **Step 2: Create ChatGateway**

`packages/backend/src/gateway/chat.gateway.ts`:
```typescript
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsAuthService } from './ws-auth.guard';
import { MessagesService } from '../messages/messages.service';
import { ChannelsService } from '../channels/channels.service';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // userId -> Set<socketId>
  private userSockets = new Map<string, Set<string>>();

  constructor(
    private wsAuth: WsAuthService,
    private messagesService: MessagesService,
    private channelsService: ChannelsService,
  ) {}

  async handleConnection(socket: Socket) {
    const user = await this.wsAuth.authenticate(socket);
    if (!user) {
      socket.disconnect();
      return;
    }

    socket.data.user = user;

    // Track user sockets
    if (!this.userSockets.has(user.id)) {
      this.userSockets.set(user.id, new Set());
    }
    this.userSockets.get(user.id).add(socket.id);

    // Join user's channel rooms
    // (In production, fetch from DB; for now, join all channels user is member of)
    socket.join(`user:${user.id}`);
  }

  handleDisconnect(socket: Socket) {
    const user = socket.data.user;
    if (user) {
      this.userSockets.get(user.id)?.delete(socket.id);
      if (this.userSockets.get(user.id)?.size === 0) {
        this.userSockets.delete(user.id);
      }
    }
  }

  @SubscribeMessage('channel:join')
  async handleJoinChannel(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { channelId: string },
  ) {
    socket.join(`channel:${data.channelId}`);
  }

  @SubscribeMessage('channel:leave')
  async handleLeaveChannel(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { channelId: string },
  ) {
    socket.leave(`channel:${data.channelId}`);
  }

  @SubscribeMessage('message:send')
  async handleMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { channelId: string; content: string; threadParentId?: string },
  ) {
    const user = socket.data.user;
    if (!user) return;

    const message = await this.messagesService.create(
      { content: data.content, threadParentId: data.threadParentId },
      data.channelId,
      user.id,
    );

    // Broadcast to channel room
    this.server.to(`channel:${data.channelId}`).emit('message:new', message);

    // If thread reply, also emit thread event
    if (data.threadParentId) {
      this.server
        .to(`channel:${data.channelId}`)
        .emit('thread:reply', { parentId: data.threadParentId, message });
    }
  }

  @SubscribeMessage('typing:start')
  handleTypingStart(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { channelId: string },
  ) {
    const user = socket.data.user;
    if (!user) return;

    socket.to(`channel:${data.channelId}`).emit('typing:start', {
      channelId: data.channelId,
      userId: user.id,
      displayName: user.displayName,
    });
  }

  @SubscribeMessage('typing:stop')
  handleTypingStop(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { channelId: string },
  ) {
    const user = socket.data.user;
    if (!user) return;

    socket.to(`channel:${data.channelId}`).emit('typing:stop', {
      channelId: data.channelId,
      userId: user.id,
    });
  }

  @SubscribeMessage('mark:read')
  handleMarkRead(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { channelId: string },
  ) {
    // Update last_read_at — handled by REST API or here
    // For now, acknowledge
    return { status: 'ok' };
  }

  // Helper: emit to specific user across all their sockets
  emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  // Helper: emit to channel
  emitToChannel(channelId: string, event: string, data: any) {
    this.server.to(`channel:${channelId}`).emit(event, data);
  }
}
```

- [ ] **Step 3: Create GatewayModule**

`packages/backend/src/gateway/gateway.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ChatGateway } from './chat.gateway';
import { WsAuthService } from './ws-auth.guard';
import { UsersModule } from '../users/users.module';
import { MessagesModule } from '../messages/messages.module';
import { ChannelsModule } from '../channels/channels.module';

@Module({
  imports: [JwtModule.register({}), UsersModule, MessagesModule, ChannelsModule],
  providers: [ChatGateway, WsAuthService],
  exports: [ChatGateway],
})
export class GatewayModule {}
```

- [ ] **Step 4: Update AppModule**

Add `GatewayModule` to imports in `app.module.ts`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: WebSocket gateway with real-time messaging, typing indicators"
```

---

## Task 10: Next.js Frontend Scaffolding

**Files:**
- Create: `packages/frontend/package.json`, `packages/frontend/tsconfig.json`, `packages/frontend/next.config.ts`, `packages/frontend/tailwind.config.ts`
- Create: `packages/frontend/src/app/layout.tsx`, `packages/frontend/src/app/page.tsx`
- Create: `packages/frontend/src/lib/api.ts`, `packages/frontend/src/lib/socket.ts`, `packages/frontend/src/lib/auth.ts`
- Create: `packages/frontend/src/stores/auth.store.ts`
- Create: `packages/frontend/Dockerfile`

- [ ] **Step 1: Create frontend package.json**

```json
{
  "name": "@chat/frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3000",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "socket.io-client": "^4.7.0",
    "zustand": "^4.5.0",
    "@chat/shared": "*"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.0.0",
    "postcss": "^8.0.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.4.0"
  }
}
```

- [ ] **Step 2: Create config files**

`packages/frontend/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"],
      "@chat/shared": ["../shared/src"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

`packages/frontend/next.config.ts`:
```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@chat/shared'],
};

export default nextConfig;
```

`packages/frontend/tailwind.config.ts`:
```typescript
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
```

`packages/frontend/postcss.config.js`:
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 3: Create lib utilities**

`packages/frontend/src/lib/api.ts`:
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('accessToken')
    : null;

  const res = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401 && token) {
    // Try refresh
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiFetch(path, options);
    }
    // Redirect to login
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || 'API Error');
  }

  return res.json();
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return true;
  } catch {
    return false;
  }
}
```

`packages/frontend/src/lib/socket.ts`:
```typescript
import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const token = localStorage.getItem('accessToken');
    socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket'],
      autoConnect: false,
    });
  }
  return socket;
}

export function connectSocket(): void {
  const s = getSocket();
  if (!s.connected) {
    s.auth = { token: localStorage.getItem('accessToken') };
    s.connect();
  }
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
```

- [ ] **Step 4: Create auth store (Zustand)**

`packages/frontend/src/stores/auth.store.ts`:
```typescript
import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  user: { id: string; email: string; displayName: string; avatarUrl: string | null } | null;
  login: (tokens: { accessToken: string; refreshToken: string }) => void;
  logout: () => void;
  setUser: (user: AuthState['user']) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: typeof window !== 'undefined' && !!localStorage.getItem('accessToken'),
  user: null,

  login: (tokens) => {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    set({ isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ isAuthenticated: false, user: null });
  },

  setUser: (user) => set({ user }),
}));
```

- [ ] **Step 5: Create root layout and page**

`packages/frontend/src/app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

`packages/frontend/src/app/layout.tsx`:
```typescript
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Chat',
  description: 'Team messaging platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {children}
      </body>
    </html>
  );
}
```

`packages/frontend/src/app/page.tsx`:
```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';

export default function Home() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    router.replace(isAuthenticated ? '/channel/general' : '/login');
  }, [isAuthenticated, router]);

  return null;
}
```

- [ ] **Step 6: Create Dockerfile**

`packages/frontend/Dockerfile`:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json turbo.json tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/frontend/package.json packages/frontend/
RUN npm ci
COPY packages/shared/ packages/shared/
COPY packages/frontend/ packages/frontend/
RUN npx turbo run build --filter=@chat/frontend

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/packages/frontend/.next ./.next
COPY --from=builder /app/packages/frontend/public ./public
COPY --from=builder /app/packages/frontend/node_modules ./node_modules
COPY --from=builder /app/packages/frontend/package.json ./
EXPOSE 3000
CMD ["npm", "start"]
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: Next.js frontend scaffolding with Tailwind, Zustand, Socket.IO client"
```

---

## Task 11: Login & Register Pages

**Files:**
- Create: `packages/frontend/src/app/login/page.tsx`
- Create: `packages/frontend/src/app/register/page.tsx`
- Create: `packages/frontend/src/components/ui/Button.tsx`
- Create: `packages/frontend/src/components/ui/Input.tsx`

- [ ] **Step 1: Create UI primitives**

`packages/frontend/src/components/ui/Button.tsx`:
```typescript
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50';
    const variants = {
      primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
      ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500',
    };
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';
```

`packages/frontend/src/components/ui/Input.tsx`:
```typescript
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${className}`}
          {...props}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';
```

- [ ] **Step 2: Create Login page**

`packages/frontend/src/app/login/page.tsx`:
```typescript
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/stores/auth.store';
import { apiFetch } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const tokens = await apiFetch<{ accessToken: string; refreshToken: string }>(
        '/auth/login',
        { method: 'POST', body: JSON.stringify({ email, password }) },
      );
      login(tokens);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Login fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm space-y-6 rounded-lg bg-white p-8 shadow">
        <h1 className="text-2xl font-bold text-center">Anmelden</h1>
        {error && (
          <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="E-Mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Passwort"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Wird angemeldet...' : 'Anmelden'}
          </Button>
        </form>
        <p className="text-center text-sm text-gray-600">
          Noch kein Konto?{' '}
          <Link href="/register" className="text-indigo-600 hover:underline">
            Registrieren
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create Register page**

`packages/frontend/src/app/register/page.tsx`:
```typescript
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/stores/auth.store';
import { apiFetch } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const tokens = await apiFetch<{ accessToken: string; refreshToken: string }>(
        '/auth/register',
        { method: 'POST', body: JSON.stringify({ email, password, displayName }) },
      );
      login(tokens);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Registrierung fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm space-y-6 rounded-lg bg-white p-8 shadow">
        <h1 className="text-2xl font-bold text-center">Registrieren</h1>
        {error && (
          <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Anzeigename"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
          <Input
            label="E-Mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Passwort"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Wird registriert...' : 'Registrieren'}
          </Button>
        </form>
        <p className="text-center text-sm text-gray-600">
          Bereits ein Konto?{' '}
          <Link href="/login" className="text-indigo-600 hover:underline">
            Anmelden
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: Login and Register pages with form validation"
```

---

## Task 12: Workspace Layout (Sidebar + Main Area)

**Files:**
- Create: `packages/frontend/src/app/(workspace)/layout.tsx`
- Create: `packages/frontend/src/components/sidebar/Sidebar.tsx`
- Create: `packages/frontend/src/components/sidebar/ChannelList.tsx`
- Create: `packages/frontend/src/stores/channels.store.ts`

- [ ] **Step 1: Create channels store**

`packages/frontend/src/stores/channels.store.ts`:
```typescript
import { create } from 'zustand';
import { apiFetch } from '@/lib/api';

interface Channel {
  id: string;
  name: string;
  type: 'public' | 'private';
  topic: string | null;
  description: string | null;
  isArchived: boolean;
  isDefault: boolean;
}

interface ChannelsState {
  channels: Channel[];
  activeChannelId: string | null;
  loading: boolean;
  fetchChannels: () => Promise<void>;
  setActiveChannel: (id: string) => void;
}

export const useChannelsStore = create<ChannelsState>((set) => ({
  channels: [],
  activeChannelId: null,
  loading: false,

  fetchChannels: async () => {
    set({ loading: true });
    try {
      const channels = await apiFetch<Channel[]>('/channels');
      set({ channels, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  setActiveChannel: (id) => set({ activeChannelId: id }),
}));
```

- [ ] **Step 2: Create ChannelList component**

`packages/frontend/src/components/sidebar/ChannelList.tsx`:
```typescript
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useChannelsStore } from '@/stores/channels.store';

export function ChannelList() {
  const { channels, activeChannelId, fetchChannels } = useChannelsStore();

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between px-3 py-1">
        <span className="text-xs font-semibold uppercase text-gray-500">Channels</span>
      </div>
      {channels.map((ch) => (
        <Link
          key={ch.id}
          href={`/channel/${ch.id}`}
          className={`flex items-center gap-2 rounded px-3 py-1 text-sm hover:bg-gray-100 ${
            activeChannelId === ch.id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700'
          }`}
        >
          <span className="text-gray-400">{ch.type === 'public' ? '#' : '🔒'}</span>
          <span className="truncate">{ch.name}</span>
        </Link>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create Sidebar component**

`packages/frontend/src/components/sidebar/Sidebar.tsx`:
```typescript
'use client';

import { ChannelList } from './ChannelList';
import { useAuthStore } from '@/stores/auth.store';

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-gray-50">
      {/* Workspace header */}
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <div className="h-8 w-8 rounded bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
          C
        </div>
        <span className="font-semibold text-gray-900">Chat</span>
      </div>

      {/* Channel list */}
      <nav className="flex-1 overflow-y-auto py-2">
        <ChannelList />
      </nav>

      {/* User footer */}
      <div className="border-t px-4 py-3 flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold">
          {user?.displayName?.[0]?.toUpperCase() || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{user?.displayName}</p>
        </div>
        <button
          onClick={logout}
          className="text-xs text-gray-500 hover:text-gray-700"
          title="Abmelden"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 4: Create workspace layout**

`packages/frontend/src/app/(workspace)/layout.tsx`:
```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { useAuthStore } from '@/stores/auth.store';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import { apiFetch } from '@/lib/api';

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, setUser } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    // Fetch current user
    apiFetch<any>('/users/me')
      .then((user) => setUser(user))
      .catch(() => router.replace('/login'));

    // Connect WebSocket
    connectSocket();

    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, router, setUser]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: Workspace layout with sidebar and channel list"
```

---

## Task 13: Channel View (Message List + Input)

**Files:**
- Create: `packages/frontend/src/app/(workspace)/channel/[channelId]/page.tsx`
- Create: `packages/frontend/src/components/channel/ChannelHeader.tsx`
- Create: `packages/frontend/src/components/channel/MessageList.tsx`
- Create: `packages/frontend/src/components/channel/MessageItem.tsx`
- Create: `packages/frontend/src/components/channel/MessageInput.tsx`
- Create: `packages/frontend/src/stores/messages.store.ts`
- Create: `packages/frontend/src/hooks/useSocket.ts`

- [ ] **Step 1: Create messages store**

`packages/frontend/src/stores/messages.store.ts`:
```typescript
import { create } from 'zustand';
import { apiFetch } from '@/lib/api';

interface Message {
  id: string;
  channelId: string;
  userId: string;
  content: string;
  isEdited: boolean;
  isDeleted: boolean;
  isPinned: boolean;
  threadParentId: string | null;
  createdAt: string;
  user?: { id: string; displayName: string; avatarUrl: string | null };
}

interface MessagesState {
  messagesByChannel: Record<string, Message[]>;
  loading: boolean;
  fetchMessages: (channelId: string) => Promise<void>;
  addMessage: (channelId: string, message: Message) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  removeMessage: (channelId: string, messageId: string) => void;
}

export const useMessagesStore = create<MessagesState>((set, get) => ({
  messagesByChannel: {},
  loading: false,

  fetchMessages: async (channelId) => {
    set({ loading: true });
    try {
      const messages = await apiFetch<Message[]>(`/channels/${channelId}/messages`);
      set((state) => ({
        messagesByChannel: { ...state.messagesByChannel, [channelId]: messages },
        loading: false,
      }));
    } catch {
      set({ loading: false });
    }
  },

  addMessage: (channelId, message) => {
    set((state) => {
      const existing = state.messagesByChannel[channelId] || [];
      // Avoid duplicates
      if (existing.some((m) => m.id === message.id)) return state;
      return {
        messagesByChannel: {
          ...state.messagesByChannel,
          [channelId]: [...existing, message],
        },
      };
    });
  },

  updateMessage: (messageId, updates) => {
    set((state) => {
      const newMap = { ...state.messagesByChannel };
      for (const channelId of Object.keys(newMap)) {
        newMap[channelId] = newMap[channelId].map((m) =>
          m.id === messageId ? { ...m, ...updates } : m,
        );
      }
      return { messagesByChannel: newMap };
    });
  },

  removeMessage: (channelId, messageId) => {
    set((state) => ({
      messagesByChannel: {
        ...state.messagesByChannel,
        [channelId]: (state.messagesByChannel[channelId] || []).map((m) =>
          m.id === messageId ? { ...m, isDeleted: true, content: '' } : m,
        ),
      },
    }));
  },
}));
```

- [ ] **Step 2: Create useSocket hook**

`packages/frontend/src/hooks/useSocket.ts`:
```typescript
'use client';

import { useEffect } from 'react';
import { getSocket } from '@/lib/socket';
import { useMessagesStore } from '@/stores/messages.store';

export function useChannelSocket(channelId: string) {
  const addMessage = useMessagesStore((s) => s.addMessage);

  useEffect(() => {
    const socket = getSocket();

    socket.emit('channel:join', { channelId });

    const handleNewMessage = (message: any) => {
      if (message.channelId === channelId || message.channel_id === channelId) {
        addMessage(channelId, message);
      }
    };

    socket.on('message:new', handleNewMessage);

    return () => {
      socket.emit('channel:leave', { channelId });
      socket.off('message:new', handleNewMessage);
    };
  }, [channelId, addMessage]);
}
```

- [ ] **Step 3: Create MessageItem component**

`packages/frontend/src/components/channel/MessageItem.tsx`:
```typescript
interface MessageItemProps {
  message: {
    id: string;
    content: string;
    isEdited: boolean;
    isDeleted: boolean;
    createdAt: string;
    user?: { id: string; displayName: string; avatarUrl: string | null };
  };
}

export function MessageItem({ message }: MessageItemProps) {
  if (message.isDeleted) {
    return (
      <div className="px-5 py-1 text-sm text-gray-400 italic">
        Diese Nachricht wurde geloescht.
      </div>
    );
  }

  const time = new Date(message.createdAt).toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="group flex gap-3 px-5 py-1.5 hover:bg-gray-50">
      {/* Avatar */}
      <div className="mt-0.5 h-9 w-9 flex-shrink-0 rounded bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-600">
        {message.user?.displayName?.[0]?.toUpperCase() || '?'}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-gray-900">
            {message.user?.displayName || 'Unbekannt'}
          </span>
          <span className="text-xs text-gray-500">{time}</span>
          {message.isEdited && (
            <span className="text-xs text-gray-400">(bearbeitet)</span>
          )}
        </div>
        <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
          {message.content}
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create MessageList component**

`packages/frontend/src/components/channel/MessageList.tsx`:
```typescript
'use client';

import { useEffect, useRef } from 'react';
import { useMessagesStore } from '@/stores/messages.store';
import { MessageItem } from './MessageItem';

export function MessageList({ channelId }: { channelId: string }) {
  const messages = useMessagesStore((s) => s.messagesByChannel[channelId] || []);
  const fetchMessages = useMessagesStore((s) => s.fetchMessages);
  const loading = useMessagesStore((s) => s.loading);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages(channelId);
  }, [channelId, fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (loading && messages.length === 0) {
    return <div className="flex-1 flex items-center justify-center text-gray-400">Laden...</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="py-4">
        {messages.map((msg) => (
          <MessageItem key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create MessageInput component**

`packages/frontend/src/components/channel/MessageInput.tsx`:
```typescript
'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { getSocket } from '@/lib/socket';

export function MessageInput({ channelId }: { channelId: string }) {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeout = useRef<NodeJS.Timeout>();

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function sendMessage() {
    const text = content.trim();
    if (!text) return;

    const socket = getSocket();
    socket.emit('message:send', { channelId, content: text });
    setContent('');
    textareaRef.current?.focus();
  }

  function handleInput(value: string) {
    setContent(value);

    // Typing indicator (debounced)
    const socket = getSocket();
    socket.emit('typing:start', { channelId });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('typing:stop', { channelId });
    }, 3000);
  }

  return (
    <div className="border-t bg-white px-5 py-3">
      <div className="flex items-end gap-2 rounded-lg border bg-gray-50 px-3 py-2">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => handleInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nachricht schreiben..."
          className="flex-1 resize-none bg-transparent text-sm outline-none"
          rows={1}
        />
        <button
          onClick={sendMessage}
          disabled={!content.trim()}
          className="rounded bg-indigo-600 px-3 py-1 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          Senden
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create ChannelHeader component**

`packages/frontend/src/components/channel/ChannelHeader.tsx`:
```typescript
interface ChannelHeaderProps {
  name: string;
  topic: string | null;
  type: 'public' | 'private';
}

export function ChannelHeader({ name, topic, type }: ChannelHeaderProps) {
  return (
    <header className="flex items-center gap-3 border-b bg-white px-5 py-3">
      <span className="text-gray-400 text-lg">{type === 'public' ? '#' : '🔒'}</span>
      <div className="min-w-0">
        <h1 className="text-base font-semibold text-gray-900">{name}</h1>
        {topic && (
          <p className="text-xs text-gray-500 truncate">{topic}</p>
        )}
      </div>
    </header>
  );
}
```

- [ ] **Step 7: Create Channel page**

`packages/frontend/src/app/(workspace)/channel/[channelId]/page.tsx`:
```typescript
'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ChannelHeader } from '@/components/channel/ChannelHeader';
import { MessageList } from '@/components/channel/MessageList';
import { MessageInput } from '@/components/channel/MessageInput';
import { useChannelsStore } from '@/stores/channels.store';
import { useChannelSocket } from '@/hooks/useSocket';

export default function ChannelPage() {
  const params = useParams();
  const channelId = params.channelId as string;
  const { channels, setActiveChannel } = useChannelsStore();
  const channel = channels.find((c) => c.id === channelId);

  useChannelSocket(channelId);

  useEffect(() => {
    setActiveChannel(channelId);
  }, [channelId, setActiveChannel]);

  if (!channel) {
    return (
      <div className="flex flex-1 items-center justify-center text-gray-400">
        Channel wird geladen...
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <ChannelHeader name={channel.name} topic={channel.topic} type={channel.type} />
      <MessageList channelId={channelId} />
      <MessageInput channelId={channelId} />
    </div>
  );
}
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: Channel view with message list, input, and real-time updates"
```

---

## Task 14: Users/Me Endpoint + DM Module Scaffolding

**Files:**
- Create: `packages/backend/src/users/users.controller.ts`
- Create: `packages/backend/src/dm/dm-conversation.entity.ts`
- Create: `packages/backend/src/dm/dm-participant.entity.ts`
- Create: `packages/backend/src/dm/dm.service.ts`
- Create: `packages/backend/src/dm/dm.controller.ts`
- Create: `packages/backend/src/dm/dm.module.ts`

- [ ] **Step 1: Create UsersController with /me endpoint**

`packages/backend/src/users/users.controller.ts`:
```typescript
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
```

Update `UsersModule` to include `UsersController`.

- [ ] **Step 2: Create DM entities**

`packages/backend/src/dm/dm-conversation.entity.ts`:
```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { DmParticipant } from './dm-participant.entity';

@Entity('dm_conversations')
export class DmConversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'workspace_id' })
  workspaceId: string;

  @Column({ name: 'is_group', default: false })
  isGroup: boolean;

  @OneToMany(() => DmParticipant, (p) => p.conversation)
  participants: DmParticipant[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

`packages/backend/src/dm/dm-participant.entity.ts`:
```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { DmConversation } from './dm-conversation.entity';
import { User } from '../users/user.entity';

@Entity('dm_participants')
@Unique(['conversationId', 'userId'])
export class DmParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'conversation_id' })
  conversationId: string;

  @ManyToOne(() => DmConversation, (c) => c.participants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation: DmConversation;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'last_read_at', type: 'timestamptz', nullable: true })
  lastReadAt: Date | null;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;
}
```

- [ ] **Step 3: Create DmService, DmController, DmModule**

`packages/backend/src/dm/dm.service.ts`:
```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { DmConversation } from './dm-conversation.entity';
import { DmParticipant } from './dm-participant.entity';

@Injectable()
export class DmService {
  constructor(
    @InjectRepository(DmConversation)
    private readonly convRepo: Repository<DmConversation>,
    @InjectRepository(DmParticipant)
    private readonly partRepo: Repository<DmParticipant>,
  ) {}

  async findOrCreate(
    workspaceId: string,
    userIds: string[],
  ): Promise<DmConversation> {
    if (userIds.length < 2 || userIds.length > 9) {
      throw new BadRequestException('DM requires 2-9 participants');
    }

    // Check for existing conversation with exact same participants
    const existing = await this.findExisting(workspaceId, userIds);
    if (existing) return existing;

    const isGroup = userIds.length > 2;
    const conv = this.convRepo.create({ workspaceId, isGroup });
    const saved = await this.convRepo.save(conv);

    for (const userId of userIds) {
      await this.partRepo.save(
        this.partRepo.create({ conversationId: saved.id, userId }),
      );
    }

    return this.findById(saved.id);
  }

  private async findExisting(
    workspaceId: string,
    userIds: string[],
  ): Promise<DmConversation | null> {
    // Find conversations where ALL userIds are participants and count matches
    const sorted = [...userIds].sort();

    const convs = await this.convRepo
      .createQueryBuilder('c')
      .innerJoin('c.participants', 'p')
      .where('c.workspace_id = :workspaceId', { workspaceId })
      .groupBy('c.id')
      .having('COUNT(p.id) = :count', { count: sorted.length })
      .getMany();

    for (const conv of convs) {
      const parts = await this.partRepo.find({ where: { conversationId: conv.id } });
      const partIds = parts.map((p) => p.userId).sort();
      if (JSON.stringify(partIds) === JSON.stringify(sorted)) {
        return this.findById(conv.id);
      }
    }

    return null;
  }

  async findById(id: string): Promise<DmConversation> {
    const conv = await this.convRepo.findOne({
      where: { id },
      relations: ['participants', 'participants.user'],
    });
    if (!conv) throw new NotFoundException('Conversation not found');
    return conv;
  }

  async findByUser(userId: string): Promise<DmConversation[]> {
    const parts = await this.partRepo.find({ where: { userId } });
    if (parts.length === 0) return [];

    const convIds = parts.map((p) => p.conversationId);
    return this.convRepo.find({
      where: { id: In(convIds) },
      relations: ['participants', 'participants.user'],
    });
  }
}
```

`packages/backend/src/dm/dm.controller.ts`:
```typescript
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
  create(
    @Body('userIds') userIds: string[],
    @CurrentUser() user: User,
  ) {
    const allIds = [...new Set([user.id, ...userIds])];
    return this.dmService.findOrCreate(user.workspaceId, allIds);
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.dmService.findByUser(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dmService.findById(id);
  }
}
```

`packages/backend/src/dm/dm.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DmConversation } from './dm-conversation.entity';
import { DmParticipant } from './dm-participant.entity';
import { DmService } from './dm.service';
import { DmController } from './dm.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DmConversation, DmParticipant])],
  controllers: [DmController],
  providers: [DmService],
  exports: [DmService],
})
export class DmModule {}
```

Update `app.module.ts` to include `DmModule`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: Users/me endpoint and DM module with find-or-create"
```

---

## Task 15: Workspace Seed + Initial Migration

**Files:**
- Create: `packages/backend/src/workspaces/workspaces.module.ts`
- Create: `packages/backend/src/workspaces/workspaces.service.ts`
- Create: `packages/backend/src/database/seed.ts`

- [ ] **Step 1: Create WorkspacesService and Module**

`packages/backend/src/workspaces/workspaces.service.ts`:
```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace } from './workspace.entity';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepo: Repository<Workspace>,
  ) {}

  async findBySlug(slug: string): Promise<Workspace | null> {
    return this.workspaceRepo.findOne({ where: { slug } });
  }

  async ensureDefault(): Promise<Workspace> {
    const DEFAULT_ID = '00000000-0000-0000-0000-000000000001';
    let ws = await this.workspaceRepo.findOne({ where: { id: DEFAULT_ID } });
    if (!ws) {
      ws = this.workspaceRepo.create({
        id: DEFAULT_ID,
        name: 'Chat',
        slug: 'default',
        settings: {},
      });
      ws = await this.workspaceRepo.save(ws);
    }
    return ws;
  }
}
```

`packages/backend/src/workspaces/workspaces.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workspace } from './workspace.entity';
import { WorkspacesService } from './workspaces.service';

@Module({
  imports: [TypeOrmModule.forFeature([Workspace])],
  providers: [WorkspacesService],
  exports: [WorkspacesService],
})
export class WorkspacesModule {}
```

- [ ] **Step 2: Create seed script**

`packages/backend/src/database/seed.ts`:
```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { ChannelsService } from '../channels/channels.service';
import { ChannelType } from '@chat/shared';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const workspacesService = app.get(WorkspacesService);
  const channelsService = app.get(ChannelsService);

  // Ensure default workspace
  const workspace = await workspacesService.ensureDefault();
  console.log(`Workspace: ${workspace.name} (${workspace.id})`);

  // Ensure #general channel
  try {
    await channelsService.create(
      { name: 'general', type: ChannelType.PUBLIC, description: 'Allgemeiner Channel' },
      workspace.id, // createdBy = workspace ID as placeholder
      workspace.id,
    );
    console.log('Created #general channel');
  } catch {
    console.log('#general already exists');
  }

  await app.close();
  console.log('Seed complete');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
```

Add to `packages/backend/package.json` scripts:
```json
"seed": "ts-node src/database/seed.ts"
```

- [ ] **Step 3: Enable synchronize for initial development**

Temporarily set `synchronize: true` in `database.module.ts` for initial development (switch to migrations before production).

- [ ] **Step 4: Verify full stack starts**

```bash
# Start infrastructure
docker compose -f docker-compose.dev.yml up -d

# Install dependencies
npm install

# Start backend
cd packages/backend && npm run dev

# In another terminal: seed
cd packages/backend && npm run seed

# Start frontend
cd packages/frontend && npm run dev
```

Expected: Backend on :3001, Frontend on :3000, Login page visible

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: Workspace seed, #general channel, full stack startup"
```

---

## Sprint A Summary

After completing all 15 tasks, the following is functional:

| Feature | Status |
|---------|--------|
| Monorepo (npm workspaces + Turborepo) | Done |
| Shared types/enums | Done |
| Docker Compose (Dev + Prod) | Done |
| NestJS Backend with config | Done |
| PostgreSQL + TypeORM entities | Done |
| Auth (Register, Login, JWT, Refresh) | Done |
| Users (Profile, /me, List) | Done |
| Channels (CRUD, Members, Archive) | Done |
| Messages (CRUD, Edit, Delete, Pin, Threads) | Done |
| DMs (1:1 + Group, Find-or-Create) | Done |
| WebSocket Gateway (Echtzeit-Messaging, Typing) | Done |
| Next.js Frontend with Tailwind | Done |
| Login & Register Pages | Done |
| Sidebar with Channel List | Done |
| Channel View (Messages, Input, Real-time) | Done |
| Workspace Seed + #general | Done |

**Next: Sprint B** — Threads-UI, Reaktionen, Emoji, Datei-Upload, Suche (Meilisearch)
