import { z } from 'zod';

const placeholder=/replace-with|change-me/i;
const schema=z.object({
  NODE_ENV:z.enum(['development','test','production']).default('development'),
  PORT:z.coerce.number().int().positive().default(3000),
  CORS_ORIGIN:z.string().default('http://localhost:5173'),
  DATABASE_URL:z.string().optional(),
  DIRECT_URL:z.string().optional(),
  JWT_SECRET:z.string().min(16).default('choiceproof-development-jwt-secret-change-me'),
  JWT_EXPIRES_IN:z.string().default('12h'),
  DEMO_USER_PASSWORD:z.string().min(1).default('choiceproof-demo'),
  AI_MODE:z.enum(['fixture','gemini']).default('fixture'),
  GEMINI_API_KEY:z.string().optional(),
  GEMINI_MODEL:z.string().default('gemini-3.7-flash'),
  GEMINI_TIMEOUT_MS:z.coerce.number().int().positive().default(20000),
  AGENT_MAX_TOOL_CALLS:z.coerce.number().int().min(4).max(12).default(6),
  PAYMENT_MODE:z.enum(['mock','razorpay']).default('mock'),
  RAZORPAY_KEY_ID:z.string().optional(),
  RAZORPAY_KEY_SECRET:z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET:z.string().optional(),
  PERMIT_SECRET:z.string().min(16).default('choiceproof-development-permit-secret-change-me'),
  RECEIPT_SECRET:z.string().min(16).default('choiceproof-development-receipt-secret-change-me'),
  LOG_LEVEL:z.string().default('info')
});

export type AppEnv=z.infer<typeof schema>;

export function readEnv(source:NodeJS.ProcessEnv=process.env):AppEnv{
  const input=source.NODE_ENV==='test'?{...source,JWT_SECRET:'choiceproof-test-jwt-secret',PERMIT_SECRET:'choiceproof-test-permit-secret',RECEIPT_SECRET:'choiceproof-test-receipt-secret',AI_MODE:'fixture',PAYMENT_MODE:'mock'}:source;
  const env=schema.parse(input);
  if(env.AI_MODE==='gemini'&&!env.GEMINI_API_KEY)throw new Error('AI_MODE=gemini requires GEMINI_API_KEY.');
  if(env.PAYMENT_MODE==='razorpay'&&(!env.RAZORPAY_KEY_ID||!env.RAZORPAY_KEY_SECRET))throw new Error('PAYMENT_MODE=razorpay requires Razorpay credentials.');
  if(env.NODE_ENV==='production'){
    if(!env.DATABASE_URL)throw new Error('Production requires DATABASE_URL.');
    for(const [name,value] of [['JWT_SECRET',env.JWT_SECRET],['PERMIT_SECRET',env.PERMIT_SECRET],['RECEIPT_SECRET',env.RECEIPT_SECRET]] as const){
      if(value.length<32||placeholder.test(value))throw new Error(`Production requires a non-placeholder ${name} of at least 32 characters.`);
    }
    if(env.PAYMENT_MODE==='mock')throw new Error('Production cannot use mock payments.');
  }
  return env;
}
