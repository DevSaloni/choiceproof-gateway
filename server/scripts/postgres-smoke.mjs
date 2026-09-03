import 'dotenv/config';
import request from 'supertest';
import { createApp } from '../dist/app.js';
import { readEnv } from '../dist/config/env.js';
import { PrismaGatewayRepository } from '../dist/repositories/gateway.repository.js';

const env=readEnv({...process.env,AI_MODE:'fixture',PAYMENT_MODE:'mock',JWT_SECRET:'choiceproof-postgres-smoke-jwt-secret',PERMIT_SECRET:'choiceproof-postgres-smoke-permit-secret',RECEIPT_SECRET:'choiceproof-postgres-smoke-receipt-secret'});
const password=process.env.DEMO_USER_PASSWORD||'choiceproof-demo';

async function main(){
  if(!env.DATABASE_URL)throw new Error('DATABASE_URL is required.');
  const first=createApp({env,repository:new PrismaGatewayRepository()});
  const login=await request(first).post('/api/v1/auth/demo-login').send({email:'demo@choiceproof.local',password}).expect(200);
  const auth={Authorization:`Bearer ${login.body.data.accessToken}`};
  const created=await request(first).post('/api/v1/sessions').set(auth).send({scenarioId:'scenario_1'}).expect(201);
  const sessionId=created.body.data.id;
  await request(first).post(`/api/v1/sessions/${sessionId}/intent/parse`).set(auth).send({prompt:'Buy Nike running shoes, size UK 8, under ₹5,000, delivery within 4 days, and no subscription.'}).expect(200);
  await request(first).post(`/api/v1/sessions/${sessionId}/intent/confirm`).set(auth).send({}).expect(200);
  const run=await request(first).post(`/api/v1/sessions/${sessionId}/agent/run`).set(auth).send({}).expect(200);

  const restarted=createApp({env,repository:new PrismaGatewayRepository()});
  const restored=await request(restarted).get(`/api/v1/sessions/${sessionId}/view`).set(auth).expect(200);
  console.log(JSON.stringify({database:'ready',sessionRestored:true,decision:run.body.data.evaluation.decision,eligible:restored.body.data.offerSetState.eligible.length,excluded:restored.body.data.offerSetState.excluded.length,toolCalls:restored.body.data.agentRuns[0].toolCalls.length}));
}

main().then(()=>process.exit(0)).catch(error=>{console.error(error instanceof Error?error.message:error);process.exit(1);});
