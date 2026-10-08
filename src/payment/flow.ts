import type { Api, PaymentIntent } from '../api/types';

/**
 * Payment flow state logic (pure, UI-free so it can be unit tested).
 *
 * Hard rules:
 *  - "success" is reachable ONLY from a confirm/get result whose status is exactly "captured".
 *  - A timeout or network error after the confirm call was sent is "pending", never "success".
 *  - An error before an intent exists (nothing was sent to the provider to move money) is "failed".
 *  - One Idempotency-Key per payment attempt, reused on any retry of intent creation.
 */
export type PaymentPhase = 'idle' | 'creating' | 'processing' | 'success' | 'pending' | 'failed';

export interface PaymentState {
  phase: PaymentPhase;
  idempotencyKey: string | null;
  intent: PaymentIntent | null;
  message: string | null;
  code: string | null;
}

export type PaymentEvent =
  | { type: 'START'; idempotencyKey: string }
  | { type: 'INTENT_CREATED'; intent: PaymentIntent }
  | { type: 'RESULT'; intent: PaymentIntent }
  | { type: 'TIMEOUT' }
  | { type: 'ERROR'; message: string; code?: string; moneyMayHaveMoved?: boolean }
  | { type: 'RESET' };

export const initialPaymentState: PaymentState = {
  phase: 'idle',
  idempotencyKey: null,
  intent: null,
  message: null,
  code: null,
};

export function phaseFromIntentStatus(status: string): 'success' | 'pending' | 'failed' {
  switch (status) {
    case 'captured':
      return 'success';
    case 'declined':
    case 'failed':
    case 'expired':
      return 'failed';
    default:
      // authorised, requires_confirmation, processing, unknown: not money-final, never "paid".
      return 'pending';
  }
}

export function paymentReducer(state: PaymentState, event: PaymentEvent): PaymentState {
  switch (event.type) {
    case 'START':
      if (state.phase === 'creating' || state.phase === 'processing') return state; // no double-submit
      return { ...initialPaymentState, phase: 'creating', idempotencyKey: event.idempotencyKey };
    case 'INTENT_CREATED':
      if (state.phase !== 'creating') return state;
      return { ...state, phase: 'processing', intent: event.intent };
    case 'RESULT': {
      if (state.phase === 'success') return state; // terminal
      const phase = phaseFromIntentStatus(event.intent.status);
      return {
        ...state,
        phase,
        intent: event.intent,
        code: phase === 'failed' ? event.intent.status : null,
        message:
          phase === 'failed'
            ? event.intent.status === 'declined'
              ? 'Your payment was declined. You have not been charged.'
              : 'The payment could not be completed. You have not been charged.'
            : phase === 'pending'
              ? 'Your payment has not been confirmed by the provider yet.'
              : null,
      };
    }
    case 'TIMEOUT':
      if (state.phase !== 'processing' && state.phase !== 'creating') return state;
      return {
        ...state,
        phase: state.intent ? 'pending' : 'failed',
        code: 'timeout',
        message: state.intent
          ? 'We have not heard back from the provider. Your payment is pending, not paid. Check History before retrying.'
          : 'The payment could not be started. You have not been charged.',
      };
    case 'ERROR': {
      if (state.phase === 'success') return state;
      const pending = state.phase === 'processing' && state.intent !== null && event.moneyMayHaveMoved !== false;
      return {
        ...state,
        phase: pending ? 'pending' : 'failed',
        code: event.code ?? 'error',
        message: pending
          ? 'We could not confirm the result. Your payment is pending, not paid. Check History before retrying.'
          : event.message,
      };
    }
    case 'RESET':
      return initialPaymentState;
  }
}

export interface PaymentInput {
  merchantId: string;
  amountMinor: number;
  currency: string;
}

export interface ExecuteOptions {
  idempotencyKey: string;
  /** Max time to wait for the confirm call before treating the payment as pending. */
  confirmTimeoutMs?: number;
}

const TIMEOUT = Symbol('timeout');

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T | typeof TIMEOUT> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => resolve(TIMEOUT), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

export function newIdempotencyKey(): string {
  const g = globalThis as { crypto?: { randomUUID?: () => string } };
  if (g.crypto?.randomUUID) return g.crypto.randomUUID();
  return 'idem-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 12);
}

/** Create intent -> confirm -> dispatch events. Resolves with the final state. */
export async function executePayment(
  api: Pick<Api, 'createPaymentIntent' | 'confirmPaymentIntent'>,
  input: PaymentInput,
  dispatch: (e: PaymentEvent) => void,
  opts: ExecuteOptions,
): Promise<void> {
  const timeoutMs = opts.confirmTimeoutMs ?? 20_000;
  dispatch({ type: 'START', idempotencyKey: opts.idempotencyKey });

  let intent: PaymentIntent;
  try {
    intent = await api.createPaymentIntent(
      {
        merchantId: input.merchantId,
        amountMinor: input.amountMinor,
        currency: input.currency,
        expiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
      },
      opts.idempotencyKey,
    );
  } catch (e) {
    dispatch({ type: 'ERROR', message: errMsg(e), code: errCode(e), moneyMayHaveMoved: false });
    return;
  }
  dispatch({ type: 'INTENT_CREATED', intent });

  try {
    const res = await withTimeout(api.confirmPaymentIntent(intent.id), timeoutMs);
    if (res === TIMEOUT) dispatch({ type: 'TIMEOUT' });
    else dispatch({ type: 'RESULT', intent: res });
  } catch (e) {
    const code = errCode(e);
    // A definite 4xx from the API means the provider rejected it; anything else is unknown.
    const definite = ['declined', 'insufficient_funds', 'intent_expired', 'invalid_amount'].includes(code);
    dispatch({ type: 'ERROR', message: errMsg(e), code, moneyMayHaveMoved: !definite });
  }
}

/** Re-check a pending payment with a GET; never creates a second intent. */
export async function refreshPending(
  api: Pick<Api, 'getPaymentIntent'>,
  intentId: string,
  dispatch: (e: PaymentEvent) => void,
): Promise<void> {
  try {
    const intent = await api.getPaymentIntent(intentId);
    dispatch({ type: 'RESULT', intent });
  } catch {
    // Stay pending.
  }
}

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : 'Something went wrong';
}
function errCode(e: unknown): string {
  return (e as { code?: string })?.code ?? 'error';
}
