# UAE Competition Platform

Competition platform with:
- Core paid-entry competitions
- Chess + Connect 4 tournament flows
- Mental health support chat + support-worker handoff
- SQLite persistence with startup migrations
- Idempotent entry checkout and payment audit trail

## Scope for this release
This release ships **competitions + tournaments + support** as one integrated experience.

## Routes (frontend)
- `/` Home
- `/competitions` Competition dashboard + entry modal
- `/tournaments/chess`
- `/tournaments/connect4`
- `/mental-health`
- `/gallery`
- `/help`
- `/terms`
- Legacy redirects: `/chess-tournament`, `/connect4-tournament`, `/wellbeing-support`

## API highlights
- `GET /api/competitions`
- `GET /api/competitions/:id`
- `POST /api/competitions/:id/enter` (requires `Idempotency-Key` header + `termsAccepted: true`)
- `GET /api/entries/:entryId/audit`
- `GET /api/tournaments`
- `GET /api/tournaments/:slug`
- `POST /api/tournaments/:slug/register`
- `POST /api/mental-health/chat`
- `POST /api/support-worker-requests`
- `POST /api/charity/checkout`

## Entry flow hardening
- Quantity validated to integer range 1–100
- Terms acceptance enforced server-side
- Idempotency key required for entry POST
- Payment authorization abstraction (`PAYMENT_PROVIDER`)
- Audit events persisted per entry (`payment_initiated`, `payment_authorized`, `entry_confirmed`)

## Persistence
Server uses SQLite via Node runtime (`node:sqlite`) with migrations applied at startup:
- `schema_migrations`
- `competitions`
- `competition_entries`
- `payment_audit_logs`
- `idempotency_keys`
- `tournaments`
- `tournament_registrations`
- `support_worker_requests`

Default DB path comes from `DATABASE_URL` (example: `sqlite:./database.db`).

## Local setup
### Prerequisites
- Node.js 22+
- npm 10+

### Install
```bash
npm ci
npm --prefix client ci
```

### Run
```bash
npm run dev
```
- Frontend: `http://localhost:5173`
- API: `http://localhost:5000`

## Validation commands
```bash
npm run type-check
npm run build
npm test
```

## Environment variables
Use root `.env.example` and `server/.env.example`.

Key backend vars:
- `DATABASE_URL=sqlite:./database.db`
- `PAYMENT_PROVIDER=modular`
- `STRIPE_CHECKOUT_URL=` (optional)
- `CORS_ORIGINS=http://localhost:5173`
- `RATE_LIMIT_WINDOW_MS=900000`
- `RATE_LIMIT_MAX=100`
- `ENABLED_TOURNAMENTS=chess,connect4`
- `MENTAL_HEALTH_AI_MODE=mock|live`
- `MENTAL_HEALTH_AI_ENDPOINT=`
- `MENTAL_HEALTH_AI_API_KEY=`

## Deployment path
### Frontend (Vercel)
Root `vercel.json` builds from `client/` and outputs `client/dist`.

### Backend (Railway)
`railway.toml`:
- build: `npm run build:server`
- start: `node dist/server/index.js`

## Launch checklist
- [ ] Configure production env vars
- [ ] Restrict `CORS_ORIGINS` to production domains only
- [ ] Set production rate-limit values
- [ ] Verify `/api/health`
- [ ] Run `npm run type-check && npm run build && npm test`
- [ ] Confirm idempotent entry behavior in staging
- [ ] Confirm payment audit endpoint output for sample entries

## License
MIT
