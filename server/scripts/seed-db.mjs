import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { Client } from 'pg';
import { products } from '../dist/data/catalog.js';
const client=new Client({connectionString:process.env.DIRECT_URL});
await client.connect();
try { const hash=await bcrypt.hash(process.env.DEMO_USER_PASSWORD,12); await client.query('INSERT INTO "User" (id,email,"displayName","passwordHash") VALUES ($1,$2,$3,$4) ON CONFLICT (email) DO UPDATE SET "displayName"=EXCLUDED."displayName","passwordHash"=EXCLUDED."passwordHash"',['user_demo','demo@choiceproof.local','ChoiceProof Demo User',hash]); for(const p of products) await client.query('INSERT INTO "Product" (id,"catalogId","catalogVersion",merchant,sku,"dataJson",active) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT ("catalogVersion",sku) DO UPDATE SET "dataJson"=EXCLUDED."dataJson",active=EXCLUDED.active',[p.id,p.catalogId,'catalog_v1',p.merchant,p.sku,p,p.active]); console.log('seed-complete'); } finally { await client.end(); }
