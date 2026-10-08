import React, { useState } from 'react';
import { ActivityIndicator, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../src/state/app';
import { colors, fonts } from '../src/theme';
import { normalisePhone, requestOtp, verifyOtp } from '../src/otp';
import { GoldButton, Header, Keypad, Screen, T } from '../src/ui/kit';

export default function Login() {
  const router = useRouter();
  const { signIn } = useApp();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const sendCode = async () => {
    const p = normalisePhone(phone);
    if (!p) return setError('Enter a valid South African mobile number, e.g. 082 123 4567.');
    setError(null);
    setBusy(true);
    await requestOtp(p);
    setBusy(false);
    setStep('otp');
  };

  const submit = async (c: string) => {
    const p = normalisePhone(phone)!;
    setBusy(true);
    const ok = await verifyOtp(p, c);
    if (!ok) {
      setBusy(false);
      setCode('');
      return setError('That code is incorrect. Try again.');
    }
    await signIn(p);
    setBusy(false);
    router.replace('/consent');
  };

  const press = (k: string) => {
    if (busy || code.length >= 6) return;
    const next = code + k;
    setCode(next);
    setError(null);
    if (next.length === 6) submit(next);
  };

  return (
    <Screen style={{ paddingHorizontal: 24 }}>
      <Header title={step === 'phone' ? 'Sign in' : 'Verify your number'} onBack={() => (step === 'otp' ? (setStep('phone'), setCode('')) : router.back())} />
      {step === 'phone' ? (
        <View style={{ flex: 1 }}>
          <T w="bold" size={24} style={{ marginTop: 24 }}>
            What's your mobile number?
          </T>
          <T color={colors.muted} style={{ marginTop: 8, lineHeight: 20 }}>
            We'll text you a 6-digit code to confirm it's you.
          </T>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 28,
              height: 56,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: error ? colors.danger : colors.border,
              backgroundColor: colors.surface,
              paddingHorizontal: 16,
            }}
          >
            <T w="semibold">+27</T>
            <View style={{ width: 1, height: 24, backgroundColor: colors.border, marginHorizontal: 12 }} />
            <TextInput
              testID="phone-input"
              accessibilityLabel="Mobile number"
              value={phone}
              onChangeText={(t) => {
                setPhone(t);
                setError(null);
              }}
              placeholder="082 123 4567"
              placeholderTextColor={colors.slate}
              keyboardType="phone-pad"
              autoComplete="tel"
              style={{ flex: 1, color: colors.white, fontFamily: fonts.medium, fontSize: 16, outlineWidth: 0 } as object}
            />
          </View>
          {error && (
            <T size={12} color={colors.danger} style={{ marginTop: 8 }}>
              {error}
            </T>
          )}
          <View style={{ flex: 1 }} />
          <GoldButton label={busy ? 'Sending...' : 'Send code'} disabled={busy} onPress={sendCode} style={{ marginBottom: 24 }} />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <T w="bold" size={24} style={{ marginTop: 24 }}>
            Enter the 6-digit code
          </T>
          <T color={colors.muted} style={{ marginTop: 8, lineHeight: 20 }}>
            Sent to {normalisePhone(phone)}. Demo build: use <T w="bold" color={colors.gold}>123456</T>.
          </T>
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 28 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <View
                key={i}
                style={{
                  width: 46,
                  height: 56,
                  marginHorizontal: 4,
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: i === code.length ? colors.gold : error ? colors.danger : colors.border,
                  backgroundColor: colors.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <T w="bold" size={22}>
                  {code[i] ?? ''}
                </T>
              </View>
            ))}
          </View>
          <View style={{ height: 24, alignItems: 'center', justifyContent: 'center', marginTop: 12 }}>
            {busy ? <ActivityIndicator color={colors.gold} /> : error ? <T size={12} color={colors.danger}>{error}</T> : null}
          </View>
          <View style={{ flex: 1 }} />
          <Keypad onKey={press} onDelete={() => setCode((c) => c.slice(0, -1))} />
          <View style={{ height: 16 }} />
        </View>
      )}
    </Screen>
  );
}
