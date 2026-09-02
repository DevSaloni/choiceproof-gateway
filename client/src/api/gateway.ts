import { apiRequest, setAccessToken } from './http';
import type {
  ApiAgentDecision,
  ApiCatalogResponse,
  ApiEvaluation,
  ApiIntent,
  ApiPayment,
  ApiPermit,
  ApiReceipt,
  ApiSession,
  ApiUser,
  ScenarioId,
} from './types';
import type { ApiCart } from './types';

const DEMO_EMAIL = import.meta.env.VITE_DEMO_EMAIL || 'demo@choiceproof.local';
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD || 'choiceproof-demo';

export async function demoLogin() {
  const result = await apiRequest<{ accessToken: string; expiresInSeconds: number; user: ApiUser }>(
    '/api/v1/auth/demo-login',
    {
      method: 'POST',
      body: JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD }),
    }
  );
  setAccessToken(result.accessToken);
  return result;
}

export function createSession(scenarioId: ScenarioId) {
  return apiRequest<ApiSession>('/api/v1/sessions', {
    method: 'POST',
    body: JSON.stringify({ scenarioId }),
  });
}

export function parseIntent(sessionId: string, prompt: string) {
  return apiRequest<ApiIntent>(`/api/v1/sessions/${sessionId}/intent/parse`, {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  });
}

export function confirmIntent(sessionId: string, patch: Record<string, unknown> = {}) {
  return apiRequest<ApiIntent>(`/api/v1/sessions/${sessionId}/intent/confirm`, {
    method: 'POST',
    body: JSON.stringify(patch),
  });
}

export function fetchCatalog(sessionId: string) {
  return apiRequest<ApiCatalogResponse>(`/api/v1/sessions/${sessionId}/catalog`);
}

export function selectProducts(sessionId: string) {
  return apiRequest<{ normal: ApiAgentDecision; clean: ApiAgentDecision }>(
    `/api/v1/sessions/${sessionId}/agent/select`,
    { method: 'POST' }
  );
}

export function evaluateSession(sessionId: string) {
  return apiRequest<ApiEvaluation>(`/api/v1/sessions/${sessionId}/evaluate`, {
    method: 'POST',
  });
}

export function resolveReview(
  evaluationId: string,
  action: 'CHOOSE_ALTERNATIVE' | 'CONTINUE_WITH_SELECTED' | 'CANCEL',
  productId?: string
) {
  return apiRequest<ApiEvaluation>(`/api/v1/evaluations/${evaluationId}/review`, {
    method: 'POST',
    body: JSON.stringify({ action, productId }),
  });
}

export function issuePermit(evaluationId: string) {
  return apiRequest<ApiPermit>(`/api/v1/evaluations/${evaluationId}/permit`, {
    method: 'POST',
  });
}

export function createOrder(permitId: string, candidateCart: ApiCart, idempotencyKey: string) {
  return apiRequest<
    | (ApiPayment & { keyId?: string })
    | { razorpayOrderCreated: false; receipt: ApiReceipt }
  >(`/api/v1/permits/${permitId}/create-order`, {
    method: 'POST',
    body: JSON.stringify({ idempotencyKey, candidateCart }),
  });
}

export function mockCompletePayment(providerOrderId: string) {
  return apiRequest<{ payment: ApiPayment; receipt: ApiReceipt }>('/api/v1/payments/mock-complete', {
    method: 'POST',
    body: JSON.stringify({ providerOrderId }),
  });
}

export function fetchReceipt(sessionId: string) {
  return apiRequest<ApiReceipt>(`/api/v1/sessions/${sessionId}/receipt`);
}

export function fetchAudit(sessionId: string) {
  return apiRequest<ApiReceipt['audit']>(`/api/v1/sessions/${sessionId}/audit`);
}
