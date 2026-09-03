# Buyer chatbot integration contract

The server is authoritative. The future React chatbot should store only the bearer token, active session ID, unsent text and visual loading state.

## Recommended flow

1. Login with `POST /auth/demo-login`.
2. Create a normal session with `{ "scenarioId": null }`.
3. Render the initial assistant message returned by the session.
4. Send each buyer message to `/sessions/:id/messages` with a UUID `clientMessageId`.
5. Follow `actionRequired`: continue asking questions or display intent confirmation.
6. Confirm the structured intent.
7. Call `/sessions/:id/agent/run` once.
8. Render `APPROVE`, `REVIEW`, or `BLOCK` from the evaluation; never infer it in the browser.
9. For review/block, render only replacements returned by the backend.
10. Issue a permit only after approval, submit its exact cart, then open Razorpay Checkout.
11. Send the Razorpay callback fields to `/payments/verify`.
12. Restore any page using `/sessions/:id/view`.

## Chat response actions

```text
ANSWER_QUESTION   Keep the composer active and show the assistant question
CONFIRM_INTENT    Render the editable Intent Lock card
```

Agent-run actions:

```text
ISSUE_PERMIT
CHOOSE_REPLACEMENT
CONTINUE_WITH_SELECTED
CANCEL
```

The UI must not expose `CONTINUE_WITH_SELECTED` for a `BLOCK`; the server rejects it regardless.

## Money and security

- Backend amounts are integer paise; convert only for display.
- Use `permit.cart` verbatim as `candidateCart`.
- Generate a new UUID idempotency key for a new checkout attempt.
- Reuse the same key only when retrying the identical request.
- Never store Razorpay secrets in Vite variables.
- Show provider modes returned by `/ready` so fixture/mock demonstrations are clearly labelled.

## Current-client compatibility

The existing dashboard may continue using:

```text
intent/parse → intent/confirm → catalog → agent/select → evaluate
```

The future Concierge should use:

```text
messages → intent/confirm → agent/run
```

Both paths produce the same evaluation, permit and payment objects.
