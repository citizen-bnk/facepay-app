import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import type { Transaction, Wallet } from '../api/types';
import { useApp } from './app';

export function useWallet() {
  const { walletVersion } = useApp();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    try {
      setError(null);
      setWallet(await api.getWallet());
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load, walletVersion]);
  return { wallet, error, reload: load };
}

export function useTransactions(status: string, q: string) {
  const { walletVersion } = useApp();
  const [items, setItems] = useState<Transaction[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    try {
      setError(null);
      const r = await api.listTransactions({ status, q: q || undefined, limit: 50 });
      setItems(r.items);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [status, q]);
  useEffect(() => {
    load();
  }, [load, walletVersion]);
  return { items, error, reload: load };
}
