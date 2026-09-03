import type { GatewayRepository } from '../repositories/gateway.repository.js';
import type { ShoppingAiProvider } from '../providers/shopping-ai.js';
import type { AgentRun, AgentToolCall, Session } from '../types.js';
import { ApiError } from '../errors/api-error.js';
import { evaluate, filterCatalog } from '../rules/choiceproof.js';
import { fixtureSelect } from '../providers/fixture.js';
import { audit, message } from './session-utils.js';
import { id, sha256 } from '../utils/crypto.js';

function tool(run:AgentRun,toolName:AgentToolCall['toolName'],input:unknown,output:unknown,maxToolCalls:number){if(run.toolCalls.length>=maxToolCalls)throw new ApiError(409,'AI_TOOL_LIMIT_EXCEEDED','The shopping agent exceeded its safe tool-call limit.');const call:AgentToolCall={id:id('tool'),sequence:run.toolCalls.length+1,toolName,input,output,status:'COMPLETED',createdAt:new Date().toISOString()};run.toolCalls.push(call);return call;}

export async function runShoppingAgent(repo:GatewayRepository,provider:ShoppingAiProvider,session:Session,maxToolCalls=6){
  if(!session.intent?.confirmed)throw new ApiError(409,'INTENT_NOT_CONFIRMED','Confirm requirements before running the shopping agent.');
  const startedAt=new Date().toISOString();const run:AgentRun={id:id('run'),provider:provider.name,model:provider.model,promptVersion:'choiceproof-agent-v2',status:'RUNNING',toolCalls:[],startedAt};session.agentRuns.push(run);session.status='PRODUCT_SELECTED';audit(session,'SHOPPING_AGENT','AGENT_RUN_STARTED',{provider:provider.name,model:provider.model},'AgentRun',run.id);
  try{
    tool(run,'read_confirmed_intent',{},session.intent,maxToolCalls);
    const catalog=await repo.getProducts();const filtered=filterCatalog(session.intent,catalog);tool(run,'search_verified_offers',{intentVersion:session.intent.version},{eligibleProductIds:filtered.eligible.map(x=>x.id),excluded:filtered.excluded.map(x=>({productId:x.product.id,reason:x.reason}))},maxToolCalls);
    if(!filtered.eligible.length)throw new ApiError(409,'HARD_CONSTRAINT_VIOLATION','No verified offers satisfy every hard requirement.',{excluded:filtered.excluded.map(x=>({productId:x.product.id,reason:x.reason}))});
    const snapshot=filtered.eligible.map(p=>({id:p.id,catalogId:p.catalogId,productVersion:p.productVersion,merchant:p.merchant,sku:p.sku,brand:p.brand,pricePaise:p.pricePaise,shippingPaise:p.shippingPaise,taxPaise:p.taxPaise,stockQuantity:p.stockQuantity,deliveryDays:p.deliveryDays,subscription:p.subscription,rating:p.rating,warrantyMonths:p.warrantyMonths,returnWindowDays:p.returnWindowDays,availableSizes:[...p.availableSizes].sort()})).sort((a,b)=>a.id.localeCompare(b.id));
    const offerSetHash=sha256({catalogVersion:'catalog_v1',offers:snapshot});session.offerSet=filtered.eligible;session.offerSetState={id:id('offers'),hash:offerSetHash,catalogVersion:'catalog_v1',eligible:filtered.eligible,excluded:filtered.excluded,createdAt:new Date().toISOString()};tool(run,'compare_offers',{productIds:filtered.eligible.map(x=>x.id)},snapshot,maxToolCalls);
    if(provider.name==='fixture'){session.normal=fixtureSelect(filtered.eligible,'NORMAL',session.scenarioId??'scenario_1');session.clean=fixtureSelect(filtered.eligible,'CLEAN',session.scenarioId??'scenario_1');}else{session.normal=await provider.select(session.intent,filtered.eligible,'NORMAL');session.clean=await provider.select(session.intent,filtered.eligible,'CLEAN');}
    tool(run,'submit_candidate',{mode:'NORMAL'},session.normal,maxToolCalls);tool(run,'submit_candidate',{mode:'CLEAN'},session.clean,maxToolCalls);
    const evaluation=evaluate(session.intent,filtered.eligible,session.normal,session.clean);evaluation.sessionId=session.id;session.evaluation=evaluation;run.status='COMPLETED';run.completedAt=new Date().toISOString();session.status=evaluation.decision==='APPROVE'?'APPROVED':evaluation.decision==='BLOCK'?'BLOCKED':'REVIEW_PENDING';
    message(session,'ASSISTANT','RECOMMENDATION',session.normal.reason,{normal:session.normal,clean:session.clean});message(session,'ASSISTANT','DECISION',evaluation.decision==='APPROVE'?'ChoiceProof approved this selection.':evaluation.decision==='REVIEW'?'ChoiceProof needs your review before payment.':'ChoiceProof blocked this selection.',{evaluation});audit(session,'CHOICEPROOF','OFFER_SET_FROZEN',{offerSetHash,eligible:filtered.eligible.length,excluded:filtered.excluded.length},'OfferSet',session.offerSetState.id);audit(session,'CHOICEPROOF','EVALUATION_COMPLETED',{decision:evaluation.decision,reasons:evaluation.reasonCodes,replacements:evaluation.replacements},'ChoiceProofEvaluation',evaluation.id);await repo.saveSession(session);
    return {sessionId:session.id,offerSet:session.offerSetState,normal:session.normal,clean:session.clean,evaluation,allowedNextActions:evaluation.decision==='APPROVE'?['ISSUE_PERMIT']:evaluation.decision==='REVIEW'?['CHOOSE_REPLACEMENT','CONTINUE_WITH_SELECTED','CANCEL']:['CHOOSE_REPLACEMENT','CANCEL']};
  }catch(error){run.status='FAILED';run.failureCode=error instanceof ApiError?error.code:'AI_PROVIDER_ERROR';run.completedAt=new Date().toISOString();session.failureCode=run.failureCode;audit(session,'SHOPPING_AGENT','AGENT_RUN_FAILED',{failureCode:run.failureCode},'AgentRun',run.id);await repo.saveSession(session);throw error;}
}
