import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../src/state/app';
import { useWallet } from '../src/state/hooks';
import { formatZAR } from '../src/format';
import { colors } from '../src/theme';
import { Card, GoldButton, Header, OutlineButton, Screen, T } from '../src/ui/kit';

function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
      <T size={13} color={colors.muted}>
        {k}
      </T>
      <T w={strong ? 'bold' : 'medium'} size={13}>
        {v}
      </T>
    </View>
  );
}

export default function Review() {
  const router = useRouter();
  const { draft, biometricConsent, cardFrozen } = useApp();
  const { wallet } = useWallet();

  if (!draft) {
    return (
      <Screen style={{ paddingHorizontal: 20 }}>
        <Header title="Review payment" />
        <T color={colors.muted} style={{ marginTop: 24 }}>
          Nothing to pay yet.
        </T>
        <GoldButton label="Start a payment" style={{ marginTop: 16 }} onPress={() => router.replace('/(tabs)/pay')} />
      </Screen>
    );
  }
  const insufficient = wallet ? draft.amountMinor > wallet.availableBalanceMinor : false;

  return (
    <Screen style={{ paddingHorizontal: 20 }}>
      <Header title="Review payment" />
      <View style={{ alignItems: 'center', marginTop: 16 }}>
        <T size={12} color={colors.muted}>
          You are paying
        </T>
        <T w="bold" size={40} style={{ marginTop: 6 }} testID="review-amount">
          {formatZAR(draft.amountMinor)}
        </T>
        <T w="semibold" size={15} color={colors.gold} style={{ marginTop: 4 }}>
          {draft.merchantName}
        </T>
      </View>
      <Card style={{ marginTop: 24 }}>
        <Row k="To" v={draft.merchantName} />
        <Row k="From" v="Provider balance" />
        <Row k="Available" v={wallet ? formatZAR(wallet.availableBalanceMinor) : '...'} />
        <Row k="Fee" v="R 0.00" />
        <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 4 }} />
        <Row k="Total" v={formatZAR(draft.amountMinor)} strong />
      </Card>
      {insufficient && (
        <T size={12} color={colors.warn} style={{ marginTop: 10 }}>
          This is more than your available balance, so the provider will likely decline it.
        </T>
      )}
      {cardFrozen && (
        <T size={12} color={colors.warn} style={{ marginTop: 10 }}>
          Your virtual card is frozen. Provider balance payments are not affected.
        </T>
      )}
      <View style={{ flex: 1 }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
        <Ionicons name={biometricConsent ? 'scan' : 'keypad'} size={14} color={colors.muted} />
        <T size={11} color={colors.muted} style={{ marginLeft: 6 }}>
          {biometricConsent ? 'You will confirm with a face check.' : 'You will confirm with your PIN.'}
        </T>
      </View>
      <GoldButton
        testID="confirm-pay"
        label={biometricConsent ? 'Confirm with Face' : 'Confirm with PIN'}
        icon={biometricConsent ? 'scan' : 'keypad'}
        onPress={() =>
          biometricConsent
            ? router.push({ pathname: '/face-auth', params: { purpose: 'pay' } })
            : router.push({ pathname: '/pin', params: { mode: 'verify', next: '/payment' } })
        }
      />
      {biometricConsent && (
        <OutlineButton label="Use PIN instead" style={{ marginTop: 10 }} onPress={() => router.push({ pathname: '/pin', params: { mode: 'verify', next: '/payment' } })} />
      )}
      <View style={{ height: 16 }} />
    </Screen>
  );
}
