# Next.js and PostgreSQL Docker Server

This project gives you a minimal Dockerized stack with:

- A Next.js app using the App Router and TypeScript
- A PostgreSQL database container
- A health endpoint at `/api/health`
- Seeded sample data rendered on the homepage

## Run with Docker

```bash
docker compose up --build
```

Then open `http://localhost:3000`.

## Services

- `app`: Next.js production server
- `db`: PostgreSQL 16 with seeded sample data

## Environment

The app uses this connection string inside Docker Compose:

```bash
postgresql://postgres:postgres@db:5432/appdb
```

For running the app outside Docker, copy `.env.example` to `.env` and point it at a reachable PostgreSQL instance.
