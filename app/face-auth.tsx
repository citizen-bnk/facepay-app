import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useApp } from '../src/state/app';
import { livenessAdapter } from '../src/biometrics/adapter';
import { colors } from '../src/theme';
import { FaceGlyph, Header, OutlineButton, Screen, T } from '../src/ui/kit';

const useNative = Platform.OS !== 'web';

type Phase = 'ready' | 'scanning' | 'verified' | 'failed' | 'nocamera';

/**
 * 03 Face Authentication.
 * The front camera is shown for framing only. Frames are never read, stored or sent.
 * The liveness result comes from `livenessAdapter` (a mock stub, see src/biometrics/adapter.ts).
 */
export default function FaceAuth() {
  const router = useRouter();
  const { purpose = 'enrol' } = useLocalSearchParams<{ purpose?: string }>();
  const { biometricConsent, pinHash } = useApp();
  const [perm, requestPerm] = useCameraPermissions();
  const [phase, setPhase] = useState<Phase>('ready');
  const [attempt, setAttempt] = useState(0);
  const spin = useRef(new Animated.Value(0)).current;
  const sweep = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  // Ask for camera on mount.
  useEffect(() => {
    if (perm && !perm.granted && perm.canAskAgain) requestPerm().catch(() => undefined);
  }, [perm, requestPerm]);

  // Without consent, Face Pay must not run.
  useEffect(() => {
    if (!biometricConsent && purpose === 'pay') router.replace({ pathname: '/pin', params: { mode: 'verify', next: '/payment' } });
  }, [biometricConsent, purpose, router]);

  useEffect(() => {
    const loops = [
      Animated.loop(Animated.timing(spin, { toValue: 1, duration: 2400, easing: Easing.linear, useNativeDriver: useNative })),
      Animated.loop(
        Animated.sequence([
          Animated.timing(sweep, { toValue: 1, duration: 1300, easing: Easing.inOut(Easing.quad), useNativeDriver: useNative }),
          Animated.timing(sweep, { toValue: 0, duration: 1300, easing: Easing.inOut(Easing.quad), useNativeDriver: useNative }),
        ]),
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: useNative }),
          Animated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: useNative }),
        ]),
      ),
    ];
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [spin, sweep, pulse]);

  const finish = useCallback(() => {
    if (purpose === 'pay') router.replace('/payment');
    else router.replace(pinHash ? '/' : { pathname: '/pin', params: { mode: 'setup', next: '/' } });
  }, [purpose, pinHash, router]);

  // Run the (mock) liveness check once the camera question is settled.
  useEffect(() => {
    if (!perm) return;
    if (!perm.granted) {
      setPhase('nocamera');
      return;
    }
    const signal = { cancelled: false };
    setPhase('scanning');
    let t: ReturnType<typeof setTimeout> | undefined;
    livenessAdapter.verify(signal).then((r) => {
      if (signal.cancelled) return;
      if (r.ok) {
        setPhase('verified');
        t = setTimeout(finish, 1100);
      } else setPhase('failed');
    });
    return () => {
      signal.cancelled = true;
      if (t) clearTimeout(t);
    };
  }, [perm?.granted, attempt, finish]);

  const ringColor = phase === 'verified' ? colors.success : phase === 'failed' ? colors.danger : colors.gold;
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const lineY = sweep.interpolate({ inputRange: [0, 1], outputRange: [-150, 150] });

  const title = purpose === 'pay' ? 'Pay with Face' : 'Face Authentication';
  const headline =
    phase === 'verified' ? 'Liveness check passed' : phase === 'failed' ? 'We could not verify you' : phase === 'nocamera' ? 'Camera unavailable' : 'Look at the camera';
  const sub =
    phase === 'verified'
      ? purpose === 'pay'
        ? 'Authorising your payment...'
        : 'Face Pay is ready.'
      : phase === 'failed'
        ? 'Try again, or use your PIN instead.'
        : phase === 'nocamera'
          ? 'Allow camera access, or use your PIN instead.'
          : 'Position your face in the frame';

  return (
    <Screen>
      <Header title={title} onBack={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
      <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 24 }}>
        <View style={{ width: '100%', maxWidth: 330, height: 360, marginTop: 8, borderRadius: 28, overflow: 'hidden', backgroundColor: '#0A1226', alignItems: 'center', justifyContent: 'center' }}>
          {perm?.granted ? (
            <CameraView style={{ position: 'absolute', width: '100%', height: '100%' }} facing="front" mirror />
          ) : (
            <FaceGlyph size={260} color={phase === 'nocamera' ? colors.muted : colors.gold} />
          )}
          {phase === 'scanning' && (
            <Animated.View
              style={{ position: 'absolute', left: 16, right: 16, height: 3, backgroundColor: colors.goldLight, opacity: 0.9, transform: [{ translateY: lineY }], shadowColor: colors.gold, shadowOpacity: 1, shadowRadius: 8 }}
            />
          )}
          {phase === 'verified' && (
            <View style={{ position: 'absolute', backgroundColor: 'rgba(8,16,32,0.55)', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="checkmark-circle" size={96} color={colors.success} />
            </View>
          )}
          <View pointerEvents="none" style={{ position: 'absolute', top: 14, left: 14, right: 14, bottom: 14 }}>
            {[
              { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 18 },
              { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 18 },
              { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 18 },
              { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 18 },
            ].map((c, i) => (
              <View key={i} style={[{ position: 'absolute', width: 46, height: 46, borderColor: ringColor }, c]} />
            ))}
          </View>
        </View>

        <T w="semibold" size={17} style={{ marginTop: 22 }} accessibilityRole="header">
          {headline}
        </T>
        <T size={12} color={colors.muted} style={{ marginTop: 6, textAlign: 'center' }}>
          {phase === 'scanning' ? 'Verifying your identity...' : sub}
        </T>

        <View style={{ width: 52, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 16 }}>
          <Animated.View style={{ transform: [{ rotate: phase === 'scanning' ? rotate : '0deg' }] }}>
            <Svg width={44} height={44}>
              <Circle cx={22} cy={22} r={19} stroke={ringColor} strokeWidth={3} fill="none" strokeLinecap="round" strokeDasharray={phase === 'scanning' ? '70 50' : undefined} />
            </Svg>
          </Animated.View>
        </View>

        <View style={{ flex: 1 }} />
        <T size={10} color={colors.slate} style={{ textAlign: 'center', marginBottom: 12, lineHeight: 15 }}>
          Demo liveness adapter: the camera is for framing only. No images or face data are stored or sent.
        </T>
        <View style={{ width: '100%', flexDirection: 'row', gap: 10, marginBottom: 20 }}>
          <OutlineButton
            label="Cancel"
            style={{ flex: 1 }}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          />
          {phase === 'failed' || phase === 'nocamera' ? (
            <OutlineButton
              label={phase === 'nocamera' ? 'Allow camera' : 'Try again'}
              tone="gold"
              style={{ flex: 1 }}
              onPress={() => (phase === 'nocamera' ? requestPerm().catch(() => undefined) : setAttempt((a) => a + 1))}
            />
          ) : null}
          <OutlineButton
            label="Use PIN"
            tone="gold"
            style={{ flex: 1 }}
            onPress={() =>
              router.replace({ pathname: '/pin', params: { mode: purpose === 'pay' ? 'verify' : 'setup', next: purpose === 'pay' ? '/payment' : '/' } })
            }
          />
        </View>
      </View>
    </Screen>
  );
}
