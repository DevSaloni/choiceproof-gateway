import type { AgentDecision, Intent, IntentDraft, Product, Replacement, SelectionMode } from '../types.js';

export interface ShoppingAiProvider{
  readonly name:string;
  readonly model:string;
  parseIntentDraft(prompt:string,previous?:IntentDraft):Promise<IntentDraft>;
  select(intent:Intent,products:Product[],mode:SelectionMode):Promise<AgentDecision>;
  explainReplacement(intent:Intent,replacement:Replacement,product:Product):Promise<string>;
}
