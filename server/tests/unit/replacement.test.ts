import { describe, expect, it } from 'vitest';
import { products } from '../../src/data/catalog.js';
import { rankSafeReplacements } from '../../src/rules/choiceproof.js';
import type { Intent } from '../../src/types.js';

const intent:Intent={version:1,rawPrompt:'shoes',category:'Running shoes',size:'UK 8',maxAmountPaise:500000,maxDeliveryDays:4,subscriptionAllowed:false,brandPreference:'Nike',confirmed:true};
describe('safe replacements',()=>{it('keeps hard constraints and ranks the preferred brand first',()=>{const selected={...products.find(x=>x.id==='prod_premium_x')!,stockQuantity:0};const replacements=rankSafeReplacements(intent,products,selected);expect(replacements[0].productId).toBe('prod_nike_runner');for(const replacement of replacements){const product=products.find(x=>x.id===replacement.productId)!;expect(product.availableSizes).toContain('UK 8');expect(product.subscription).toBe(false);expect(product.pricePaise+product.shippingPaise+product.taxPaise).toBeLessThanOrEqual(500000);}});});
