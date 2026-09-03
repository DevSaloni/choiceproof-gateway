# ChoiceProof Gateway

**Verify the choice. Bind the payment.**

ChoiceProof Gateway is a safety layer for AI shopping agents. Before an agent can create a payment, the gateway checks whether its selected product still satisfies the user’s confirmed requirements, whether a clearly better observed offer exists, and whether untrusted merchant-authored content changed the agent’s decision. An approved choice receives a short-lived, signed payment permit bound to the exact cart. Only then may the backend create a Razorpay order.

## Why it exists

Payment authorization answers, “May this agent pay for this cart?” ChoiceProof adds the preceding question: “Does this cart represent the choice the user approved?”

The prototype demonstrates three outcomes:

- **APPROVE:** The selection satisfies all hard requirements and remains stable when merchant descriptions are removed.
- **REVIEW:** The selection is technically valid but unstable, influenced by instruction-like content, or dominated by another observed offer.
- **BLOCK:** A hard requirement fails or the final payment cart differs from the permitted cart.

It also provides a guided conversation API and a **Safe Replacement Agent** that finds up to three hard-rule-compliant alternatives. Replacements never purchase automatically; the buyer must confirm one explicitly.

## Architecture

```text
User request
    ↓
Intent Lock (parse + human confirmation)
    ↓
Verified Offer Set
    ↓
Bounded AI tools: read intent + search + compare + submit
    ↓
AI selection: NORMAL + CLEAN
    ↓
ChoiceProof deterministic verification
    ↓
APPROVE / REVIEW / BLOCK
    ↓
Exact-cart signed permit
    ↓
Payment Guardian
    ↓
Razorpay Test Mode
    ↓
Signed audit receipt
```

Gemini may parse intent and select products, but it never decides whether payment is allowed. APPROVE, REVIEW, BLOCK, permit issuance, and cart validation are deterministic backend operations.

## Repository

```text
choiceproof-gateway/
├── client/   React/Vite demonstration interface
└── server/   Express, TypeScript, PostgreSQL, Gemini and Razorpay backend
```

The current backend work is isolated on `feat/choiceproof-backend`. No client files were changed during this phase.

## Backend capabilities

- Seeded demo authentication with JWT-protected routes.
- Persistent guided buyer-chat messages and intent drafts.
- Bounded shopping-agent runs with stored tool-call traces.
- Fixture and Gemini AI provider modes.
- Intent parsing and explicit confirmation.
- Catalog filtering with exclusion reason codes.
- NORMAL versus CLEAN selection stability analysis.
- Deterministic hard-constraint verification.
- User-relevant Pareto/better-offer detection.
- Merchant instruction-like content scanning.
- Explicit review override or alternative selection.
- Deterministic safe-replacement discovery and confirmation.
- HMAC-SHA256 exact-cart payment permits.
- Permit expiry, reservation, cart-mutation detection, and idempotency controls.
- Mock and Razorpay Test Mode payment providers.
- Payment callback signature verification.
- Raw-body Razorpay webhook signature verification.
- Signed, tamper-evident audit receipts.
- Receipt verification endpoint.
- PostgreSQL-authoritative session recovery after process restarts.
- Neon PostgreSQL schema, migration runner, seed data, and normalized audit records.

## Local setup

Requirements: Node.js 20+, npm, and a PostgreSQL or Neon database.

```powershell
cd server
Copy-Item .env.example .env
npm install
npm run db:apply
npm run build
npm run db:seed
npm run dev
```

Configure `server/.env`:

```env
DATABASE_URL="postgresql://pooled-runtime-connection"
DIRECT_URL="postgresql://direct-migration-connection"
JWT_SECRET="long-random-secret"
DEMO_USER_PASSWORD="your-demo-password"
PERMIT_SECRET="long-random-secret"
RECEIPT_SECRET="long-random-secret"
AI_MODE=fixture
PAYMENT_MODE=mock
```

For live providers, set `AI_MODE=gemini` with `GEMINI_API_KEY`, or `PAYMENT_MODE=razorpay` with Razorpay Test Mode credentials. Provider failures never silently fall back to fixture/mock mode.

## Demo flow

1. `POST /api/v1/auth/demo-login`
2. Create a shopping session.
3. Send guided buyer messages and confirm requirements.
4. Run the bounded shopping agent.
5. Freeze the offer set and produce NORMAL/CLEAN selections.
6. Run deterministic ChoiceProof evaluation and generate safe replacements when required.
7. Resolve REVIEW if necessary.
8. Issue an exact-cart permit.
9. Submit the candidate cart to Payment Guardian.
10. Create and verify the payment, then retrieve the receipt and audit timeline.

See [server/openapi.yaml](server/openapi.yaml) and [server/CLIENT_INTEGRATION.md](server/CLIENT_INTEGRATION.md) for API and frontend-integration details.

## Verification

```powershell
cd server
npm run typecheck
npm run build
npm test
```

The automated suite covers the three headline demos, guided chat, tool traces, safe replacements, receipts, idempotency, and a 40-case deterministic evaluation. Real Gemini and Razorpay smoke tests require their respective credentials.

## Security boundaries

- AI providers never receive payment credentials.
- Razorpay secrets remain server-side.
- Payment orders are constructed from stored permit values, not frontend cart values.
- Money is represented in integer paise.
- Merchant descriptions are treated as untrusted data.
- Receipts are signed and tamper-evident; they are not claimed to be immutable.
- This prototype reduces agentic-commerce decision risk; it does not claim to detect every prompt injection or prove a globally optimal product choice.

## Current product boundary

The judged backend uses one seeded running-shoe catalog and one demo user. It does not scrape external marketplaces, provide merchant onboarding, prove a globally optimal product, or give the AI direct payment authority.
