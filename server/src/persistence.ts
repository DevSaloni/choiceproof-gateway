import { Pool } from 'pg';
import type { Session } from './types.js';
import { sha256 } from './utils/crypto.js';
const connectionString=process.env.DATABASE_URL;
const pool=connectionString?new Pool({connectionString,max:4}):undefined;
export async function persistSession(s:Session){
  if(!pool)return;
  const client=await pool.connect();
  try { await client.query('BEGIN');
    await client.query('INSERT INTO "ShoppingSession" (id,"userId","scenarioId",status,"aiMode","paymentMode") VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO UPDATE SET status=EXCLUDED.status,"updatedAt"=now()',[s.id,s.userId,s.scenarioId,s.status,process.env.AI_MODE||'fixture',process.env.PAYMENT_MODE||'mock']);
    if(s.intent) await client.query('INSERT INTO "UserIntent" (id,"sessionId",version,"rawPrompt","rulesJson",status,"intentHash","confirmedAt") VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT ("sessionId",version) DO UPDATE SET "rulesJson"=EXCLUDED."rulesJson",status=EXCLUDED.status,"confirmedAt"=EXCLUDED."confirmedAt"',[`${s.id}_intent_${s.intent.version}`,s.id,s.intent.version,s.intent.rawPrompt,s.intent,s.intent.confirmed?'CONFIRMED':'PARSED',sha256(s.intent),s.intent.confirmed?new Date():null]);
    if(s.offerSet) await client.query('INSERT INTO "OfferSet" (id,"sessionId","catalogVersion","offerSetHash","offersJson") VALUES($1,$2,$3,$4,$5) ON CONFLICT (id) DO UPDATE SET "offersJson"=EXCLUDED."offersJson"',[`${s.id}_offers`,s.id,'catalog_v1',sha256(s.offerSet),s.offerSet]);
    for(const d of [s.normal,s.clean]) if(d) await client.query('INSERT INTO "AgentDecision" (id,"sessionId",mode,"selectedProductId","decisionJson") VALUES($1,$2,$3,$4,$5) ON CONFLICT (id) DO NOTHING',[d.id,s.id,d.mode,d.productId,d]);
    if(s.evaluation) await client.query('INSERT INTO "ChoiceProofEvaluation" (id,"sessionId","selectedProductId",decision,"evaluationJson") VALUES($1,$2,$3,$4,$5) ON CONFLICT (id) DO UPDATE SET decision=EXCLUDED.decision,"evaluationJson"=EXCLUDED."evaluationJson","updatedAt"=now()',[s.evaluation.id,s.id,s.evaluation.selectedProductId,s.evaluation.decision,s.evaluation]);
    if(s.permit) await client.query('INSERT INTO "ExecutionPermit" (id,"sessionId","evaluationId","cartJson","cartHash",signature,nonce,"expiresAt",status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (id) DO UPDATE SET status=EXCLUDED.status,"reservedAt"=CASE WHEN EXCLUDED.status=\'RESERVED\' THEN now() ELSE "ExecutionPermit"."reservedAt" END,"usedAt"=CASE WHEN EXCLUDED.status=\'USED\' THEN now() ELSE "ExecutionPermit"."usedAt" END',[s.permit.id,s.id,s.permit.evaluationId,s.permit.cart,s.permit.cartHash,s.permit.signature,s.permit.nonce,new Date(s.permit.expiresAt),s.permit.status]);
    for(const p of s.payments) await client.query('INSERT INTO "Payment" (id,"sessionId","permitId","idempotencyKey",provider,"providerOrderId","amountPaise",currency,status,"paymentSignatureVerified","webhookVerified") VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT (id) DO UPDATE SET status=EXCLUDED.status,"paymentSignatureVerified"=EXCLUDED."paymentSignatureVerified","webhookVerified"=EXCLUDED."webhookVerified"',[p.id,s.id,p.permitId,p.idempotencyKey,p.provider,p.providerOrderId,p.amountPaise,p.currency,p.status,p.paymentSignatureVerified,p.webhookVerified]);
    for(const event of s.audit) await client.query('INSERT INTO "AuditEvent" (id,"sessionId",actor,"eventType","metadataJson") VALUES($1,$2,$3,$4,$5) ON CONFLICT (id) DO NOTHING',[sha256({sessionId:s.id,...event}),s.id,event.actor,event.event,event.metadata??null]);
    await client.query('COMMIT');
  } catch(error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
}
