import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../src/state/app';
import { colors } from '../src/theme';
import { Logo, T } from '../src/ui/kit';
import { GoldWave } from '../src/ui/GoldWave';

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
      <LinearGradient colors={['#0B0B0B', '#0E1A2B', '#0B0B0B']} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View pointerEvents="none" style={{position:'absolute',left:0,right:0,bottom:30,height:300}}><GoldWave/></View>
        <Logo width={280} />
        <T size={12} color={colors.white} style={{ position: 'absolute', bottom: 35, textAlign: 'center', lineHeight: 18 }}>
          Face your money.{'\n'}Look. Pay. Go.
        </T>
      </LinearGradient>
    </View>
  );
}
