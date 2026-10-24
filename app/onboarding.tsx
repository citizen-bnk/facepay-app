import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, AppState, PanResponder, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GoldWave } from '../src/ui/GoldWave';
import { colors } from '../src/theme';
import { GoldButton, Logo, Screen, T, lightSub, lightText } from '../src/ui/kit';
import { useReducedMotion } from '../src/ui/useReducedMotion';

const slides = [
  { title: 'Pay Smarter\nwith Just Your Face', body: 'A faster, safer and more connected way to pay across all your favorite places.', caption: 'Look. Pay. Go.', icon: 'scan-outline' },
  { title: 'Your money.\nOne connected place.', body: 'Explore your wallet, linked accounts and payment history in one simple experience.', caption: 'Your world, connected.', icon: 'wallet-outline' },
  { title: 'More places.\nMore ways to pay.', body: 'From a quick scan to a tap at the till, choose the payment experience that works for you.', caption: 'One identity. More possibilities.', icon: 'qr-code-outline' },
] as const;

export default function Onboarding() {
  const router = useRouter();
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [active, setActive] = useState(AppState.currentState === 'active');
  const position = useRef(new Animated.Value(0)).current;
  const transitioning = useRef(false);
  const dragging = useRef(false);
  const mounted = useRef(true);
  const transition = useRef<Animated.CompositeAnimation | null>(null);
  useEffect(() => {
    mounted.current = true;
    const listener = AppState.addEventListener('change', state => setActive(state === 'active'));
    return () => { mounted.current = false; transition.current?.stop(); listener.remove(); };
  }, []);
  const advance = useCallback((direction: number, target?: number) => {
    if (transitioning.current) return;
    if (reduced) {
      position.setValue(0);
      setIndex(current => target ?? (current + (direction < 0 ? 1 : -1) + slides.length) % slides.length);
      return;
    }
    transitioning.current = true;
    transition.current = Animated.timing(position, { toValue: direction * 440, duration: 270, useNativeDriver: true });
    transition.current.start(({ finished }) => {
      if (!finished || !mounted.current) { transitioning.current = false; return; }
      setIndex(current => target ?? (current + (direction < 0 ? 1 : -1) + slides.length) % slides.length);
      position.setValue(-direction * 38);
      transition.current = Animated.spring(position, { toValue: 0, friction: 8, tension: 90, useNativeDriver: true });
      transition.current.start(() => { transitioning.current = false; });
    });
  }, [position, reduced]);
  useEffect(() => {
    if (paused || reduced || !active) return;
    const timer = setInterval(() => { if (!dragging.current) advance(-1); }, 5000);
    return () => clearInterval(timer);
  }, [advance, paused, reduced, active, index]);
  const pan = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 12 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.3 && !transitioning.current,
    onPanResponderGrant: () => { dragging.current = true; },
    onPanResponderMove: (_, gesture) => { if (!transitioning.current) position.setValue(gesture.dx); },
    onPanResponderRelease: (_, gesture) => {
      dragging.current = false;
      if (Math.abs(gesture.dx) > 65 || Math.abs(gesture.vx) > .65) advance(gesture.dx < 0 ? -1 : 1);
      else Animated.spring(position, { toValue: 0, useNativeDriver: true }).start();
    },
    onPanResponderTerminate: () => { dragging.current = false; Animated.spring(position, { toValue: 0, useNativeDriver: true }).start(); },
  }), [advance, position]);
  const slide = slides[index];
  return <Screen style={{ backgroundColor: colors.white, paddingHorizontal: 24 }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8 }}>
      <Pressable accessibilityRole="button" disabled={reduced} accessibilityState={{ disabled: reduced }} accessibilityLabel={reduced ? 'Automatic slides disabled for reduced motion' : paused ? 'Resume automatic slides' : 'Pause automatic slides'} onPress={() => setPaused(value => !value)} style={{ minHeight: 44, minWidth: 44, justifyContent: 'center' }}>
        <Ionicons name={paused || reduced ? 'play-outline' : 'pause-outline'} size={19} color={lightSub}/>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Skip onboarding" onPress={() => router.push('/login')} style={{ minHeight: 44, minWidth: 44, justifyContent: 'center' }}><T size={12} color={lightSub}>Skip</T></Pressable>
    </View>
    <View style={{ flex: 1, minHeight: 390 }}>
      <View pointerEvents="none" style={{ position: 'absolute', top: 200, bottom: 20, left: 8, right: 8, borderRadius: 24, backgroundColor: '#EAE5D8', transform: [{ rotate: '3deg' }] }}/>
      <Animated.View {...pan.panHandlers} testID="onboarding-card" style={{ flex: 1, backgroundColor: colors.white, transform: [
        { translateX: position },
        { rotate: position.interpolate({ inputRange: [-440, 0, 440], outputRange: ['-14deg', '0deg', '14deg'] }) },
      ] }}>
        <View accessibilityLiveRegion="none">
          <T accessibilityRole="header" w="bold" size={28} color={lightText} style={{ marginTop: 16, lineHeight: 36 }}>{slide.title}</T>
          <T size={14} color={lightSub} style={{ marginTop: 12, lineHeight: 21, minHeight: 65 }}>{slide.body}</T>
        </View>
        <View style={{ flex: 1, minHeight: 215, marginTop: 22, marginBottom: 24, backgroundColor: colors.black, borderRadius: 24, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
          <View pointerEvents="none" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 180 }}><GoldWave/></View>
          <Logo width={240}/>
          <Ionicons name={slide.icon} size={42} color={colors.gold} style={{ marginTop: 24 }}/>
          <T size={15} style={{ marginTop: 16, textAlign: 'center' }}>{slide.caption}</T>
        </View>
      </Animated.View>
    </View>
    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
      <Pressable accessibilityRole="button" accessibilityLabel="Previous introduction" onPress={() => advance(1)} style={{ padding: 12 }}><Ionicons name="chevron-back" size={20} color={lightSub}/></Pressable>
      {slides.map((_, i) => <Pressable key={i} accessibilityRole="button" accessibilityLabel={`Introduction ${i + 1} of ${slides.length}`} accessibilityState={{ selected: index === i }} onPress={() => advance(i > index ? -1 : 1, i)} style={{ minWidth: 38, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: i === index ? 22 : 7, height: 7, borderRadius: 4, backgroundColor: i === index ? colors.goldDark : '#D8DBE3' }}/>
      </Pressable>)}
      <Pressable accessibilityRole="button" accessibilityLabel="Next introduction" onPress={() => advance(-1)} style={{ padding: 12 }}><Ionicons name="chevron-forward" size={20} color={lightSub}/></Pressable>
    </View>
    <T size={10} color={lightSub} style={{ textAlign: 'center', marginBottom: 14 }}>Swipe to explore · {index + 1} of {slides.length}</T>
    <GoldButton label="Get Started" onPress={() => router.push('/login')} style={{ marginBottom: 24 }}/>
  </Screen>;
}

