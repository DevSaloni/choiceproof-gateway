import type { Receipt, Session } from '../types.js';
import { hmac, id, sha256 } from '../utils/crypto.js';
import { audit } from './session-utils.js';

export function createReceipt(session:Session,kind:Receipt['kind'],secret:string,extra:Record<string,unknown>={}):Receipt{
  const payload=structuredClone({kind,sessionId:session.id,rawIntent:session.intent?.rawPrompt,confirmedIntent:session.intent,offerSetHash:session.offerSetState?.hash,offersObserved:session.offerSetState?.eligible.map(x=>x.id)??[],normalDecision:session.normal,cleanDecision:session.clean,evaluation:session.evaluation,permit:session.permit?{id:session.permit.id,cart:session.permit.cart,status:session.permit.status,expiresAt:session.permit.expiresAt}:null,payment:session.payments.at(-1)??null,auditTimeline:session.audit,...extra});const receiptHash=sha256(payload);const receipt:Receipt={id:id('receipt'),...payload,receiptHash,receiptSignature:hmac(receiptHash,secret),signedAt:new Date().toISOString()};session.receipts.push(receipt);audit(session,'SYSTEM','RECEIPT_CREATED',{kind,receiptHash},'Receipt',receipt.id);return receipt;
}

export function verifyReceipt(receipt:Receipt,secret:string){const {receiptHash,receiptSignature,signedAt,id:receiptId,...payload}=receipt;const computedHash=sha256(payload);return {receiptId,hashValid:computedHash===receiptHash,signatureValid:hmac(receiptHash,secret)===receiptSignature,valid:computedHash===receiptHash&&hmac(receiptHash,secret)===receiptSignature,signedAt};}
