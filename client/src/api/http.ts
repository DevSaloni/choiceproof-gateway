import type { ApiEnvelope } from './types';
import { GatewayApiError } from './types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  let payload: ApiEnvelope<T>;
  try {
    payload = (await response.json()) as ApiEnvelope<T>;
  } catch {
    throw new GatewayApiError(response.status, 'INTERNAL_ERROR', 'The server returned an unreadable response.');
  }

  if (
    response.status === 409 &&
    payload?.data &&
    typeof payload.data === 'object' &&
    payload.data !== null &&
    'razorpayOrderCreated' in payload.data
  ) {
    return payload.data;
  }

  if (!response.ok || payload.success === false) {
    throw new GatewayApiError(
      response.status,
      payload.error?.code || 'INTERNAL_ERROR',
      payload.error?.message || 'Request failed.',
      payload.error?.details,
      payload.data
    );
  }

  return payload.data as T;
}

export async function pingReady() {
  return apiRequest<{ status: string; paymentMode: string; aiMode: string }>('/ready');
}
