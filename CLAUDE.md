# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

TFC (Trybe Futebol Clube) is a football championship app with a React frontend (Vite 5) and a custom-built REST API backend (Express/TypeScript). The project runs as three Docker containers: `frontend` (port 3000), `backend` (port 3001), and `db` (MySQL on port 3002).

## Commands

### Docker (recommended for full stack)
```bash
# From project root
npm run compose:up    # Build and start all containers
npm run compose:down  # Stop and remove containers
```

Requires Docker with the **Docker Compose v2 plugin** (`docker compose`, not `docker-compose`).

### Backend development (from `./app/backend`)
```bash
npm run dev           # Start with ts-node-dev (compiles + resets DB on start)
npm run lint          # ESLint with airbnb-typescript rules
npm test              # Run all mocha tests
npm run test:coverage # Run tests with nyc coverage
npm run db:reset      # Drop, create, migrate, and seed the database
```

> **Node 22 caveat:** Run tests with `NODE_OPTIONS="--no-experimental-strip-types" npm test` if using Node 22 locally (the project targets Node 20).

### Frontend development (from `./app/frontend`)
```bash
npm start    # Start Vite dev server on port 3000
npm run dev  # Same as above
npm run build # Production build
```

### Run a single backend test file
```bash
# From ./app/backend
npx mocha -r ts-node/register ./src/tests/01.login.test.ts -t 10000 --exit
```

### Integration tests (from root)
```bash
npm test              # Runs puppeteer-based Jest tests in ./__tests__
```

### Environment variables (for local backend without Docker)
```
PORT=3001
DB_USER=root
DB_PASS=123456
DB_NAME=TRYBE_FUTEBOL_CLUBE
DB_HOST=localhost
DB_PORT=3306   # use 3002 if connecting to the Docker db container from the host
```

## Architecture

### Backend (`app/backend/src/`)

Layered architecture: **Routes → Middlewares → Controllers → Services → Models**

- `routes/` — Express routers mounting at `/health`, `/clubs`, `/login`, `/matchs`, `/leaderboard`
- `controllers/` — Thin handlers that call services and return HTTP responses
- `services/` — Business logic; leaderboard computation lives here
- `database/models/` — Sequelize models (`Users`, `Clubs`, `Matchs`); all use `underscored: true` and `timestamps: false`
- `database/config/database.ts` — Sequelize connection config read from env vars
- `helpers/` — Shared types (`interfaces.ts`), JWT signing/verification (`token.ts`), HTTP status enum (`StatusCode.ts`)

### Health endpoint

`GET /health` returns `{ status: 'ok' }` with HTTP 200. Used by the Docker Compose healthcheck for the backend container.

### Authentication

JWT tokens are signed using a secret read from `jwt.evaluation.key` (a file on disk, not an env var). Both `generateToken` and `verifyToken` in `helpers/token.ts` read this file at call time.

### Leaderboard logic

The leaderboard is computed on-the-fly (no caching) by:
1. Fetching all clubs and their matches from the DB
2. Calculating stats per club in `services/leaderboards/`
3. Sorting by points → victories → goal balance → goals favor → goals own

Three endpoints exist: `/leaderboard` (general), `/leaderboard/home`, `/leaderboard/away`, each using separate service files (`index.ts`, `home.ts`, `away.ts`).

### Frontend (`app/frontend/src/`)

React 17 SPA built with **Vite 5**. Source files use `.js` extension with JSX syntax (CRA legacy convention). The `vite.config.ts` includes explicit `esbuild` and `optimizeDeps` configuration to handle JSX in `.js` files — do not simplify this config or JSX parsing will break.

- `src/index.js` — entry point (referenced in root `index.html`)
- `src/App.js` — root component with routing
- `src/pages/` — page-level components
- `src/components/` — shared UI components
- `src/services/` — axios instances and API calls; uses `import.meta.env.VITE_API_PORT` for backend port

### Tests (`app/backend/src/tests/`)

Unit/integration tests use **mocha + chai + chai-http + sinon**. Tests stub Sequelize model methods (e.g., `Users.findOne`) to avoid real DB calls. Files are numbered and run in order: `00.health`, `01.login`, `02.loginValidate`, `03.clubs`, `04.matchs`, `05.leaderboard`.

### Root-level integration tests (`./__tests__/`)

Puppeteer-based end-to-end tests run via Jest from the project root. These require the full Docker stack to be running.

## Infrastructure

### Docker

- `app/docker-compose.yml` — three services: `frontend`, `backend`, `db`
- Both `frontend` and `backend` Dockerfiles use `node:20-alpine`
- Healthchecks use `wget` (not `lsof`, which is unavailable in alpine)
- Backend healthcheck depends on `GET /health` responding correctly

### Known issues

- `04.matchs.test.ts` tests may time out when run without a live database (pre-existing, not a regression)
- `tsc_eval.sh` uses LF line endings — do not commit with CRLF or the build script will fail inside Docker containers

## Documentation

Project documentation follows **SDD (Spec-Driven Development)** with TDD. All AI context and development artifacts live in `docs/`:

```
docs/
├── prd/     — Product Requirements Documents (business level)
├── srd/     — System Requirements Documents (technical requirements)
├── specs/   — Design specs per feature (how to build — output of brainstorming)
├── plans/   — Implementation plans per feature (step-by-step with code)
└── adr/     — Architecture Decision Records (permanent technical decisions)
```

### SDD Governing Rules

1. **Spec-first**: No code is written before a spec exists in `docs/specs/`. The spec is the source of truth.
2. **TDD**: Tests are written before implementation. The plan in `docs/plans/` drives the agent; tests drive the code.
3. **Artifact flow**: PRD → SRD → Spec → Plan → Implementation.
4. **No duplicate folders**: `specs/` and `plans/` are the only homes for specs and plans. Do not create nested subfolders like `superpowers/`.
5. **Consolidate redundancy**: If two documents cover the same feature at the same level of abstraction, merge them into one.
6. **ADR on decisions**: Any architectural decision with lasting implications gets an ADR in `adr/`.

See `docs/README.md` for the full index and naming conventions.
