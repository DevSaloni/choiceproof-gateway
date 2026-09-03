ALTER TABLE "ShoppingSession" ALTER COLUMN "scenarioId" DROP NOT NULL;
ALTER TABLE "ShoppingSession" ADD COLUMN IF NOT EXISTS "currentIntentVersion" integer NOT NULL DEFAULT 0;
ALTER TABLE "ShoppingSession" ADD COLUMN IF NOT EXISTS "failureCode" text;
ALTER TABLE "ShoppingSession" ADD COLUMN IF NOT EXISTS "stateJson" jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE "ShoppingSession" ADD COLUMN IF NOT EXISTS "lastActivityAt" timestamptz NOT NULL DEFAULT now();

ALTER TABLE "UserIntent" ADD COLUMN IF NOT EXISTS "missingFieldsJson" jsonb;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "createdAt" timestamptz NOT NULL DEFAULT now();
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "updatedAt" timestamptz NOT NULL DEFAULT now();
ALTER TABLE "OfferSet" ADD COLUMN IF NOT EXISTS "eligibleProductIdsJson" jsonb;
ALTER TABLE "OfferSet" ADD COLUMN IF NOT EXISTS "excludedProductsJson" jsonb;

ALTER TABLE "AgentDecision" ADD COLUMN IF NOT EXISTS "agentRunId" text;
ALTER TABLE "AgentDecision" ADD COLUMN IF NOT EXISTS "intentId" text;
ALTER TABLE "AgentDecision" ADD COLUMN IF NOT EXISTS "offerSetId" text;
ALTER TABLE "AgentDecision" ADD COLUMN IF NOT EXISTS "provider" text NOT NULL DEFAULT 'fixture';
ALTER TABLE "AgentDecision" ADD COLUMN IF NOT EXISTS "model" text NOT NULL DEFAULT 'fixture';
ALTER TABLE "AgentDecision" ADD COLUMN IF NOT EXISTS "promptVersion" text NOT NULL DEFAULT 'v1';

CREATE TABLE IF NOT EXISTS "AgentRun" (
  "id" text PRIMARY KEY,
  "sessionId" text NOT NULL REFERENCES "ShoppingSession"("id") ON DELETE CASCADE,
  "intentId" text,
  "offerSetId" text,
  "provider" text NOT NULL,
  "model" text NOT NULL,
  "promptVersion" text NOT NULL,
  "status" text NOT NULL,
  "failureCode" text,
  "startedAt" timestamptz NOT NULL,
  "completedAt" timestamptz
);
CREATE TABLE IF NOT EXISTS "AgentToolCall" (
  "id" text PRIMARY KEY,
  "agentRunId" text NOT NULL REFERENCES "AgentRun"("id") ON DELETE CASCADE,
  "sequence" integer NOT NULL,
  "toolName" text NOT NULL,
  "inputJson" jsonb NOT NULL,
  "outputJson" jsonb NOT NULL,
  "status" text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  UNIQUE("agentRunId", "sequence")
);
CREATE TABLE IF NOT EXISTS "ChatMessage" (
  "id" text PRIMARY KEY,
  "sessionId" text NOT NULL REFERENCES "ShoppingSession"("id") ON DELETE CASCADE,
  "clientMessageId" text,
  "sequence" integer NOT NULL,
  "role" text NOT NULL,
  "kind" text NOT NULL,
  "text" text NOT NULL,
  "structuredDataJson" jsonb,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  UNIQUE("sessionId", "sequence"),
  UNIQUE("sessionId", "clientMessageId")
);
DO $$ BEGIN
  ALTER TABLE "AgentDecision" ADD CONSTRAINT "AgentDecision_agentRunId_fkey" FOREIGN KEY ("agentRunId") REFERENCES "AgentRun"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "ChoiceProofEvaluation" ADD COLUMN IF NOT EXISTS "intentId" text;
ALTER TABLE "ChoiceProofEvaluation" ADD COLUMN IF NOT EXISTS "offerSetId" text;
ALTER TABLE "ChoiceProofEvaluation" ADD COLUMN IF NOT EXISTS "normalDecisionId" text;
ALTER TABLE "ChoiceProofEvaluation" ADD COLUMN IF NOT EXISTS "cleanDecisionId" text;

ALTER TABLE "ExecutionPermit" ADD COLUMN IF NOT EXISTS "intentVersion" integer NOT NULL DEFAULT 1;
ALTER TABLE "ExecutionPermit" ADD COLUMN IF NOT EXISTS "offerSetHash" text NOT NULL DEFAULT '';
ALTER TABLE "ExecutionPermit" ADD COLUMN IF NOT EXISTS "productId" text NOT NULL DEFAULT '';
ALTER TABLE "ExecutionPermit" ADD COLUMN IF NOT EXISTS "merchant" text NOT NULL DEFAULT '';
ALTER TABLE "ExecutionPermit" ADD COLUMN IF NOT EXISTS "sku" text NOT NULL DEFAULT '';
ALTER TABLE "ExecutionPermit" ADD COLUMN IF NOT EXISTS "quantity" integer NOT NULL DEFAULT 1;
ALTER TABLE "ExecutionPermit" ADD COLUMN IF NOT EXISTS "amountPaise" integer NOT NULL DEFAULT 0;
ALTER TABLE "ExecutionPermit" ADD COLUMN IF NOT EXISTS "currency" text NOT NULL DEFAULT 'INR';
ALTER TABLE "ExecutionPermit" ADD COLUMN IF NOT EXISTS "issuedAt" timestamptz NOT NULL DEFAULT now();
ALTER TABLE "ExecutionPermit" ADD COLUMN IF NOT EXISTS "reservationPaymentId" text;

ALTER TABLE "Payment" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Payment" ALTER COLUMN "status" TYPE text USING "status"::text;
ALTER TABLE "Payment" ALTER COLUMN "status" SET DEFAULT 'CREATING';
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "requestHash" text NOT NULL DEFAULT '';
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "failureCode" text;

ALTER TABLE "Receipt" ADD COLUMN IF NOT EXISTS "evaluationId" text;
ALTER TABLE "Receipt" ADD COLUMN IF NOT EXISTS "permitId" text;
ALTER TABLE "Receipt" ADD COLUMN IF NOT EXISTS "paymentId" text;
ALTER TABLE "Receipt" ADD COLUMN IF NOT EXISTS "status" text NOT NULL DEFAULT 'CREATED';

ALTER TABLE "AuditEvent" ADD COLUMN IF NOT EXISTS "entityType" text;
ALTER TABLE "AuditEvent" ADD COLUMN IF NOT EXISTS "entityId" text;

CREATE INDEX IF NOT EXISTS "ShoppingSession_userId_updatedAt_idx" ON "ShoppingSession"("userId", "updatedAt");
CREATE INDEX IF NOT EXISTS "Payment_providerOrderId_idx" ON "Payment"("providerOrderId");
CREATE INDEX IF NOT EXISTS "Receipt_sessionId_createdAt_idx" ON "Receipt"("sessionId", "createdAt");
