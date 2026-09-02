import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { products } from '../src/data/catalog.js';

const prisma=new PrismaClient();
async function main(){const passwordHash=await bcrypt.hash(process.env.DEMO_USER_PASSWORD||'choiceproof-demo',12);await prisma.user.upsert({where:{email:'demo@choiceproof.local'},update:{displayName:'ChoiceProof Demo User',passwordHash},create:{email:'demo@choiceproof.local',displayName:'ChoiceProof Demo User',passwordHash}});for(const product of products){await prisma.product.upsert({where:{catalogVersion_sku:{catalogVersion:'catalog_v1',sku:product.sku}},update:{...product,catalogVersion:'catalog_v1',availableSizes:product.availableSizes},create:{...product,catalogVersion:'catalog_v1',availableSizes:product.availableSizes}});}}
main().then(()=>prisma.$disconnect()).catch(async error=>{console.error(error);await prisma.$disconnect();process.exit(1);});
