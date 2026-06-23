# Zento

Zento is an ERP / back-office dashboard application. This repository is a monorepo
containing the API and the web client:

| Folder       | Stack                                                            | Dev port |
| ------------ | --------------------------------------------------------------- | -------- |
| `backend/`   | [NestJS 11](https://nestjs.com/) · Prisma 6 · PostgreSQL        | `3001`   |
| `frontend/`  | [Next.js 16](https://nextjs.org/) (App Router) · React 19 · TypeScript · Tailwind v4 | `3000`   |

The frontend is built on the TailAdmin template and extended with a custom domain
model (Home dashboards, Financial, Operation, Masters). See
[`frontend/README.md`](frontend/README.md) and [`backend/README.md`](backend/README.md)
for package-specific details.

## Repository layout

```
.
├── backend/                  # NestJS API (Prisma ORM, PostgreSQL)
│   ├── prisma/               # schema.prisma + migrations
│   ├── src/                  # feature modules (crop, account, employee, …)
│   └── Dockerfile
├── frontend/                 # Next.js dashboard
│   ├── src/
│   └── Dockerfile
├── docker-compose.yml        # full stack: db + backend + frontend
├── docker-compose-local-pg.yml  # backend + frontend, uses a HOST Postgres
└── .gitignore
```

## Running with Docker (recommended)

Prerequisite: Docker with Compose v2.

### Full stack (includes a PostgreSQL container)

```bash
docker compose up -d --build      # build images and start db + backend + frontend
docker compose logs -f            # follow logs
docker compose down               # stop (DB data kept in the named volume)
docker compose down -v            # stop AND wipe the database volume
```

Then open **http://localhost:3000**. The backend API is on **http://localhost:3001**
and PostgreSQL is published on **5432**.

The backend applies Prisma migrations automatically on start (`prisma migrate deploy`),
so the schema is created on first run. The database starts empty.

### Using a locally installed PostgreSQL (no DB container)

Use this when you already run Postgres on the host and want the containers to use it:

```bash
docker compose -f docker-compose-local-pg.yml up -d --build
```

Requirements:
- A database named `zento` must already exist on the host instance
  (`createdb zento`). The backend applies migrations but does not create the DB.
- Credentials default to `postgres` / `Admin@1234` (see `backend/.env`). Edit
  `DATABASE_URL` in the compose file if your host instance differs.
- On Docker Desktop, the container reaches the host Postgres via
  `host.docker.internal` out of the box. On native Linux Docker Engine the host
  Postgres must also listen on the bridge (`listen_addresses='*'` + a matching
  `pg_hba.conf` rule).

> **Ports.** Both compose files publish backend `3001`, frontend `3000`, and (full
> stack only) db `5432`. Stop any local dev servers or a local Postgres occupying
> those ports first, or the published ports will collide.

#### Networking note

The frontend does server-side (SSR) data fetching, so the API base URL must work
from both the browser and from inside the frontend container. To make a single
baked `NEXT_PUBLIC_API_URL=http://localhost:3001` work for both, the frontend
shares the backend's network namespace (`network_mode: "service:backend"`); its
`:3000` is therefore published on the `backend` service. This also keeps it
reachable under Docker Desktop, which forwards only published ports to the host.

## Local development (without Docker)

Run each package separately. Node.js 24 (matching the Docker images) is recommended.

### Backend

```bash
cd backend
npm install
cp .env.example .env          # set DATABASE_URL, PORT, FRONTEND_URL
npx prisma migrate deploy     # or: npx prisma migrate dev
npm run start:dev             # watch mode on http://localhost:3001
```

### Frontend

```bash
cd frontend
npm install
# .env.local sets NEXT_PUBLIC_API_URL (defaults to http://localhost:3001)
npm run dev                   # http://localhost:3000
```

## Environment variables

**backend/.env**

| Variable       | Example                                                              | Notes                                  |
| -------------- | ------------------------------------------------------------------- | -------------------------------------- |
| `PORT`         | `3001`                                                              | API listen port                        |
| `NODE_ENV`     | `development`                                                       |                                        |
| `FRONTEND_URL` | `http://localhost:3000`                                             | Allowed CORS origin                    |
| `DATABASE_URL` | `postgresql://postgres:Admin%401234@localhost:5432/zento?schema=public` | URL-encode special chars (`@` → `%40`) |

**frontend/.env.local**

| Variable               | Example                  | Notes                                            |
| ---------------------- | ------------------------ | ------------------------------------------------ |
| `NEXT_PUBLIC_API_URL`  | `http://localhost:3001`  | Inlined at **build** time into the client bundle |

## Database & migrations

The schema lives in [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma)
with migrations under `backend/prisma/migrations/`. Common commands (run inside
`backend/`):

```bash
npx prisma migrate dev --name <change>   # create + apply a migration in dev
npx prisma migrate deploy                # apply pending migrations (prod / CI)
npx prisma generate                      # regenerate the Prisma client
npx prisma studio                        # browse data in the browser
```
