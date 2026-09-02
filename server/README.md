# ChoiceProof Gateway backend

The backend verifies an AI shopping choice against confirmed requirements, detects unstable selections and dominated offers, then binds payment to a short-lived exact-cart permit.

## Start

1. Copy `.env.example` to `.env` and set secrets. Set `DATABASE_URL` to Neon’s pooled URL and `DIRECT_URL` to its direct URL.
2. Run `npm install`, `npm run db:apply`, `npm run build`, `npm run db:seed`, then `npm run dev`.
3. `POST /api/v1/auth/demo-login` with the demo user, then use the bearer token for all session routes.

The deterministic fixture modes reproduce three scenarios: clean approval, review for unstable/influenced selection, and an exact-cart mutation blocked before any payment order is created. `PAYMENT_MODE=razorpay` uses Razorpay Test Mode and requires its key ID/secret. The client directory is deliberately unchanged.

## Guarantees and limits

- Gemini (when enabled in a production provider build) may parse/select, but deterministic code decides APPROVE/REVIEW/BLOCK.
- Merchant text is untrusted; text-risk is a warning, while instability or an observed better option triggers review.
- The permit binds merchant, SKU, quantity, cart hash, currency, and exact paise amount for five minutes.
- Signed receipts are tamper-evident HMAC records, not immutable storage.

## Commands

```text
npm run dev          Start the development server
npm run typecheck    Validate TypeScript
npm run build        Compile production output
npm test             Run unit and API tests
npm run db:apply     Apply the checked-in SQL migration
npm run db:seed      Seed the demo account and catalog
```

The local `.env` file is ignored. Never commit database, Gemini, Razorpay, JWT, permit, or receipt secrets.
