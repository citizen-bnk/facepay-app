import {
  executePayment,
  initialPaymentState,
  paymentReducer,
  phaseFromIntentStatus,
  PaymentEvent,
  PaymentState,
  refreshPending,
} from '../src/payment/flow';
import { parseQr } from '../src/payment/qr';
import { formatZAR, toMinor } from '../src/format';
import type { PaymentIntent } from '../src/api/types';

const intent = (status: string): PaymentIntent => ({ id: 'pi_1', merchantId: 'm', amountMinor: 25000, currency: 'ZAR', status });

function run(api: Parameters<typeof executePayment>[0], timeout = 50) {
  const events: PaymentEvent[] = [];
  let state: PaymentState = initialPaymentState;
  const phases: string[] = [];
  const dispatch = (e: PaymentEvent) => {
    events.push(e);
    state = paymentReducer(state, e);
    phases.push(state.phase);
  };
  const done = executePayment(api, { merchantId: 'm', amountMinor: 25000, currency: 'ZAR' }, dispatch, {
    idempotencyKey: 'key-1',
    confirmTimeoutMs: timeout,
  });
  return { done, get state() { return state; }, phases, events };
}

describe('phaseFromIntentStatus', () => {
  it('only captured is success', () => {
    expect(phaseFromIntentStatus('captured')).toBe('success');
    expect(phaseFromIntentStatus('authorised')).toBe('pending');
    expect(phaseFromIntentStatus('requires_confirmation')).toBe('pending');
    expect(phaseFromIntentStatus('something_new')).toBe('pending');
    expect(phaseFromIntentStatus('declined')).toBe('failed');
    expect(phaseFromIntentStatus('expired')).toBe('failed');
  });
});

describe('executePayment', () => {
  it('passes the Idempotency-Key and reaches success only on captured', async () => {
    const create = jest.fn().mockResolvedValue(intent('requires_confirmation'));
    const confirm = jest.fn().mockResolvedValue(intent('captured'));
    const r = run({ createPaymentIntent: create, confirmPaymentIntent: confirm });
    await r.done;
    expect(create.mock.calls[0][1]).toBe('key-1');
    expect(r.phases).toEqual(['creating', 'processing', 'success']);
  });

  it('authorised is pending, never success', async () => {
    const r = run({
      createPaymentIntent: jest.fn().mockResolvedValue(intent('requires_confirmation')),
      confirmPaymentIntent: jest.fn().mockResolvedValue(intent('authorised')),
    });
    await r.done;
    expect(r.state.phase).toBe('pending');
  });

  it('declined is failed', async () => {
    const r = run({
      createPaymentIntent: jest.fn().mockResolvedValue(intent('requires_confirmation')),
      confirmPaymentIntent: jest.fn().mockResolvedValue(intent('declined')),
    });
    await r.done;
    expect(r.state.phase).toBe('failed');
  });

  it('confirm timeout is pending, never paid', async () => {
    const r = run({
      createPaymentIntent: jest.fn().mockResolvedValue(intent('requires_confirmation')),
      confirmPaymentIntent: jest.fn(() => new Promise<PaymentIntent>(() => undefined)),
    });
    await r.done;
    expect(r.state.phase).toBe('pending');
    expect(r.state.code).toBe('timeout');
  });

  it('network error during confirm is pending', async () => {
    const r = run({
      createPaymentIntent: jest.fn().mockResolvedValue(intent('requires_confirmation')),
      confirmPaymentIntent: jest.fn().mockRejectedValue(Object.assign(new Error('Network unavailable'), { code: 'network_error' })),
    });
    await r.done;
    expect(r.state.phase).toBe('pending');
  });

  it('error creating the intent is failed (nothing was charged)', async () => {
    const confirm = jest.fn();
    const r = run({
      createPaymentIntent: jest.fn().mockRejectedValue(new Error('boom')),
      confirmPaymentIntent: confirm,
    });
    await r.done;
    expect(r.state.phase).toBe('failed');
    expect(confirm).not.toHaveBeenCalled();
  });

  it('refreshPending can promote pending to success only when captured', async () => {
    let state: PaymentState = { ...initialPaymentState, phase: 'pending', intent: intent('authorised') };
    const dispatch = (e: PaymentEvent) => (state = paymentReducer(state, e));
    await refreshPending({ getPaymentIntent: jest.fn().mockResolvedValue(intent('authorised')) }, 'pi_1', dispatch);
    expect(state.phase).toBe('pending');
    await refreshPending({ getPaymentIntent: jest.fn().mockResolvedValue(intent('captured')) }, 'pi_1', dispatch);
    expect(state.phase).toBe('success');
  });
});

describe('paymentReducer guards', () => {
  it('ignores double START while processing', () => {
    const s1 = paymentReducer(initialPaymentState, { type: 'START', idempotencyKey: 'a' });
    const s2 = paymentReducer(s1, { type: 'START', idempotencyKey: 'b' });
    expect(s2.idempotencyKey).toBe('a');
  });
  it('success is terminal', () => {
    let s = paymentReducer(initialPaymentState, { type: 'START', idempotencyKey: 'a' });
    s = paymentReducer(s, { type: 'INTENT_CREATED', intent: intent('requires_confirmation') });
    s = paymentReducer(s, { type: 'RESULT', intent: intent('captured') });
    s = paymentReducer(s, { type: 'TIMEOUT' });
    s = paymentReducer(s, { type: 'ERROR', message: 'x' });
    expect(s.phase).toBe('success');
  });
  it('TIMEOUT cannot produce success', () => {
    let s = paymentReducer(initialPaymentState, { type: 'START', idempotencyKey: 'a' });
    s = paymentReducer(s, { type: 'INTENT_CREATED', intent: intent('requires_confirmation') });
    s = paymentReducer(s, { type: 'TIMEOUT' });
    expect(s.phase).toBe('pending');
  });
});

describe('helpers', () => {
  it('formats ZAR', () => {
    expect(formatZAR(1245000)).toBe('R 12,450.00');
    expect(formatZAR(25000, { space: false })).toBe('R250.00');
    expect(toMinor('12.5')).toBe(1250);
  });
  it('parses QR payloads', () => {
    expect(parseQr('facepay://pay?merchant=m_x&name=X&amount=10.50')).toEqual({ merchantId: 'm_x', merchantName: 'X', amountMinor: 1050 });
    expect(parseQr('https://evil.example')).toBeNull();
    expect(parseQr('{"merchantId":"a","amountMinor":500}')?.amountMinor).toBe(500);
  });
});
