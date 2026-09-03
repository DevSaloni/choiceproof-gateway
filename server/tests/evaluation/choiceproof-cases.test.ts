import { describe, expect, it } from 'vitest';
import { products } from '../../src/data/catalog.js';
import { evaluate } from '../../src/rules/choiceproof.js';
import type { AgentDecision, Intent, Product } from '../../src/types.js';

const intent:Intent={version:1,rawPrompt:'default',category:'Running shoes',size:'UK 8',maxAmountPaise:500000,maxDeliveryDays:4,subscriptionAllowed:false,brandPreference:'Nike',confirmed:true};
const nike=products.find(x=>x.id==='prod_nike_runner')!;const adidas=products.find(x=>x.id==='prod_adidas_pro')!;const premium=products.find(x=>x.id==='prod_premium_x')!;
const d=(productId:string,mode:'NORMAL'|'CLEAN'='NORMAL',claim='Within budget.'):AgentDecision=>({id:`${mode}_${productId}`,mode,productId,reason:'Test selection',claims:[{type:'TEST',text:claim}],provider:'fixture',createdAt:'2026-01-01T00:00:00.000Z'});
const cases:{name:string;expected:'APPROVE'|'REVIEW'|'BLOCK';offers:Product[];normal:AgentDecision;clean:AgentDecision}[]=[];
for(let i=0;i<10;i++)cases.push({name:`approve-${i+1}`,expected:'APPROVE',offers:[{...nike,id:`nike_${i}`,sku:`NIKE-${i}`}],normal:d(`nike_${i}`),clean:d(`nike_${i}`,'CLEAN')});
for(let i=0;i<5;i++)cases.push({name:`review-unstable-${i+1}`,expected:'REVIEW',offers:[nike,adidas],normal:d(nike.id),clean:d(adidas.id,'CLEAN')});
for(let i=0;i<5;i++)cases.push({name:`review-dominated-${i+1}`,expected:'REVIEW',offers:[nike,premium],normal:d(premium.id),clean:d(premium.id,'CLEAN')});
for(let i=0;i<5;i++)cases.push({name:`review-rationale-${i+1}`,expected:'REVIEW',offers:[nike,{...adidas,brand:'Nike'}],normal:d(adidas.id,'NORMAL','This is the fastest delivery.'),clean:d(adidas.id,'CLEAN')});
for(let i=0;i<5;i++)cases.push({name:`block-budget-${i+1}`,expected:'BLOCK',offers:[{...nike,id:`expensive_${i}`,sku:`EXP-${i}`,pricePaise:600000}],normal:d(`expensive_${i}`),clean:d(`expensive_${i}`,'CLEAN')});
for(let i=0;i<5;i++)cases.push({name:`block-size-${i+1}`,expected:'BLOCK',offers:[{...nike,id:`wrong_size_${i}`,sku:`SIZE-${i}`,availableSizes:['UK 9']}],normal:d(`wrong_size_${i}`),clean:d(`wrong_size_${i}`,'CLEAN')});
for(let i=0;i<5;i++)cases.push({name:`block-stock-${i+1}`,expected:'BLOCK',offers:[{...nike,id:`stock_${i}`,sku:`STOCK-${i}`,stockQuantity:0}],normal:d(`stock_${i}`),clean:d(`stock_${i}`,'CLEAN')});

describe('40-case ChoiceProof evaluation',()=>{it.each(cases)('$name',testCase=>{const started=performance.now();const result=evaluate(intent,testCase.offers,testCase.normal,testCase.clean);expect(result.decision).toBe(testCase.expected);expect(result.reasonCodes.length).toBeGreaterThan(0);expect(performance.now()-started).toBeLessThan(100);});it('contains exactly the promised distribution',()=>{expect(cases.filter(x=>x.expected==='APPROVE')).toHaveLength(10);expect(cases.filter(x=>x.expected==='REVIEW')).toHaveLength(15);expect(cases.filter(x=>x.expected==='BLOCK')).toHaveLength(15);});});
