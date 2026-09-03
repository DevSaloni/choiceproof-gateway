import bcrypt from 'bcryptjs';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { products as fixtureProducts } from '../data/catalog.js';
import type { AuditEntry, Payment, Product, Receipt, Session, StoredUser } from '../types.js';

const asJson=(value:unknown)=>JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
const knownSessionStatus=new Set(['CREATED','INTENT_PARSED','INTENT_CONFIRMED','CATALOG_READY','PRODUCT_SELECTED','REVIEW_PENDING','APPROVED','PERMIT_ISSUED','ORDER_CREATED','PAYMENT_VERIFIED','BLOCKED','CANCELLED']);
const dbStatus=(status:string)=>(knownSessionStatus.has(status)?status:'CREATED') as never;

export interface GatewayRepository {
  getUserByEmail(email:string):Promise<StoredUser|undefined>;
  getSession(id:string):Promise<Session|undefined>;
  createSession(session:Session):Promise<void>;
  saveSession(session:Session):Promise<void>;
  deleteSession(id:string):Promise<void>;
  getProducts():Promise<Product[]>;
  findSessionByEvaluationId(id:string):Promise<Session|undefined>;
  findSessionByPermitId(id:string):Promise<Session|undefined>;
  findSessionByProviderOrderId(id:string):Promise<Session|undefined>;
  reservePermit(sessionId:string,permitId:string,paymentId:string):Promise<boolean>;
  recordWebhook(input:{providerEventId:string;eventType:string;signature:string;payloadHash:string}):Promise<boolean>;
}

export class MemoryGatewayRepository implements GatewayRepository{
  private sessions=new Map<string,Session>();
  private webhooks=new Set<string>();
  private user:StoredUser={id:'user_demo',email:'demo@choiceproof.local',displayName:'ChoiceProof Demo User',passwordHash:bcrypt.hashSync(process.env.DEMO_USER_PASSWORD||'choiceproof-demo',10)};
  async getUserByEmail(email:string){return email===this.user.email?this.user:undefined;}
  async getSession(id:string){return this.sessions.get(id);}
  async createSession(session:Session){this.sessions.set(session.id,structuredClone(session));}
  async saveSession(session:Session){session.updatedAt=new Date().toISOString();this.sessions.set(session.id,structuredClone(session));}
  async deleteSession(id:string){this.sessions.delete(id);}
  async getProducts(){return structuredClone(fixtureProducts);}
  async findSessionByEvaluationId(id:string){return [...this.sessions.values()].find(x=>x.evaluation?.id===id);}
  async findSessionByPermitId(id:string){return [...this.sessions.values()].find(x=>x.permit?.id===id);}
  async findSessionByProviderOrderId(id:string){return [...this.sessions.values()].find(x=>x.payments.some(p=>p.providerOrderId===id));}
  async reservePermit(sessionId:string,permitId:string,paymentId:string){const session=this.sessions.get(sessionId);if(!session?.permit||session.permit.id!==permitId||session.permit.status!=='ISSUED')return false;session.permit.status='RESERVED';(session.permit as unknown as {reservationPaymentId?:string}).reservationPaymentId=paymentId;await this.saveSession(session);return true;}
  async recordWebhook(input:{providerEventId:string}){if(this.webhooks.has(input.providerEventId))return false;this.webhooks.add(input.providerEventId);return true;}
}

