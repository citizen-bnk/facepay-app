import {
  Api,
  ApiError,
  Consent,
  CreateIntentInput,
  LoginResult,
  Merchant,
  PaymentIntent,
  Transaction,
  TransactionPage,
  Wallet,
} from './types';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function at(daysAgo: number, h: number, m: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

export const FIXTURE_MERCHANTS: Merchant[] = [
  { id: 'm_picknpay', name: 'Pick n Pay', category: 'Groceries' },
  { id: 'm_uber', name: 'Uber', category: 'Transport' },
  { id: 'm_bp', name: 'BP Fuel', category: 'Fuel' },
  { id: 'm_checkers', name: 'Checkers', category: 'Groceries' },
];

function seedTransactions(): Transaction[] {
  const mk = (
    n: number,
    m: Merchant,
    amountMinor: number,
    createdAt: string,
    channel: Transaction['channel'],
  ): Transaction => ({
    id: `txn_${n}`,
    intentId: `pi_${n}`,
    merchantId: m.id,
    merchantName: m.name,
    amountMinor,
    currency: 'ZAR',
    status: 'captured',
    channel,
    createdAt,
  });
  const [pnp, uber, bp, chk] = FIXTURE_MERCHANTS;
  return [
    mk(1, pnp, 25000, at(0, 14, 32), 'face'),
    mk(2, uber, 12000, at(0, 12, 10), 'qr'),
    mk(3, bp, 80000, at(1, 18, 45), 'nfc'),
    mk(4, chk, 34000, at(1, 11, 5), 'face'),
    mk(5, pnp, 18950, at(3, 17, 20), 'face'),
    mk(6, uber, 9400, at(4, 8, 15), 'qr'),
    { ...mk(7, chk, 56000, at(6, 19, 2), 'card'), status: 'declined' },
    mk(8, bp, 65000, at(8, 7, 40), 'nfc'),
  ];
}

const state = {
  balanceMinor: 1245000,
  txns: seedTransactions(),
  intents: new Map<string, PaymentIntent>(),
  keys: new Map<string, string>(),
  consents: [
    { id: 'cons_face_1', type: 'biometric_face', status: 'active', grantedAt: at(30, 9, 0) },
  ] as Consent[],
  seq: 100,
};

/**
 * Demo behaviours (fixtures only):
 *  - amount greater than the balance        -> declined
 *  - amount of exactly R 13.13              -> authorised only (stays pending, never captured)
 *  - amount of exactly R 66.60              -> confirm call times out (pending)
 */
export const DEMO_PENDING_MINOR = 1313;
export const DEMO_TIMEOUT_MINOR = 6660;

export function createFixtureApi(latency = 650): Api {
  return {
    mode: 'fixtures',
    async login(): Promise<LoginResult> {
      await wait(latency / 2);
      return {
        token: 'fixture-token',
        user: { id: 'usr_thabo', name: 'Thabo', email: 'thabo@facepay.demo', role: 'customer' },
      };
    },
    async getWallet(): Promise<Wallet> {
      await wait(latency / 3);
      return {
        provider: 'FacePay Provider',
        availableBalanceMinor: state.balanceMinor,
        currency: 'ZAR',
        methods: [{ id: 'pm_visa_1234', type: 'virtual_card', maskedDisplay: 'VISA ****1234', state: 'active' }],
        recent: state.txns.slice(0, 4),
      };
    },
    async listTransactions(q = {}): Promise<TransactionPage> {
      await wait(latency / 3);
      let items = state.txns;
      if (q.status && q.status !== 'all') items = items.filter((t) => t.status === q.status);
      if (q.q) items = items.filter((t) => t.merchantName.toLowerCase().includes(q.q!.toLowerCase()));
      return { items: items.slice(0, q.limit ?? 50), nextCursor: null };
    },
    async listMerchants() {
      return FIXTURE_MERCHANTS;
    },
    async createPaymentIntent(input: CreateIntentInput, key: string): Promise<PaymentIntent> {
      await wait(latency);
      const existing = state.keys.get(key);
      if (existing) return state.intents.get(existing)!; // idempotent replay
      if (!key) throw new ApiError('idempotency_key_required', 'Idempotency-Key header is required', 400);
      if (input.amountMinor <= 0) throw new ApiError('invalid_amount', 'Amount must be greater than zero', 422);
      const id = `pi_${++state.seq}`;
      const intent: PaymentIntent = {
        id,
        merchantId: input.merchantId,
        amountMinor: input.amountMinor,
        currency: input.currency,
        status: 'requires_confirmation',
        createdAt: new Date().toISOString(),
        expiresAt: input.expiresAt ?? new Date(Date.now() + 5 * 60_000).toISOString(),
      };
      state.intents.set(id, intent);
      state.keys.set(key, id);
      return intent;
    },
    async getPaymentIntent(id: string) {
      await wait(latency / 3);
      const i = state.intents.get(id);
      if (!i) throw new ApiError('not_found', 'Payment intent not found', 404);
      return i;
    },
    async confirmPaymentIntent(id: string): Promise<PaymentIntent> {
      const i = state.intents.get(id);
      if (!i) throw new ApiError('not_found', 'Payment intent not found', 404);
      if (i.status === 'captured') return i; // idempotent
      if (i.amountMinor === DEMO_TIMEOUT_MINOR) {
        await wait(latency * 40); // exceeds client timeout; caller treats as pending
        return i;
      }
      await wait(latency * 2);
      let status: string;
      if (i.amountMinor > state.balanceMinor) status = 'declined';
      else if (i.amountMinor === DEMO_PENDING_MINOR) status = 'authorised';
      else status = 'captured';
      const next = { ...i, status, transactionId: status === 'captured' ? `txn_${i.id}` : undefined };
      state.intents.set(id, next);
      const m = FIXTURE_MERCHANTS.find((x) => x.id === i.merchantId);
      const tx: Transaction = {
        id: next.transactionId ?? `txn_${i.id}`,
        intentId: i.id,
        merchantId: i.merchantId,
        merchantName: m?.name ?? lookupName(i.merchantId),
        amountMinor: i.amountMinor,
        currency: i.currency,
        status: status as Transaction['status'],
        channel: 'face',
        createdAt: new Date().toISOString(),
      };
      state.txns = [tx, ...state.txns];
      if (status === 'captured') state.balanceMinor -= i.amountMinor;
      return next;
    },
    async createVerificationSession(purpose: string) {
      await wait(latency / 3);
      return { id: `vs_${++state.seq}`, status: purpose ? 'created' : 'failed' };
    },
    async listConsents() {
      return state.consents;
    },
    async revokeConsent(id: string) {
      await wait(latency / 3);
      state.consents = state.consents.map((c) => (c.id === id ? { ...c, status: 'revoked' as const } : c));
    },
  };
}

const nameRegistry = new Map<string, string>();
export function registerMerchantName(id: string, name: string) {
  nameRegistry.set(id, name);
}
function lookupName(id: string): string {
  return nameRegistry.get(id) ?? id;
}
