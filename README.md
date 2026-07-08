# UGC Studio

Internal ClothME tool to discover viral UGC, analyze structure, remix scripts for ClothME, generate AI UGC, edit videos, and export for TikTok/Instagram posting.

## Stack

| Layer | Tech |
|-------|------|
| Web | Next.js 15, Tailwind |
| API | NestJS, Drizzle ORM |
| DB | PostgreSQL 16 |
| Queue | Redis (reserved for future workers) |
| AI | OpenAI (analyze + remix), HeyGen (AI UGC) |
| Video | FFmpeg (trim, text overlays, 9:16 export) |

## Quick start

```bash
# Prerequisites: Node 20+, pnpm, Docker, FFmpeg

cp .env.example .env
# Add OPENAI_API_KEY and HEYGEN_API_KEY for production AI

pnpm install
pnpm docker:up
pnpm db:migrate

# Terminal 1
pnpm dev:api

# Terminal 2
pnpm dev:web
```

- Web: http://localhost:3000
- API: http://localhost:4000/health

## Workflow

1. **Discover** — paste a TikTok/IG/YouTube Short URL
2. **Analyze** — break down hook, structure, CTA
3. **Remix** — generate ClothME script from viral format
4. **AI UGC** — generate talking-head video with HeyGen avatar
5. **Editor** — trim footage, add text overlays, render MP4 (requires FFmpeg)
6. **Export** — save export record with caption/hashtags for manual posting
7. **Accounts** — manage multiple TikTok/Instagram accounts

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Service status |
| GET/POST | `/accounts` | Manage social accounts |
| GET/POST | `/videos/ingest` | Add source video by URL |
| POST | `/analysis` | Analyze a source video |
| POST | `/scripts/remix` | Remix analysis for ClothME |
| POST/PATCH | `/editor` | Create/update edit project |
| POST | `/editor/:id/render` | Render MP4 with FFmpeg |
| GET/POST | `/ai-ugc` | AI UGC generation jobs |
| GET/POST | `/exports` | Export records |

## Environment

See `.env.example`. Without API keys the app runs in **mock mode** for local development.

## License

Private — ClothME internal use only.