export class PrismaGatewayRepository implements GatewayRepository{
  constructor(private readonly prisma=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL!})})){}
  async getUserByEmail(email:string){const value=await this.prisma.user.findUnique({where:{email}});return value??undefined;}
  async getSession(id:string){const row=await this.prisma.shoppingSession.findUnique({where:{id}});return row?row.stateJson as unknown as Session:undefined;}
  async createSession(session:Session){await this.prisma.shoppingSession.create({data:{id:session.id,userId:session.userId,scenarioId:session.scenarioId,status:dbStatus(session.status),aiMode:session.aiMode,paymentMode:session.paymentMode,currentIntentVersion:session.currentIntentVersion,stateJson:asJson(session),lastActivityAt:new Date(session.updatedAt)} as never});}
  async saveSession(session:Session){session.updatedAt=new Date().toISOString();await this.prisma.$transaction(async tx=>{
    await tx.shoppingSession.upsert({where:{id:session.id},create:{id:session.id,userId:session.userId,scenarioId:session.scenarioId,status:dbStatus(session.status),aiMode:session.aiMode,paymentMode:session.paymentMode,currentIntentVersion:session.currentIntentVersion,failureCode:session.failureCode,stateJson:asJson(session),lastActivityAt:new Date(session.updatedAt)} as never,update:{scenarioId:session.scenarioId,status:dbStatus(session.status),currentIntentVersion:session.currentIntentVersion,failureCode:session.failureCode,stateJson:asJson(session),lastActivityAt:new Date(session.updatedAt)} as never});
    if(session.intent){if(session.intent.confirmed)await tx.userIntent.updateMany({where:{sessionId:session.id,version:{lt:session.intent.version},status:'CONFIRMED'},data:{status:'SUPERSEDED'}});await tx.userIntent.upsert({where:{sessionId_version:{sessionId:session.id,version:session.intent.version}},create:{id:`${session.id}_intent_${session.intent.version}`,sessionId:session.id,version:session.intent.version,rawPrompt:session.intent.rawPrompt,rulesJson:asJson(session.intent),missingFieldsJson:asJson([]),status:session.intent.confirmed?'CONFIRMED':'PARSED',intentHash:session.intent.intentHash||'',confirmedAt:session.intent.confirmed?new Date():null},update:{rulesJson:asJson(session.intent),status:session.intent.confirmed?'CONFIRMED':'PARSED',intentHash:session.intent.intentHash||'',confirmedAt:session.intent.confirmed?new Date():null}});}
    for(const chat of session.messages)await tx.chatMessage.upsert({where:{id:chat.id},create:{id:chat.id,sessionId:session.id,clientMessageId:chat.clientMessageId,sequence:chat.sequence,role:chat.role,kind:chat.kind,text:chat.text,structuredDataJson:chat.structuredData?asJson(chat.structuredData):undefined,createdAt:new Date(chat.createdAt)},update:{text:chat.text,structuredDataJson:chat.structuredData?asJson(chat.structuredData):undefined}});
    if(session.offerSetState)await tx.offerSet.upsert({where:{id:session.offerSetState.id},create:{id:session.offerSetState.id,sessionId:session.id,catalogVersion:session.offerSetState.catalogVersion,offerSetHash:session.offerSetState.hash,offersJson:asJson(session.offerSetState.eligible),eligibleProductIdsJson:asJson(session.offerSetState.eligible.map(x=>x.id)),excludedProductsJson:asJson(session.offerSetState.excluded)},update:{offerSetHash:session.offerSetState.hash,offersJson:asJson(session.offerSetState.eligible),eligibleProductIdsJson:asJson(session.offerSetState.eligible.map(x=>x.id)),excludedProductsJson:asJson(session.offerSetState.excluded)}});
    for(const run of session.agentRuns){await tx.agentRun.upsert({where:{id:run.id},create:{id:run.id,sessionId:session.id,intentId:session.intent?`${session.id}_intent_${session.intent.version}`:null,offerSetId:session.offerSetState?.id,provider:run.provider,model:run.model,promptVersion:run.promptVersion,status:run.status,failureCode:run.failureCode,startedAt:new Date(run.startedAt),completedAt:run.completedAt?new Date(run.completedAt):null},update:{status:run.status,failureCode:run.failureCode,completedAt:run.completedAt?new Date(run.completedAt):null}});for(const call of run.toolCalls)await tx.agentToolCall.upsert({where:{id:call.id},create:{id:call.id,agentRunId:run.id,sequence:call.sequence,toolName:call.toolName,inputJson:asJson(call.input),outputJson:asJson(call.output),status:call.status,createdAt:new Date(call.createdAt)},update:{outputJson:asJson(call.output),status:call.status}});}
    for(const decision of [session.normal,session.clean].filter(Boolean)){const d=decision!;const run=session.agentRuns.at(-1);await tx.agentDecision.upsert({where:{id:d.id},create:{id:d.id,sessionId:session.id,agentRunId:run?.id,intentId:session.intent?`${session.id}_intent_${session.intent.version}`:null,offerSetId:session.offerSetState?.id,mode:d.mode,selectedProductId:d.productId,decisionJson:asJson(d),provider:d.provider,model:run?.model||d.provider,promptVersion:run?.promptVersion||'v1'},update:{selectedProductId:d.productId,decisionJson:asJson(d)}});}
    if(session.evaluation)await tx.choiceProofEvaluation.upsert({where:{id:session.evaluation.id},create:{id:session.evaluation.id,sessionId:session.id,selectedProductId:session.evaluation.selectedProductId,intentId:session.intent?`${session.id}_intent_${session.intent.version}`:null,offerSetId:session.offerSetState?.id,normalDecisionId:session.normal?.id,cleanDecisionId:session.clean?.id,decision:session.evaluation.decision,evaluationJson:asJson(session.evaluation)},update:{selectedProductId:session.evaluation.selectedProductId,decision:session.evaluation.decision,evaluationJson:asJson(session.evaluation)}});
    if(session.permit)await tx.executionPermit.upsert({where:{id:session.permit.id},create:{id:session.permit.id,sessionId:session.id,evaluationId:session.permit.evaluationId,intentVersion:session.permit.intentVersion,offerSetHash:session.permit.offerSetHash,productId:session.permit.productId,merchant:session.permit.cart.merchant,sku:session.permit.cart.sku,quantity:session.permit.cart.quantity,amountPaise:session.permit.cart.amountPaise,currency:session.permit.cart.currency,cartJson:asJson(session.permit.cart),cartHash:session.permit.cartHash,signature:session.permit.signature,nonce:session.permit.nonce,issuedAt:new Date(session.permit.issuedAt),expiresAt:new Date(session.permit.expiresAt),status:session.permit.status,reservedAt:session.permit.status==='RESERVED'?new Date():null,usedAt:session.permit.status==='USED'?new Date():null},update:{status:session.permit.status,reservedAt:session.permit.status==='RESERVED'?new Date():undefined,usedAt:session.permit.status==='USED'?new Date():undefined}});
    for(const payment of session.payments)await tx.payment.upsert({where:{id:payment.id},create:{id:payment.id,sessionId:session.id,permitId:payment.permitId,idempotencyKey:payment.idempotencyKey,requestHash:payment.requestHash||'',provider:payment.provider,providerOrderId:payment.providerOrderId||null,providerPaymentId:payment.providerPaymentId||null,amountPaise:payment.amountPaise,currency:payment.currency,status:payment.status,paymentSignatureVerified:payment.paymentSignatureVerified,webhookVerified:payment.webhookVerified,failureCode:payment.failureCode},update:{providerOrderId:payment.providerOrderId||null,providerPaymentId:payment.providerPaymentId||null,status:payment.status,paymentSignatureVerified:payment.paymentSignatureVerified,webhookVerified:payment.webhookVerified,failureCode:payment.failureCode}});
    for(const receipt of session.receipts)await tx.receipt.upsert({where:{id:receipt.id},create:{id:receipt.id,sessionId:session.id,evaluationId:session.evaluation?.id,permitId:session.permit?.id,paymentId:session.payments.at(-1)?.id,kind:receipt.kind,status:'CREATED',receiptJson:asJson(receipt),receiptHash:receipt.receiptHash,receiptSignature:receipt.receiptSignature,createdAt:new Date(receipt.signedAt)},update:{receiptJson:asJson(receipt),receiptHash:receipt.receiptHash,receiptSignature:receipt.receiptSignature}});
    for(const event of session.audit)await tx.auditEvent.upsert({where:{id:event.id},create:{id:event.id,sessionId:session.id,actor:event.actor,eventType:event.event,entityType:event.entityType,entityId:event.entityId,metadataJson:event.metadata?asJson(event.metadata):undefined,createdAt:new Date(event.at)},update:{}});
  },{maxWait:10_000,timeout:30_000});}
  async deleteSession(id:string){await this.prisma.shoppingSession.delete({where:{id}});}
  async getProducts(){const rows=await this.prisma.product.findMany({where:{active:true},orderBy:{id:'asc'}});return rows.map(row=>row.dataJson as unknown as Product);}
  async findSessionByEvaluationId(id:string){const row=await this.prisma.choiceProofEvaluation.findUnique({where:{id},select:{sessionId:true}});return row?this.getSession(row.sessionId):undefined;}
  async findSessionByPermitId(id:string){const row=await this.prisma.executionPermit.findUnique({where:{id},select:{sessionId:true}});return row?this.getSession(row.sessionId):undefined;}
  async findSessionByProviderOrderId(id:string){const row=await this.prisma.payment.findUnique({where:{providerOrderId:id},select:{sessionId:true}});return row?this.getSession(row.sessionId):undefined;}
  async reservePermit(sessionId:string,permitId:string,paymentId:string){const result=await this.prisma.executionPermit.updateMany({where:{id:permitId,sessionId,status:'ISSUED'},data:{status:'RESERVED',reservedAt:new Date(),reservationPaymentId:paymentId}});if(result.count!==1)return false;const session=await this.getSession(sessionId);if(session?.permit){session.permit.status='RESERVED';await this.saveSession(session);}return true;}
  async recordWebhook(input:{providerEventId:string;eventType:string;signature:string;payloadHash:string}){try{await this.prisma.webhookEvent.create({data:{provider:'razorpay',providerEventId:input.providerEventId,eventType:input.eventType,signature:input.signature,payloadHash:input.payloadHash,processed:true,processedAt:new Date()}});return true;}catch(error){if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==='P2002')return false;throw error;}}
}

export function createGatewayRepository():GatewayRepository{return process.env.NODE_ENV==='test'||!process.env.DATABASE_URL?new MemoryGatewayRepository():new PrismaGatewayRepository();}
