# Chat

Eigenstaendige, selbst gehostete Messaging- und Kollaborationsplattform.

## Tech-Stack

| Komponente | Technologie |
|-----------|-------------|
| Backend | NestJS (TypeScript) |
| Frontend | Next.js (React, TypeScript) |
| Datenbank | PostgreSQL 16+ |
| Cache / Pub-Sub | Redis 7+ |
| Echtzeit | WebSocket (Socket.IO) |
| Volltextsuche | Meilisearch |
| Dateispeicher | S3-kompatibel (MinIO / AWS S3) |
| Containerisierung | Docker Compose |
| Reverse Proxy | Caddy |

## Projektstruktur

```
chat/
├── packages/
│   ├── backend/          # NestJS API + WebSocket Gateway
│   ├── frontend/         # Next.js Web-App
│   └── shared/           # Geteilte Types, Enums, Validierung
├── docs/
│   ├── Pflichtenheft.md
│   └── Slack-Funktionsdokumentation.md
├── docker-compose.yml
└── Caddyfile
```

## Phasen

- **Phase 1 (MVP):** Core Messaging — Channels, DMs, Threads, Dateien, Suche, Benachrichtigungen
- **Phase 2:** Kollaboration — Huddles (Audio/Video), Canvas, Clips, Listen, Slash-Befehle
- **Phase 3:** Automation & Enterprise — Workflow Builder, API/Bot-Framework, AI, Compliance

## Dokumentation

- [Pflichtenheft](docs/Pflichtenheft.md) — Vollstaendige funktionale und technische Anforderungen
- [Slack-Funktionsdokumentation](docs/Slack-Funktionsdokumentation.md) — Referenzdokumentation aller Slack-Features

## Lizenz

MIT
