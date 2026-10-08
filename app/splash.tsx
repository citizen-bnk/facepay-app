import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../src/state/app';
import { colors } from '../src/theme';
import { Logo, Mark, T } from '../src/ui/kit';

/** 01 Splash. Auto-advances; `?hold=1` keeps it on screen. */
export default function Splash() {
  const router = useRouter();
  const { hold } = useLocalSearchParams<{ hold?: string }>();
  const { ready, signedIn } = useApp();

  useEffect(() => {
    if (!ready || hold) return;
    const t = setTimeout(() => router.replace(signedIn ? '/' : '/onboarding'), 1800);
    return () => clearTimeout(t);
  }, [ready, signedIn, hold, router]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <LinearGradient colors={['#0B1630', '#081020', '#050810']} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Mark size={150} />
        <View style={{ height: 18 }} />
        <T w="extrabold" size={36} style={{ letterSpacing: 1 }}>
          FACE<T w="extrabold" size={36} color={colors.gold}>PAY</T>
        </T>
        <T w="medium" size={10} color={colors.muted} style={{ letterSpacing: 6, marginTop: 6 }}>
          FACE YOUR MONEY
        </T>
        <T size={15} color={colors.white} style={{ position: 'absolute', bottom: 90, textAlign: 'center', lineHeight: 22 }}>
          One identity.{'\n'}Many ways to pay.
        </T>
      </LinearGradient>
    </View>
  );
}
