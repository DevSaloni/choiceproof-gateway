export const CHOICEPROOF_VERSION = '1.0.0';

export type ScenarioId = 'scenario_1' | 'scenario_2' | 'scenario_3';

export type ProductBadgeKind =
  | 'eligible'
  | 'ai-selected'
  | 'better-match'
  | 'content-risk'
  | 'approved-cart'
  | 'nike-preferred';

export type ExclusionKind = 'budget' | 'delivery' | 'subscription' | 'size';

export interface ProductOffer {
  id: string;
  catalogId: string;
  name: string;
  sku: string;
  merchant: string;
  brand: string;
  price: number;
  deliveryDays: number;
  subscription: boolean;
  rating: number;
  warrantyMonths: number;
  sizeAvailable: string;
  description: string;
  hasMerchantPromptInjection?: boolean;
  highlightPhrase?: string;
}

export interface ExcludedProduct {
  id: string;
  name: string;
  sku: string;
  brand: string;
  merchant: string;
  price: number;
  deliveryDays: number;
  subscription: boolean;
  exclusionReason: string;
  exclusionBadge: string;
  exclusionKind: ExclusionKind;
}

export interface HardRequirementChip {
  id: string;
  label: string;
}

export interface AiSelectionCopy {
  productId: string;
  reason: string;
  verifyWarning?: string;
  boundCartNote?: string;
}

export interface IntentLockRules {
  category: string;
  size: string;
  maxBudget: number;
  deliveryDaysLimit: number;
  subscriptionAllowed: boolean;
  brandPreference: string;
  status: 'draft' | 'analyzing' | 'parsed' | 'confirmed';
  version: number;
}

export type ChoiceProofStatus = 
  | 'PENDING'
  | 'APPROVED'
  | 'REVIEW_REQUIRED'
  | 'APPROVED_WITH_USER_OVERRIDE'
  | 'PAYMENT_BLOCKED';

export interface StabilityCheck {
  normalSelection: {
    productName: string;
    description: string;
  };
  cleanSelection: {
    productName: string;
    description: string;
  };
  isStable: boolean;
  statusText: string;
  disclaimer?: string;
}

export interface PaymentPermit {
  permitId: string;
  productName: string;
  sku: string;
  merchant: string;
  quantity: number;
  maxAmount: number;
  currency: string;
  singleUse: boolean;
  cartLocked: boolean;
  cartHash: string;
  offerSetHash: string;
  status: 'ISSUED' | 'CONSUMED' | 'REVOKED';
  expiresInSeconds: number;
}

export interface TimelineEvent {
  time: string;
  title: string;
  description?: string;
  type: 'info' | 'success' | 'warning' | 'danger';
}

export interface ChoiceProofReceipt {
  status: 'Payment Verified' | 'Payment Blocked';
  intentLock: {
    title: string;
    budget: string;
    delivery: string;
    subscription: string;
    brand: string;
  };
  aiSelection: {
    productName: string;
    sku: string;
    merchant: string;
    amount: number;
  };
  decision: {
    status: ChoiceProofStatus;
    summary: string;
    details: string[];
    userOverrideNote?: string;
  };
  paymentGuardian: {
    permitId: string;
    singleUse: boolean;
    cartLocked: boolean;
    expiry: string;
  };
  razorpay: {
    orderId: string;
    paymentId: string;
    paymentSignature: string;
    mode: string;
    orderCreated: boolean;
  };
  integrity: {
    offerSetHash: string;
    cartHash: string;
    receiptHash: string;
    receiptSignature: string;
  };
  timeline: TimelineEvent[];
}
