import 'dotenv/config';
import { createApp } from './app.js';
import { readEnv } from './config/env.js';
const env=readEnv();
const server=createApp({env}).listen(env.PORT,()=>console.log(`ChoiceProof Gateway API listening on ${env.PORT}`));
const shutdown=()=>server.close(()=>process.exit(0));
process.on('SIGTERM',shutdown);process.on('SIGINT',shutdown);
