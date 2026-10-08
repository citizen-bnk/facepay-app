import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useApp, PaySource } from '../src/state/app';
import { formatZAR, toMinor } from '../src/format';
import { PAYEES } from '../src/merchants';
import { registerMerchantName } from '../src/api/fixtures';
import { colors } from '../src/theme';
import { GoldButton, Header, Keypad, Pill, Screen, T } from '../src/ui/kit';

/** Manual "Enter amount" screen. */
export default function Amount() {
  const router = useRouter();
  const p = useLocalSearchParams<{ merchantId?: string; merchantName?: string; source?: string }>();
  const { setDraft } = useApp();
  const [merchant, setMerchant] = useState(
    p.merchantId ? { id: p.merchantId, name: p.merchantName ?? p.merchantId } : null,
  );
  const [raw, setRaw] = useState('');

  const press = (k: string) => {
    if (k === '.' && raw.includes('.')) return;
    if (raw.includes('.') && raw.split('.')[1].length >= 2) return;
    if (raw.replace('.', '').length >= 8) return;
    setRaw(raw === '0' && k !== '.' ? k : raw + (raw === '' && k === '.' ? '0.' : k === '.' ? '.' : k));
  };
  const minor = toMinor(raw);
  const shown = raw === '' ? '0.00' : raw.includes('.') ? raw : raw;
  const valid = minor > 0 && merchant;

  return (
    <Screen style={{ paddingHorizontal: 20 }}>
      <Header title="Enter amount" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginTop: 4 }}>
        {PAYEES.map((m) => (
          <Pill key={m.id} label={m.name} active={merchant?.id === m.id} onPress={() => setMerchant({ id: m.id, name: m.name })} />
        ))}
      </ScrollView>
      <View style={{ alignItems: 'center', marginTop: 28 }}>
        <T size={12} color={colors.muted}>
          {merchant ? `Paying ${merchant.name}` : 'Choose who you are paying'}
        </T>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 10 }}>
          <T w="bold" size={24} color={colors.gold}>
            R{' '}
          </T>
          <T w="bold" size={46} color={raw ? colors.white : colors.slate} testID="amount">
            {shown}
          </T>
        </View>
        <T size={11} color={colors.slate} style={{ marginTop: 8 }}>
          {minor > 0 ? formatZAR(minor) : 'Enter an amount'}
        </T>
      </View>
      <View style={{ flex: 1 }} />
      <Keypad decimal onKey={press} onDelete={() => setRaw((r) => r.slice(0, -1))} />
      <GoldButton
        label="Continue"
        disabled={!valid}
        style={{ marginTop: 12, marginBottom: 16 }}
        onPress={() => {
          if (!merchant) return;
          registerMerchantName(merchant.id, merchant.name);
          setDraft({ merchantId: merchant.id, merchantName: merchant.name, amountMinor: minor, source: ((p.source as PaySource) ?? 'manual') });
          router.push('/review');
        }}
      />
    </Screen>
  );
}
