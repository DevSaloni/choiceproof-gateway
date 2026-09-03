import 'dotenv/config';

const base=process.env.SMOKE_BASE_URL||'http://localhost:3000';
async function api<T>(path:string,init:RequestInit={},token?:string):Promise<T>{const response=await fetch(`${base}${path}`,{...init,headers:{'content-type':'application/json',...(token?{authorization:`Bearer ${token}`}:{}) ,...(init.headers||{})}});const body=await response.json() as {success:boolean;data:T;error?:{message:string}};if(!response.ok)throw new Error(body.error?.message||`HTTP ${response.status}`);return body.data;}
const ready=await api<{paymentMode:string}>('/ready');if(ready.paymentMode!=='razorpay')throw new Error('Start the API with PAYMENT_MODE=razorpay before running this smoke test.');
const login=await api<{accessToken:string}>('/api/v1/auth/demo-login',{method:'POST',body:JSON.stringify({email:'demo@choiceproof.local',password:process.env.DEMO_USER_PASSWORD})});
const session=await api<{id:string}>('/api/v1/sessions',{method:'POST',body:JSON.stringify({scenarioId:'scenario_1'})},login.accessToken);
await api(`/api/v1/sessions/${session.id}/intent/parse`,{method:'POST',body:JSON.stringify({prompt:'Buy Nike running shoes, size UK 8, under ₹5,000, delivery within 4 days, and no subscription.'})},login.accessToken);
await api(`/api/v1/sessions/${session.id}/intent/confirm`,{method:'POST',body:'{}'},login.accessToken);
const run=await api<{evaluation:{id:string;decision:string}}>(`/api/v1/sessions/${session.id}/agent/run`,{method:'POST'},login.accessToken);if(run.evaluation.decision!=='APPROVE')throw new Error(`Smoke choice was not approved: ${run.evaluation.decision}`);
const permit=await api<{id:string;cart:unknown}>(`/api/v1/evaluations/${run.evaluation.id}/permit`,{method:'POST'},login.accessToken);
const order=await api<{providerOrderId:string;amountPaise:number;currency:string}>(`/api/v1/permits/${permit.id}/create-order`,{method:'POST',body:JSON.stringify({idempotencyKey:crypto.randomUUID(),candidateCart:permit.cart})},login.accessToken);
console.log(JSON.stringify({sessionId:session.id,permitId:permit.id,providerOrderId:order.providerOrderId,amountPaise:order.amountPaise,currency:order.currency},null,2));
