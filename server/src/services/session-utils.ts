import type { AuditEntry, ChatMessage, Session } from '../types.js';
import { id } from '../utils/crypto.js';

export function audit(session:Session,actor:string,event:string,metadata?:Record<string,unknown>,entityType?:string,entityId?:string):AuditEntry{
  const entry:AuditEntry={id:id('audit'),at:new Date().toISOString(),actor,event,entityType,entityId,metadata};
  session.audit.push(entry);return entry;
}

export function message(session:Session,role:ChatMessage['role'],kind:ChatMessage['kind'],text:string,structuredData?:Record<string,unknown>,clientMessageId?:string):ChatMessage{
  const value:ChatMessage={id:id('msg'),sequence:session.messages.length+1,role,kind,text,structuredData,clientMessageId,createdAt:new Date().toISOString()};session.messages.push(value);return value;
}

export function createSessionState(input:{userId:string;scenarioId:Session['scenarioId'];aiMode:string;paymentMode:string}):Session{
  const now=new Date().toISOString();const session:Session={id:id('session'),userId:input.userId,scenarioId:input.scenarioId,status:'CREATED',aiMode:input.aiMode,paymentMode:input.paymentMode,currentIntentVersion:0,payments:[],receipts:[],messages:[],agentRuns:[],audit:[],createdAt:now,updatedAt:now};
  message(session,'ASSISTANT','TEXT',"Hi, I’m ChoiceProof Concierge. Tell me what running shoes you need, and I’ll verify the choice before any payment.");
  audit(session,'USER','SESSION_CREATED',{scenarioId:input.scenarioId});return session;
}

export function requireOwned(session:Session|undefined,userId:string):Session|undefined{return session&&session.userId===userId?session:undefined;}
