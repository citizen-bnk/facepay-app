import { stopResidenceSchedule } from '../residence';
import { mobileToken, clearMobileToken, mobileRequest } from '../mobile-api';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import * as Crypto from 'expo-crypto';
import { api } from '../api/client';
import { getItem, removeItem, setItem } from './storage';

export type PaySource = 'face' | 'qr' | 'nfc' | 'manual' | 'send' | 'bill';

export interface PayDraft {
  merchantId: string;
  merchantName: string;
  amountMinor: number;
  source: PaySource;
  reference?: string;
}

interface Persisted {
  signedIn: boolean;
  phone: string;
  name: string;
  biometricConsent: boolean;
  consentId: string | null;
  pinHash: string | null;
  cardFrozen: boolean;
}

const KEY = 'facepay.state.v1';
const EMPTY: Persisted = {
  signedIn: false,
  phone: '',
  name: 'Thabo',
  biometricConsent: false,
  consentId: null,
  pinHash: null,
  cardFrozen: false,
};

interface AppCtx extends Persisted {
  ready: boolean;
  draft: PayDraft | null;
  setDraft: (d: PayDraft | null) => void;
  signIn: (phone: string) => Promise<void>;
  signOut: () => Promise<void>;
  grantConsent: () => Promise<void>;
  revokeConsent: () => Promise<void>;
  setPin: (pin: string) => Promise<void>;
  checkPin: (pin: string) => Promise<boolean>;
  setCardFrozen: (v: boolean) => void;
  walletVersion: number;
  bumpWallet: () => void;
}

const Ctx = createContext<AppCtx | null>(null);

async function hashPin(pin: string): Promise<string> {
  const salted = `facepay:${pin}`;
  try {
    return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, salted);
  } catch {
    // Non-secure web contexts have no SubtleCrypto; fall back to a non-reversible-enough demo digest.
    let h = 5381;
    for (let i = 0; i < salted.length; i++) h = ((h << 5) + h + salted.charCodeAt(i)) | 0;
    return 'fallback-' + (h >>> 0).toString(16);
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [p, setP] = useState<Persisted>(EMPTY);
  const [ready, setReady] = useState(false);
  const [draft, setDraft] = useState<PayDraft | null>(null);
  const [walletVersion, setWalletVersion] = useState(0);
  const pRef = useRef(p);
  pRef.current = p;

  useEffect(() => {
    (async () => {
      const raw = await getItem(KEY);
      if (raw) {
        try {
          setP({ ...EMPTY, ...JSON.parse(raw) });
        } catch {
          /* ignore corrupt state */
        }
      }
      setReady(true);
    })();
  }, []);

  const update = useCallback((patch: Partial<Persisted>) => {
    const next = { ...pRef.current, ...patch };
    pRef.current = next;
    setP(next);
    setItem(KEY, JSON.stringify(next));
  }, []);

  const value = useMemo<AppCtx>(
    () => ({
      ...p,
      ready,
      draft,
      setDraft,
      walletVersion,
      bumpWallet: () => setWalletVersion((v) => v + 1),
      async signIn(phone) {
        const token = await mobileToken();
        const r = token ? null : await api.login().catch(() => null);
        update({ signedIn: true, phone, name: token ? 'FacePay member' : r?.user.name?.split(' ')[0] || 'Thabo' });
      },
      async signOut() {
        await stopResidenceSchedule();
        await mobileRequest('/session',{method:'DELETE'}).catch(() => undefined);
        await clearMobileToken();
        setDraft(null);
        await removeItem(KEY);
        pRef.current = EMPTY;
        setP(EMPTY);
      },
      async grantConsent() {
        update({ biometricConsent: true, consentId: pRef.current.consentId ?? 'cons_face_1' });
      },
      async revokeConsent() {
        const id = pRef.current.consentId;
        if (id) await api.revokeConsent(id).catch(() => undefined);
        update({ biometricConsent: false });
      },
      async setPin(pin) {
        update({ pinHash: await hashPin(pin) });
      },
      async checkPin(pin) {
        return !!pRef.current.pinHash && pRef.current.pinHash === (await hashPin(pin));
      },
      setCardFrozen: (v) => update({ cardFrozen: v }),
    }),
    [p, ready, draft, walletVersion, update],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useApp outside AppProvider');
  return c;
}
