import 'dotenv/config';
import { Client } from 'pg';
import { readFile, readdir } from 'node:fs/promises';
const client=new Client({connectionString:process.env.DIRECT_URL});
await client.connect();
try {
  await client.query('CREATE TABLE IF NOT EXISTS "_choiceproof_migrations" (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');
  const root=new URL('../prisma/migrations/',import.meta.url);
  const names=(await readdir(root,{withFileTypes:true})).filter(x=>x.isDirectory()).map(x=>x.name).sort();
  for(const name of names){
    const seen=await client.query('SELECT 1 FROM "_choiceproof_migrations" WHERE name=$1',[name]);
    if(seen.rowCount){console.log(`migration-already-applied ${name}`);continue;}
    await client.query('BEGIN');
    try{
      await client.query(await readFile(new URL(`../prisma/migrations/${name}/migration.sql`,import.meta.url),'utf8'));
      await client.query('INSERT INTO "_choiceproof_migrations"(name) VALUES($1)',[name]);
      await client.query('COMMIT');
      console.log(`migration-applied ${name}`);
    }catch(error){await client.query('ROLLBACK');throw error;}
  }
} finally { await client.end(); }
