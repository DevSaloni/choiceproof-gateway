import type { GatewayRepository } from '../repositories/gateway.repository.js';
import type { ShoppingAiProvider } from '../providers/shopping-ai.js';
import type { Intent, IntentDraft, Session } from '../types.js';
import { ApiError } from '../errors/api-error.js';
import { audit, message } from './session-utils.js';
import { sha256 } from '../utils/crypto.js';

const question:Record<string,string>={category:'What type of running shoes are you looking for?',size:'What shoe size do you need?',maxAmountPaise:'What is your maximum total budget?',maxDeliveryDays:'How many days can delivery take?',subscriptionAllowed:'Should products with a subscription be allowed?'};

export async function processBuyerMessage(repo:GatewayRepository,provider:ShoppingAiProvider,session:Session,text:string,clientMessageId:string){
  const existing=session.messages.find(x=>x.clientMessageId===clientMessageId);if(existing){const assistant=session.messages.find(x=>x.sequence===existing.sequence+1);return {userMessage:existing,assistantMessage:assistant,intentDraft:session.intentDraft,missingFields:session.intentDraft?.missingFields??[],actionRequired:session.intentDraft?.missingFields.length?'ANSWER_QUESTION':'CONFIRM_INTENT'};}
  const userMessage=message(session,'USER','TEXT',text,undefined,clientMessageId);audit(session,'USER','USER_MESSAGE_RECORDED',undefined,'ChatMessage',userMessage.id);
  let draft:IntentDraft;try{draft=await provider.parseIntentDraft(text,session.intentDraft);}catch{message(session,'ASSISTANT','ERROR','I could not understand that message. Please try again with your size, budget, delivery limit, and subscription preference.');throw new ApiError(503,'AI_PROVIDER_ERROR','The configured AI provider could not parse the buyer message.');}
  session.intentDraft=draft;session.status='INTENT_PARSED';
  const next=draft.missingFields[0];const assistantMessage=next?message(session,'ASSISTANT','CLARIFYING_QUESTION',question[next]??`Please provide ${next}.`):message(session,'ASSISTANT','INTENT_SUMMARY','I have enough information. Please review and confirm the requirements before I search for products.',{intentDraft:draft});
  audit(session,'SHOPPING_AGENT',next?'CLARIFICATION_REQUESTED':'INTENT_PARSED',{missingFields:draft.missingFields});await repo.saveSession(session);
  return {userMessage,assistantMessage,intentDraft:draft,missingFields:draft.missingFields,actionRequired:next?'ANSWER_QUESTION':'CONFIRM_INTENT'};
}

export async function confirmDraft(repo:GatewayRepository,session:Session,patch:Partial<IntentDraft>={}):Promise<Intent>{
  const draft={...session.intentDraft,...patch} as IntentDraft;if(!draft)throw new ApiError(409,'SESSION_STATE_CONFLICT','Send a shopping request before confirming it.');
  const missing=[['category',draft.category],['size',draft.size],['maxAmountPaise',draft.maxAmountPaise],['maxDeliveryDays',draft.maxDeliveryDays],['subscriptionAllowed',draft.subscriptionAllowed]].filter(([,v])=>v===undefined||v===null||v==='').map(([k])=>k as string);
  if(missing.length)throw new ApiError(400,'INTENT_INCOMPLETE','Required shopping details are missing.',{missingFields:missing});
  if(!Number.isSafeInteger(draft.maxAmountPaise)||draft.maxAmountPaise!<=0)throw new ApiError(400,'VALIDATION_ERROR','Maximum amount must be a positive integer number of paise.');
  if(session.intent?.confirmed)session.permit&&(['ISSUED','RESERVED'].includes(session.permit.status)&&(session.permit.status='REVOKED'));
  const version=session.currentIntentVersion+1;const base={version,rawPrompt:draft.rawPrompt,category:draft.category!,size:draft.size,maxAmountPaise:draft.maxAmountPaise!,maxDeliveryDays:draft.maxDeliveryDays,subscriptionAllowed:draft.subscriptionAllowed!,brandPreference:draft.brandPreference,ratingPreference:draft.ratingPreference,warrantyPreference:draft.warrantyPreference,returnWindowPreference:draft.returnWindowPreference,confirmed:true};
  const intent:Intent={...base,intentHash:sha256(base)};session.intent=intent;session.currentIntentVersion=version;session.status='INTENT_CONFIRMED';message(session,'ASSISTANT','INTENT_SUMMARY','Your requirements are locked. I can now search and compare verified offers.',{intent});audit(session,'USER','INTENT_CONFIRMED',{version,intentHash:intent.intentHash},'UserIntent',`${session.id}_intent_${version}`);await repo.saveSession(session);return intent;
}
