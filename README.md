# UGC Studio

Internal ClothME tool to discover viral UGC, analyze structure, remix scripts for ClothME, generate AI UGC, edit videos, and export for TikTok/Instagram posting.

## Stack

| Layer | Tech |
|-------|------|
| Web | Next.js 15, Tailwind |
| API | NestJS, Drizzle ORM |
| DB | PostgreSQL 16 |
| Queue | Redis (reserved for future workers) |
| AI | OpenRouter or OpenAI (analyze + remix), HeyGen (AI UGC) |
| Video | FFmpeg (trim, text overlays, 9:16 export) |
| Storage | Local disk → Bunny.net CDN (optional) |

## Quick start

```bash
# Prerequisites: Node 20+, Docker, FFmpeg
# pnpm — pick one:
#   npm install -g pnpm
#   corepack enable   # may need: sudo corepack enable
#   npx pnpm@9.15.9 <command>   # no global install needed

cp .env.example .env
# Required for real API: OPENROUTER_API_KEY or OPENAI_API_KEY
# Optional: HEYGEN_API_KEY, Bunny.net storage vars

pnpm install
pnpm docker:up          # Postgres on :5433, Redis on :6380
pnpm db:migrate

# Terminal 1 — API
pnpm dev:api

# Terminal 2 — Web (mock mode by default)
pnpm dev:web
```

- Web: http://localhost:3100
- API health: http://localhost:4000/health

### Connect UI to real API

In `.env`:

```
OPENROUTER_API_KEY=sk-or-...
# or OPENAI_API_KEY=sk-...
NEXT_PUBLIC_USE_MOCK=false
```

Restart both `dev:api` and `dev:web`.

## Workflow

1. **Discover** — paste a TikTok/IG/YouTube Short URL + optional caption
2. **Analyze** — LLM breaks down hook, structure, CTA
3. **Remix** — generate ClothME script from viral format
4. **AI UGC** — generate talking-head video with HeyGen avatar
5. **Editor** — trim footage, add text overlays, render MP4 (requires FFmpeg)
6. **Export** — save export record with caption/hashtags for manual posting
7. **Accounts** — manage multiple TikTok/Instagram accounts

## Storage

Rendered files are written to `UPLOAD_DIR` (default `./uploads`). When Bunny.net is configured, files are uploaded to your storage zone and served via CDN:

```
BUNNY_STORAGE_ZONE=your-zone
BUNNY_STORAGE_API_KEY=your-key
BUNNY_CDN_HOSTNAME=your-zone.b-cdn.net
```

Without Bunny, files are served locally at `GET /files/:filename`.

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Service status (DB, OpenAI, HeyGen, storage) |
| GET | `/activity` | Recent pipeline activity |
| GET/POST | `/accounts` | Manage social accounts |
| GET/POST | `/videos/ingest` | Add source video by URL + caption |
| GET/POST | `/analysis` | Analyze a source video (requires LLM key) |
| GET/POST | `/scripts` | List / remix ClothME scripts |
| GET | `/scripts/analysis/:id` | Scripts for an analysis |
| POST/PATCH | `/editor` | Create/update edit project |
| POST | `/editor/:id/render` | Render MP4 with FFmpeg |
| GET | `/files/:filename` | Download locally stored renders |
| GET/POST | `/ai-ugc` | AI UGC generation jobs |
| GET/POST | `/exports` | Export records |

## Environment

See `.env.example`. Stage 2 requires `OPENROUTER_API_KEY` or `OPENAI_API_KEY` for analyze/remix. The web UI defaults to **mock mode** until `NEXT_PUBLIC_USE_MOCK=false`.

### LLM providers

**OpenRouter** (recommended — model flexibility, single billing):

```
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_MODEL=openai/gpt-4o-mini   # or anthropic/claude-3.5-haiku, etc.
```

**Direct OpenAI:**

```
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

If `AI_PROVIDER` is unset, OpenRouter is used when `OPENROUTER_API_KEY` is present; otherwise OpenAI.

## K8s migration note

Keep PostgreSQL + Drizzle migrations as-is. On Kubernetes, only `DATABASE_URL` and storage config change — no schema rewrite needed. Bunny.net (or S3-compatible storage) replaces local disk for production file serving.

## License

Private — ClothME internal use only.
