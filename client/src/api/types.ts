export type ScenarioId = 'scenario_1' | 'scenario_2' | 'scenario_3';
export type Decision = 'APPROVE' | 'REVIEW' | 'BLOCK' | 'APPROVE_WITH_OVERRIDE';

export interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: unknown };
  timestamp: string;
  requestId?: string;
}

export interface ApiUser {
  id: string;
  email: string;
  displayName: string;
}

export interface ApiIntent {
  version: number;
  rawPrompt: string;
  category: string;
  size?: string;
  maxAmountPaise: number;
  maxDeliveryDays?: number;
  subscriptionAllowed: boolean;
  brandPreference?: string;
  confirmed: boolean;
}

export interface ApiProduct {
  id: string;
  catalogId: string;
  merchant: string;
  sku: string;
  name: string;
  category: string;
  brand: string;
  pricePaise: number;
  shippingPaise: number;
  taxPaise: number;
  deliveryDays: number;
  subscription: boolean;
  rating: number;
  warrantyMonths: number;
  availableSizes: string[];
  description: string;
  active: boolean;
}

export interface ApiCart {
  merchant: string;
  sku: string;
  quantity: number;
  itemAmountPaise: number;
  shippingAmountPaise: number;
  taxAmountPaise: number;
  addOns: unknown[];
  subscription: boolean;
  amountPaise: number;
  currency: 'INR';
}

export interface ApiAgentDecision {
  id: string;
  mode: 'NORMAL' | 'CLEAN';
  productId: string;
  reason: string;
  claims: { type: string; text: string }[];
  provider: string;
  createdAt: string;
}

export interface ApiEvaluation {
  id: string;
  sessionId: string;
  selectedProductId: string;
  decision: Decision;
  reasonCodes: string[];
  hardRuleResults: { code: string; passed: boolean; message: string }[];
  dominance: { productId: string; reasons: string[] }[];
  contentRisk: {
    riskFound: boolean;
    level: 'NONE' | 'LOW' | 'HIGH';
    categories: string[];
    matchedSnippets: string[];
  };
  stability: {
    normalProductId: string;
    cleanProductId: string;
    status: 'STABLE' | 'UNSTABLE';
  };
  createdAt: string;
  override?: Record<string, unknown>;
}

export interface ApiPermit {
  id: string;
  sessionId: string;
  evaluationId: string;
  productId: string;
  cart: ApiCart;
  cartHash: string;
  nonce: string;
  signature: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

export interface ApiPayment {
  id: string;
  permitId: string;
  idempotencyKey: string;
  provider: 'mock' | 'razorpay';
  providerOrderId: string;
  amountPaise: number;
  currency: 'INR';
  status: string;
  paymentSignatureVerified: boolean;
  webhookVerified: boolean;
  keyId?: string;
}

export interface ApiAuditEvent {
  at: string;
  actor: string;
  event: string;
  metadata?: Record<string, unknown>;
}

export interface ApiSession {
  id: string;
  userId: string;
  scenarioId: ScenarioId;
  status: string;
  intent?: ApiIntent;
  offerSet?: ApiProduct[];
  normal?: ApiAgentDecision;
  clean?: ApiAgentDecision;
  evaluation?: ApiEvaluation;
  permit?: ApiPermit;
  payments: ApiPayment[];
  audit: ApiAuditEvent[];
}

export interface ApiCatalogResponse {
  catalogVersion: string;
  offerSetHash: string;
  eligible: ApiProduct[];
  excluded: { product: ApiProduct; reasonCode: string }[];
}

export interface ApiReceipt {
  id: string;
  kind: string;
  sessionId: string;
  intent?: ApiIntent;
  evaluation?: ApiEvaluation;
  permit?: { id: string; cart: ApiCart; status: string } | null;
  audit: ApiAuditEvent[];
  receiptHash: string;
  receiptSignature: string;
  signedAt: string;
  razorpayPaymentId?: string;
  attemptedCart?: ApiCart;
  razorpayOrderCreated?: boolean;
}

export class GatewayApiError extends Error {
  status: number;
  code: string;
  details?: unknown;
  data?: unknown;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: unknown,
    data?: unknown
  ) {
    super(message);
    this.name = 'GatewayApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.data = data;
  }
}
