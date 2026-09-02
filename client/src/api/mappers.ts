import type { ExcludedProduct, IntentLockRules, ProductOffer } from '../types/choiceproof';
import type { ApiIntent, ApiProduct } from './types';

export function rupeesFromPaise(paise: number) {
  return Math.round(paise / 100);
}

export function mapApiProduct(product: ApiProduct): ProductOffer {
  const sizeOk = product.availableSizes.includes('UK 8');
  return {
    id: product.id,
    catalogId: product.catalogId,
    name: product.name,
    sku: product.sku,
    merchant: product.merchant,
    brand: product.brand,
    price: rupeesFromPaise(product.pricePaise + product.shippingPaise + product.taxPaise),
    deliveryDays: product.deliveryDays,
    subscription: product.subscription,
    rating: product.rating,
    warrantyMonths: product.warrantyMonths,
    sizeAvailable: sizeOk ? 'UK 8 available' : 'Size UK 8 unavailable',
    description: product.description,
    hasMerchantPromptInjection: product.id === 'prod_premium_x',
  };
}

export function mapIntent(intent: ApiIntent): IntentLockRules {
  return {
    category: intent.category || 'Running shoes',
    size: intent.size || 'UK 8',
    maxBudget: rupeesFromPaise(intent.maxAmountPaise),
    deliveryDaysLimit: intent.maxDeliveryDays || 4,
    subscriptionAllowed: intent.subscriptionAllowed,
    brandPreference: intent.brandPreference ? `${intent.brandPreference} preferred` : 'Nike preferred',
    status: intent.confirmed ? 'confirmed' : 'parsed',
    version: intent.version,
  };
}

const EXCLUSION_COPY: Record<string, { reason: string; badge: string; kind: ExcludedProduct['exclusionKind'] }> = {
  OVER_BUDGET: { reason: 'Over budget', badge: 'Excluded — Budget', kind: 'budget' },
  DELIVERY_TOO_SLOW: { reason: 'Delivery exceeds 4-day limit', badge: 'Excluded — Delivery', kind: 'delivery' },
  SUBSCRIPTION_PROHIBITED: { reason: 'Subscription is not allowed', badge: 'Excluded — Subscription', kind: 'subscription' },
  SIZE_UNAVAILABLE: { reason: 'Size UK 8 unavailable', badge: 'Excluded — Size', kind: 'size' },
  CATEGORY_MISMATCH: { reason: 'Category does not match', badge: 'Excluded — Category', kind: 'size' },
};

export function mapExcludedProduct(
  product: ApiProduct,
  reasonCode: string,
  maxBudgetPaise?: number
): ExcludedProduct {
  const copy = EXCLUSION_COPY[reasonCode] || {
    reason: reasonCode,
    badge: 'Excluded',
    kind: 'budget' as const,
  };
  const price = rupeesFromPaise(product.pricePaise);
  let reason = copy.reason;
  if (reasonCode === 'OVER_BUDGET' && maxBudgetPaise) {
    const over = rupeesFromPaise(product.pricePaise - maxBudgetPaise);
    if (over > 0) reason = `Over budget by ₹${over.toLocaleString('en-IN')}`;
  }
  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    brand: product.brand,
    merchant: product.merchant,
    price,
    deliveryDays: product.deliveryDays,
    subscription: product.subscription,
    exclusionReason: reason,
    exclusionBadge: copy.badge,
    exclusionKind: copy.kind,
  };
}
