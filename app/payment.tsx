import React, { useCallback, useEffect, useReducer, useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PaymentResultAnimation } from '../src/ui/PaymentResultAnimation';
import { api } from '../src/api/client';
import { useApp } from '../src/state/app';
import {
  executePayment,
  initialPaymentState,
  newIdempotencyKey,
  paymentReducer,
  refreshPending,
} from '../src/payment/flow';
import { formatZAR } from '../src/format';
import { colors } from '../src/theme';
import { Card, GoldButton, OutlineButton, Screen, T, lightSub, lightText } from '../src/ui/kit';

/**
 * Processing / result screen. "Payment Successful" is rendered ONLY when the
 * provider confirm call returned status "captured" (see src/payment/flow.ts).
 */
export default function Payment() {
  const router = useRouter();
  const { draft, setDraft, bumpWallet } = useApp();
  const [state, dispatch] = useReducer(paymentReducer, initialPaymentState);
  const started = useRef(false);
  const when = useRef(new Date());
  const leaving = useRef(false);

  const run = useCallback(() => {
    if (!draft) return;
    when.current = new Date();
    executePayment(
      api,
      { merchantId: draft.merchantId, amountMinor: draft.amountMinor, currency: 'ZAR' },
      dispatch,
      { idempotencyKey: newIdempotencyKey(), confirmTimeoutMs: 15_000 },
    ).then(() => bumpWallet());
  }, [draft, bumpWallet]);

  useEffect(() => {
    if (!draft) {
      if (!leaving.current) router.replace('/(tabs)/pay');
      return;
    }
    if (started.current) return;
    started.current = true;
    run();
  }, [draft, router, run]);

  const exit = (to: string) => {
    leaving.current = true;
    router.dismissAll();
    router.navigate(to as never);
    setDraft(null);
  };

  if (!draft) return <Screen>{null}</Screen>;
  const { phase } = state;
  const busy = phase === 'idle' || phase === 'creating' || phase === 'processing';

  return (
    <Screen style={{ paddingHorizontal: 24 }}>
      <View style={{ height: 52, alignItems: 'center', justifyContent: 'center' }}>
        <T w="semibold" size={17}>
          {phase === 'success' ? 'Payment Successful' : phase === 'pending' ? 'Payment Pending' : phase === 'failed' ? 'Payment Failed' : 'Processing…'}
        </T>
      </View>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        {busy && (
          <>
            <ActivityIndicator size="large" color={colors.gold} />
            <T w="bold" size={22} style={{ marginTop: 24 }} testID="phase-processing">
              Processing{'…'}
            </T>
            <T size={13} color={colors.muted} style={{ marginTop: 8, textAlign: 'center' }}>
              Waiting for confirmation from your provider.{'\n'}Please do not close this screen.
            </T>
          </>
        )}
        {phase === 'success' && (
          <View testID="phase-success" style={{ alignItems: 'center', width: '100%' }}>
            <PaymentResultAnimation success />
            <T w="bold" size={36} style={{ marginTop: 24 }}>
              {formatZAR(draft.amountMinor)}
            </T>
            <T size={12} color={colors.muted} style={{ marginTop: 8 }}>
              Paid to
            </T>
            <T w="semibold" size={16}>
              {draft.merchantName}
            </T>
            <T size={11} color={colors.muted} style={{ marginTop: 6 }}>
              {when.current.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}{' '}
              {when.current.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
            </T>
            <Card light style={{ width: '100%', marginTop: 28 }}>
              {[
                ['Payment Method', 'Provider balance'],
                ['Transaction ID', (state.intent?.transactionId ?? state.intent?.id ?? '').toUpperCase()],
                ['Status', 'Captured'],
              ].map(([k, v]) => (
                <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
                  <T size={12} color={lightSub}>{k}</T>
                  <T w="semibold" size={12} color={lightText}>{v}</T>
                </View>
              ))}
            </Card>
          </View>
        )}
        {phase === 'pending' && (
          <View testID="phase-pending" style={{ alignItems: 'center' }}>
            <View style={{ width: 96, height: 96, borderRadius: 48, borderWidth: 3, borderColor: colors.warn, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="time-outline" size={52} color={colors.warn} />
            </View>
            <T w="bold" size={22} style={{ marginTop: 24 }}>
              Not confirmed yet
            </T>
            <T size={13} color={colors.muted} style={{ marginTop: 8, textAlign: 'center', lineHeight: 19 }}>
              {state.message}
            </T>
            <T size={12} color={colors.muted} style={{ marginTop: 10 }}>
              {formatZAR(draft.amountMinor)} to {draft.merchantName} is NOT marked as paid.
            </T>
          </View>
        )}
        {phase === 'failed' && (
          <View testID="phase-failed" style={{ alignItems: 'center' }}>
            <PaymentResultAnimation success={false} />
            <T w="bold" size={22} style={{ marginTop: 24 }}>
              Payment failed
            </T>
            <T size={13} color={colors.muted} style={{ marginTop: 8, textAlign: 'center', lineHeight: 19 }}>
              {state.message}
            </T>
          </View>
        )}
      </View>
      <View style={{ paddingBottom: 20 }}>
        {phase === 'success' && (
          <>
            <GoldButton label="Done" onPress={() => exit('/')} />
            <OutlineButton label="View History" style={{ marginTop: 10 }} onPress={() => exit('/(tabs)/history')} />
          </>
        )}
        {phase === 'pending' && (
          <>
            <GoldButton
              label="Check status"
              onPress={() => state.intent && refreshPending(api, state.intent.id, dispatch)}
            />
            <OutlineButton label="Go to History" style={{ marginTop: 10 }} onPress={() => exit('/(tabs)/history')} />
          </>
        )}
        {phase === 'failed' && (
          <>
            <GoldButton
              label="Try again"
              onPress={() => {
                dispatch({ type: 'RESET' });
                run();
              }}
            />
            <OutlineButton label="Back to Home" style={{ marginTop: 10 }} onPress={() => exit('/')} />
          </>
        )}
      </View>
    </Screen>
  );
}
