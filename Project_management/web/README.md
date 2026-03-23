# Professional Next.js Starter

Production-ready Next.js app with:

- Next.js 16 + React 19 + TypeScript
- App Router (`src/app`)
- Tailwind CSS v4
- ESLint (core-web-vitals + TypeScript)
- Prettier (+ Tailwind class sorting)
- Jest + Testing Library
- `lint-staged` pre-commit command
- Shared utility helpers and env validation with Zod
- Homepage chat UI connected to OpenAI API route
- Structured server logging with Pino
- Markdown chat rendering (tables, lists, code blocks)
- NextAuth credentials login
- SQLite-backed chat history persistence
- Local MCP calculator server + chat eval script

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## OpenAI Setup

Add your key in `.env.local`:

```bash
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
LOG_LEVEL=info
```

Then run `npm run dev` and use the homepage chat.

## Auth + Database Setup

1. Copy environment:

```bash
cp .env.example .env.local
cp .env.example .env
```

2. Set a secure `AUTH_SECRET` in both `.env` and `.env.local`.

3. Initialize database and seed login user:

```bash
npm run db:init
npm run db:seed
```

4. Start app:

```bash
npm run dev
```

Sign in at `/login` using:

- `SEED_USER_EMAIL`
- `SEED_USER_PASSWORD`

## Scripts

- `npm run dev` - start local dev server
- `npm run build` - create production build
- `npm run start` - run production build
- `npm run lint` - run ESLint
- `npm run typecheck` - run TypeScript checks
- `npm run test` - run unit tests once
- `npm run test:watch` - run unit tests in watch mode
- `npm run test:coverage` - run tests with coverage
- `npm run format` - check formatting
- `npm run format:write` - write formatting changes
- `npm run precommit` - run lint-staged checks
- `npm run check` - lint + types + tests + build
- `npm run eval:chat` - run MCP calculator eval cases

## Source Layout

```text
src/
  app/          # App Router pages/layouts
  components/   # Reusable UI and feature components
  lib/          # Utilities/helpers
  env.ts        # Environment validation
```

## Architecture Notes

See \\docs/clean-architecture.md\\ for current dependency boundaries, side-effect policy, and QA gates.
