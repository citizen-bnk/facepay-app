import {
  Api,
  ApiError,
  Consent,
  LoginResult,
  Merchant,
  PaymentIntent,
  TransactionPage,
  Wallet,
} from './types';
import { createFixtureApi } from './fixtures';

export const API_URL: string = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/+$/, '');

const DEMO_EMAIL = process.env.EXPO_PUBLIC_DEMO_EMAIL ?? 'thabo@facepay.demo';
const DEMO_PASSWORD = process.env.EXPO_PUBLIC_DEMO_PASSWORD ?? 'facepay-demo';

function createLiveApi(base: string): Api {
  let token: string | null = null;

  async function req<T>(
    path: string,
    init: { method?: string; body?: unknown; headers?: Record<string, string>; timeoutMs?: number } = {},
  ): Promise<T> {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), init.timeoutMs ?? 20_000);
    try {
      const res = await fetch(`${base}/v1${path}`, {
        method: init.method ?? 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...init.headers,
        },
        body: init.body === undefined ? undefined : JSON.stringify(init.body),
        signal: ctrl.signal,
      });
      const text = await res.text();
      const json = text ? JSON.parse(text) : {};
      if (!res.ok) {
        const e = json?.error ?? {};
        throw new ApiError(e.code ?? 'http_error', e.message ?? `Request failed (${res.status})`, res.status);
      }
      return json as T;
    } catch (e) {
      if (e instanceof ApiError) throw e;
      if ((e as Error).name === 'AbortError') throw new ApiError('timeout', 'The request timed out', 0);
      throw new ApiError('network_error', 'Network unavailable', 0);
    } finally {
      clearTimeout(t);
    }
  }

  return {
    mode: 'live',
    async login() {
      const r = await req<LoginResult>('/auth/login', {
        method: 'POST',
        body: { email: DEMO_EMAIL, password: DEMO_PASSWORD },
      });
      token = r.token;
      return r;
    },
    getWallet: () => req<Wallet>('/wallet'),
    listTransactions(q = {}) {
      const p = new URLSearchParams();
      if (q.limit) p.set('limit', String(q.limit));
      if (q.status && q.status !== 'all') p.set('status', q.status);
      if (q.q) p.set('q', q.q);
      const qs = p.toString();
      return req<TransactionPage>(`/transactions${qs ? `?${qs}` : ''}`);
    },
    listMerchants: async () => {
      const r = await req<Merchant[] | { items: Merchant[] }>('/merchants');
      return Array.isArray(r) ? r : r.items;
    },
    createPaymentIntent: (input, key) =>
      req<PaymentIntent>('/payment-intents', { method: 'POST', body: input, headers: { 'Idempotency-Key': key } }),
    getPaymentIntent: (id) => req<PaymentIntent>(`/payment-intents/${encodeURIComponent(id)}`),
    confirmPaymentIntent: (id) =>
      req<PaymentIntent>(`/payment-intents/${encodeURIComponent(id)}/confirm`, { method: 'POST', body: {} }),
    // Only the purpose / intent id leave the device. No biometric data, ever.
    createVerificationSession: (purpose, paymentIntentId) =>
      req('/verification-sessions', { method: 'POST', body: { purpose, paymentIntentId } }),
    listConsents: async () => {
      const r = await req<Consent[] | { items: Consent[] }>('/consents');
      return Array.isArray(r) ? r : r.items;
    },
    revokeConsent: async (id) => {
      await req(`/consents/${encodeURIComponent(id)}/revoke`, { method: 'POST', body: {} });
    },
  };
}

export const api: Api = API_URL ? createLiveApi(API_URL) : createFixtureApi();
export const isLive = api.mode === 'live';
