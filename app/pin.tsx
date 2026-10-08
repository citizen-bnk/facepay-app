import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useApp } from '../src/state/app';
import { colors } from '../src/theme';
import { Header, Keypad, OutlineButton, Screen, T } from '../src/ui/kit';

const MAX_ATTEMPTS = 5;

/** Non-biometric path. mode=setup creates a 4-digit PIN; mode=verify checks it. */
export default function Pin() {
  const router = useRouter();
  const { mode: modeParam = 'verify', next = '/' } = useLocalSearchParams<{ mode?: string; next?: string }>();
  const { pinHash, setPin, checkPin, draft } = useApp();
  const mode = modeParam === 'verify' && !pinHash ? 'setup' : modeParam;
  const [value, setValue] = useState('');
  const [first, setFirst] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const locked = attempts >= MAX_ATTEMPTS;

  useEffect(() => {
    if (next === '/payment' && !draft) router.replace('/(tabs)/pay');
  }, [next, draft, router]);

  const done = () => router.replace(next as never);

  const onComplete = async (pin: string) => {
    if (mode === 'setup') {
      if (first === null) {
        setFirst(pin);
        setValue('');
        return;
      }
      if (first !== pin) {
        setFirst(null);
        setValue('');
        setError('PINs did not match. Start again.');
        return;
      }
      await setPin(pin);
      done();
    } else {
      if (await checkPin(pin)) return done();
      setAttempts((a) => a + 1);
      setValue('');
      setError('Incorrect PIN.');
    }
  };

  const press = (k: string) => {
    if (locked || value.length >= 4) return;
    const v = value + k;
    setValue(v);
    setError(null);
    if (v.length === 4) setTimeout(() => onComplete(v), 120);
  };

  const title =
    mode === 'setup' ? (first === null ? 'Create your PIN' : 'Confirm your PIN') : 'Enter your PIN';
  return (
    <Screen style={{ paddingHorizontal: 24 }}>
      <Header title="PIN" onBack={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
      <View style={{ alignItems: 'center', marginTop: 24 }}>
        <T w="bold" size={22}>
          {title}
        </T>
        <T size={13} color={colors.muted} style={{ marginTop: 8, textAlign: 'center' }}>
          {mode === 'setup'
            ? 'Your 4-digit PIN lets you pay without Face Pay.'
            : 'Use your PIN to authorise this payment.'}
        </T>
        <View style={{ flexDirection: 'row', marginTop: 32 }}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={{
                width: 18,
                height: 18,
                borderRadius: 9,
                marginHorizontal: 10,
                borderWidth: 1.5,
                borderColor: error ? colors.danger : colors.gold,
                backgroundColor: i < value.length ? colors.gold : 'transparent',
              }}
            />
          ))}
        </View>
        <T size={12} color={colors.danger} style={{ marginTop: 14, height: 18 }}>
          {locked ? 'Too many attempts. Go back and try later.' : error ?? ''}
        </T>
      </View>
      <View style={{ flex: 1 }} />
      <Keypad onKey={press} onDelete={() => setValue((v) => v.slice(0, -1))} />
      {mode === 'setup' && next === '/' && (
        <OutlineButton label="Skip for now" style={{ marginTop: 12 }} onPress={done} />
      )}
      <View style={{ height: 16 }} />
    </Screen>
  );
}
