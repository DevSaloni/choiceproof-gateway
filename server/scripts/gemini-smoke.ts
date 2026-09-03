import 'dotenv/config';

const base=process.env.SMOKE_BASE_URL||'http://localhost:3000';
async function api<T>(path:string,init:RequestInit={},token?:string):Promise<T>{const response=await fetch(`${base}${path}`,{...init,headers:{'content-type':'application/json',...(token?{authorization:`Bearer ${token}`}:{}) ,...(init.headers||{})}});const body=await response.json() as {success:boolean;data:T;error?:{message:string}};if(!response.ok)throw new Error(body.error?.message||`HTTP ${response.status}`);return body.data;}
const ready=await api<{aiMode:string}>('/ready');if(ready.aiMode!=='gemini')throw new Error('Start the API with AI_MODE=gemini before running this smoke test.');
const login=await api<{accessToken:string}>('/api/v1/auth/demo-login',{method:'POST',body:JSON.stringify({email:'demo@choiceproof.local',password:process.env.DEMO_USER_PASSWORD})});
const session=await api<{id:string}>('/api/v1/sessions',{method:'POST',body:JSON.stringify({scenarioId:null})},login.accessToken);
await api(`/api/v1/sessions/${session.id}/intent/parse`,{method:'POST',body:JSON.stringify({prompt:'Buy Nike running shoes, size UK 8, under ₹5,000, delivery within 4 days, and no subscription.'})},login.accessToken);
await api(`/api/v1/sessions/${session.id}/intent/confirm`,{method:'POST',body:'{}'},login.accessToken);
const result=await api<{normal:{productId:string};clean:{productId:string};evaluation:{decision:string;reasonCodes:string[]}}>(`/api/v1/sessions/${session.id}/agent/run`,{method:'POST'},login.accessToken);
console.log(JSON.stringify({sessionId:session.id,normalSelection:result.normal.productId,cleanSelection:result.clean.productId,decision:result.evaluation.decision,reasonCodes:result.evaluation.reasonCodes},null,2));
