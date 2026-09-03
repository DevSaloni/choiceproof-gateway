# ChoiceProof Gateway backend

**Verify the choice. Bind the payment.**

ChoiceProof is the backend for a buyer-facing AI shopping agent. Gemini may understand a request and recommend one product, but deterministic server rules decide whether the choice can proceed. An approved choice receives a five-minute, single-use permit bound to the exact intent version, frozen offer set, merchant, SKU, cart and INR amount. Only then can the server create a Razorpay Test Mode order.

## Trust boundary

```text
Buyer conversation
        ↓
Bounded shopping agent (read/search/compare/submit only)
        ↓
Deterministic ChoiceProof evaluation
        ↓
APPROVE / REVIEW / BLOCK
        ↓
Buyer-confirmed safe replacement when needed
        ↓
Exact-cart permit → Razorpay → signed receipt
```

The AI has no payment tool and never receives Razorpay, database, JWT, permit or receipt secrets.

## Implemented capabilities

- Persistent guided buyer conversations with idempotent client messages.
- Versioned, explicitly confirmed intent locks.
- A bounded shopping-agent run with an auditable five-tool trace.
- Gemini live mode and deterministic fixture mode.
- Complete frozen offer snapshots and SHA-256 hashes.
- NORMAL versus CLEAN product selection.
- Deterministic hard constraints, observed-offer dominance and rationale checks.
- General safe replacement ranking; every replacement requires buyer confirmation.
- PostgreSQL-authoritative sessions with a test-only in-memory repository.
- HMAC-SHA256 permits bound to intent, offer set and exact cart.
- Atomic permit reservation and request idempotency.
- Mock and Razorpay Test Mode order providers.
- Razorpay callback and raw-body webhook verification.
- Persisted, tamper-evident ChoiceProof receipts and verification endpoint.
- Swagger UI at `/api/v1/docs`.
- 40-case decision evaluation plus API and unit tests.

## Requirements

- Node.js 20 or newer.
- npm.
- PostgreSQL or Neon.
- Gemini API key for live AI mode.
- Razorpay Test Mode credentials for live payment mode.

## Local setup

```powershell
cd server
Copy-Item .env.example .env
npm install
npm run prisma:generate
npm run db:apply
npm run build
npm run db:seed
npm run dev
```

Open:

```text
Health:      http://localhost:3000/health
Readiness:   http://localhost:3000/ready
Swagger UI:  http://localhost:3000/api/v1/docs
```

The migration command applies every checked-in migration once. The seed command creates `demo@choiceproof.local` and the ten-product running-shoe catalog.

## Provider modes

Safe local defaults:

```env
AI_MODE=fixture
PAYMENT_MODE=mock
```

Live judged path:

```env
AI_MODE=gemini
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-3.7-flash

PAYMENT_MODE=razorpay
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
```

Provider failures never silently fall back to fixtures or mock payment.

## Buyer API sequence

```text
POST /api/v1/auth/demo-login
POST /api/v1/sessions
POST /api/v1/sessions/:id/messages
POST /api/v1/sessions/:id/intent/confirm
POST /api/v1/sessions/:id/agent/run
POST /api/v1/evaluations/:id/review       (only when required)
POST /api/v1/evaluations/:id/permit
POST /api/v1/permits/:id/create-order
POST /api/v1/payments/verify
GET  /api/v1/sessions/:id/receipt
```

The earlier granular `intent/parse`, `catalog`, `agent/select` and `evaluate` endpoints remain available for the existing client and regression tests.

## Standard response

```json
{
  "success": true,
  "data": {},
  "timestamp": "2026-09-03T12:00:00.000Z",
  "requestId": "req_..."
}
```

Errors use the same envelope with a stable code, safe message and optional details. Production never returns stack traces.

## Commands

```text
npm run dev               Start the API in watch mode
npm run typecheck         Check TypeScript without emitting files
npm run build             Compile the production server
npm test                  Run all automated tests
npm run test:evaluation   Run the 40-case decision suite
npm run prisma:generate   Generate Prisma Client
npm run db:apply          Apply checked-in migrations
npm run db:seed           Seed demo user and catalog
npm run smoke:postgres    Verify login, full agent flow, and restart recovery on PostgreSQL
npm run smoke:gemini      Exercise the live Gemini flow against a running API
npm run smoke:razorpay    Create a real Test Mode order against a running API
```

Smoke scripts use `SMOKE_BASE_URL`, defaulting to `http://localhost:3000`.

## Core safety rules

- Money is stored and compared as integer paise.
- Item price, shipping and tax must sum to the exact total.
- A hard violation always blocks and cannot be overridden.
- A dominated, unstable or materially unsupported choice requires review.
- Suspicious merchant wording alone is a warning, not proof of an attack.
- A replacement must pass every hard rule and still requires buyer confirmation.
- Orders are built from the stored permit, never from browser-submitted prices.
- A cart mismatch is recorded and stopped before the payment provider is called.
- Receipts are tamper-evident HMAC records; they are not immutable ledgers.

## Database authority

When `DATABASE_URL` is configured outside tests, PostgreSQL is the source of truth. Prisma uses its PostgreSQL driver adapter so Neon connections use Node's maintained `pg` TLS stack. The complete session aggregate and normalized intent, offer, agent, evaluation, permit, payment, receipt and audit records are written transactionally. Active sessions can be restored through `GET /api/v1/sessions/:id/view` after a process restart.

Vitest uses an explicit in-memory repository so rule and API tests do not modify the developer database.

## Webhook setup

Configure Razorpay Test Mode to send events to:

```text
https://your-api.example/api/v1/webhooks/razorpay
```

Subscribe to:

- `payment.authorized`
- `payment.captured`
- `payment.failed`

The webhook handler verifies the HMAC over the unmodified raw request body and deduplicates event IDs.

## Security notes

- Never commit `.env`.
- Rotate any credential that has been pasted into chat, screenshots or logs.
- Use a pooled Neon URL for `DATABASE_URL` and the direct URL for migrations.
- Use long, independent JWT, permit and receipt secrets.
- The project reduces pre-payment agent risk; it does not claim to solve every prompt injection or identify the globally best product.

See [CLIENT_INTEGRATION.md](CLIENT_INTEGRATION.md) for the future chatbot contract and [openapi.yaml](openapi.yaml) for the API specification.
