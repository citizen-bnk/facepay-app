import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, AppState, Image, PanResponder, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../src/theme';
import { GoldButton, Logo, Screen, T } from '../src/ui/kit';
import { useReducedMotion } from '../src/ui/useReducedMotion';

const slides = [
  { title: 'Pay Smarter\nwith Just Your Face', body: 'A faster, safer and more connected way to pay across all your favorite places.', caption: 'Look. Pay. Go.', image: require('../assets/media/consumer.webp') },
  { title: 'Your money.\nOne connected place.', body: 'Explore your wallet, linked accounts and payment history in one simple experience.', caption: 'Your world, connected.', image: require('../assets/media/merchant.webp') },
  { title: 'More places.\nMore ways to pay.', body: 'From a quick scan to a tap at the till, choose the payment experience that works for you.', caption: 'One identity. More possibilities.', image: require('../assets/media/transport.webp') },
] as const;

export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
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
    transition.current = Animated.timing(position, { toValue: direction * (width + 80), duration: 270, useNativeDriver: true });
    transition.current.start(({ finished }) => {
      if (!finished || !mounted.current) { transitioning.current = false; return; }
      setIndex(current => target ?? (current + (direction < 0 ? 1 : -1) + slides.length) % slides.length);
      position.setValue(-direction * 38);
      transition.current = Animated.spring(position, { toValue: 0, friction: 8, tension: 90, useNativeDriver: true });
      transition.current.start(() => { transitioning.current = false; });
    });
  }, [position, reduced, width]);
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
  const photoWidth = Math.max(width, height * 16 / 9);
  const focalPoint = [0.76, 0.65, 0.5][index];
  const photoLeft = Math.min(0, Math.max(width - photoWidth, width / 2 - photoWidth * focalPoint));
  return <Screen padBottom={false} style={{ paddingTop: 0, backgroundColor: colors.black, overflow: 'hidden' }}>
    <Animated.View {...pan.panHandlers} testID="onboarding-card" style={[StyleSheet.absoluteFill, { transform: [
      { translateX: position }, { rotate: position.interpolate({ inputRange: [-width, 0, width], outputRange: ['-12deg', '0deg', '12deg'] }) },
    ] }]}>
      <Image source={slide.image} accessibilityIgnoresInvertColors resizeMode="cover" style={{ position: 'absolute', top: 0, left: photoLeft, width: photoWidth, height }}/>
      <LinearGradient colors={['rgba(0,0,0,.55)', 'rgba(0,0,0,.08)', 'rgba(0,0,0,.8)', '#0B0B0B']} locations={[0,.3,.67,1]} style={StyleSheet.absoluteFill}/>
      <View style={{ position: 'absolute', bottom: insets.bottom + 188, left: 24, right: 24, maxWidth: 570, alignSelf: 'center' }} accessibilityLiveRegion="none">
        <T size={11} color={colors.goldLight} w="semibold" style={{ letterSpacing: 2, marginBottom: 16 }}>{slide.caption.toUpperCase()}</T>
        <T accessibilityRole="header" w="bold" size={height < 700 ? 29 : 38} style={{ lineHeight: height < 700 ? 36 : 46 }}>{slide.title}</T>
        <T size={height < 700 ? 13 : 15} style={{ marginTop: 16, lineHeight: 23, color: '#F5F5F5' }}>{slide.body}</T>
      </View>
    </Animated.View>
    <View style={{ position: 'absolute', top: insets.top + 14, left: 24, right: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Logo width={160}/>
      <Pressable accessibilityRole="button" accessibilityLabel="Skip onboarding" onPress={() => router.push('/login')} style={{ paddingHorizontal: 14, minHeight: 44, justifyContent: 'center', borderRadius: 24, backgroundColor: '#0B0B0B66' }}><T size={12}>Skip</T></Pressable>
    </View>
    <View style={{ position: 'absolute', bottom: insets.bottom + 20, left: 24, right: 24 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Previous introduction" onPress={() => advance(1)} style={{ padding: 12 }}><Ionicons name="chevron-back" size={20} color={colors.white}/></Pressable>
        <View style={{ flexDirection: 'row' }}>{slides.map((_, i) => <Pressable key={i} accessibilityRole="button" accessibilityLabel={`Introduction ${i + 1} of ${slides.length}`} accessibilityState={{ selected: index === i }} onPress={() => advance(i > index ? -1 : 1, i)} style={{ minWidth: 38, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: i === index ? 24 : 7, height: 6, borderRadius: 4, backgroundColor: i === index ? colors.gold : '#FFFFFF66' }}/>
        </Pressable>)}</View>
        <Pressable accessibilityRole="button" accessibilityLabel="Next introduction" onPress={() => advance(-1)} style={{ padding: 12 }}><Ionicons name="chevron-forward" size={20} color={colors.white}/></Pressable>
      </View>
      <GoldButton label="Get Started" onPress={() => router.push('/login')}/>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 4 }}>
        <Pressable accessibilityRole="button" disabled={reduced} accessibilityState={{ disabled: reduced }} accessibilityLabel={reduced ? 'Automatic slides disabled for reduced motion' : paused ? 'Resume automatic slides' : 'Pause automatic slides'} onPress={() => setPaused(value => !value)} style={{ minHeight: 44, minWidth: 44, justifyContent: 'center', alignItems: 'center' }}><Ionicons name={paused || reduced ? 'play-outline' : 'pause-outline'} size={16} color={colors.white}/></Pressable>
        <T size={10} color="#FFFFFFBB">Swipe to explore · {index + 1} of {slides.length}</T>
      </View>
    </View>
  </Screen>;
}
