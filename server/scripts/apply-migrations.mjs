import 'dotenv/config';
import { Client } from 'pg';
import { readFile } from 'node:fs/promises';
const client=new Client({connectionString:process.env.DIRECT_URL});
await client.connect();
try { await client.query('BEGIN'); await client.query('CREATE TABLE IF NOT EXISTS "_choiceproof_migrations" (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())'); const name='202609020001_init_choiceproof'; const seen=await client.query('SELECT 1 FROM "_choiceproof_migrations" WHERE name=$1',[name]); if(!seen.rowCount){await client.query(await readFile(new URL('../prisma/migrations/202609020001_init_choiceproof/migration.sql',import.meta.url),'utf8'));await client.query('INSERT INTO "_choiceproof_migrations"(name) VALUES($1)',[name]);console.log('migration-applied');}else console.log('migration-already-applied'); await client.query('COMMIT'); } catch(error) { await client.query('ROLLBACK'); throw error; } finally { await client.end(); }
