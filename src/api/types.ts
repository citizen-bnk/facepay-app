export type TxStatus = 'pending' | 'authorised' | 'captured' | 'declined' | 'refunded';
export type TxChannel = 'face' | 'nfc' | 'qr' | 'card' | 'palm' | 'fingerprint';

export interface Transaction {
  id: string;
  intentId: string;
  merchantId: string;
  merchantName: string;
  amountMinor: number;
  currency: string;
  status: TxStatus;
  channel: TxChannel;
  createdAt: string;
}

export interface WalletMethod {
  id: string;
  type: string;
  maskedDisplay: string;
  state: string;
}

export interface Wallet {
  provider: string;
  availableBalanceMinor: number;
  currency: string;
  methods: WalletMethod[];
  recent: Transaction[];
}

export type IntentStatus =
  | 'requires_confirmation'
  | 'authorised'
  | 'captured'
  | 'declined'
  | 'failed'
  | 'expired';

export interface PaymentIntent {
  id: string;
  merchantId: string;
  amountMinor: number;
  currency: string;
  status: IntentStatus | string;
  expiresAt?: string;
  createdAt?: string;
  transactionId?: string;
}

export interface Consent {
  id: string;
  type: string;
  status: 'active' | 'revoked';
  grantedAt: string;
}

export interface Merchant {
  id: string;
  name: string;
  category: string;
}

export interface LoginResult {
  token: string;
  user: { id: string; name: string; email: string; role: string; tenantId?: string };
}

export interface TransactionPage {
  items: Transaction[];
  nextCursor: string | null;
}

export class ApiError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status = 0) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export interface CreateIntentInput {
  merchantId: string;
  amountMinor: number;
  currency: string;
  expiresAt?: string;
}

export interface Api {
  mode: 'fixtures' | 'live';
  login(): Promise<LoginResult>;
  getWallet(): Promise<Wallet>;
  listTransactions(q?: { status?: string; q?: string; limit?: number }): Promise<TransactionPage>;
  listMerchants(): Promise<Merchant[]>;
  createPaymentIntent(input: CreateIntentInput, idempotencyKey: string): Promise<PaymentIntent>;
  getPaymentIntent(id: string): Promise<PaymentIntent>;
  confirmPaymentIntent(id: string): Promise<PaymentIntent>;
  createVerificationSession(purpose: string, paymentIntentId?: string): Promise<{ id: string; status: string }>;
  listConsents(): Promise<Consent[]>;
  revokeConsent(id: string): Promise<void>;
}
