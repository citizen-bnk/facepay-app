import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../theme';
import { useReducedMotion } from './useReducedMotion';

const pieces = Array.from({ length: 22 }, (_, i) => ({
  x: ((i * 73) % 290) - 145, y: 110 + (i * 37) % 140,
  color: [colors.gold, colors.goldLight, colors.white, colors.success][i % 4],
  turn: i % 2 ? '240deg' : '-240deg',
}));

/** Mounted only for a confirmed result; pending payments never celebrate. */
export function PaymentResultAnimation({ success }: { success: boolean }) {
  const reduced = useReducedMotion();
  const progress = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const shake = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    progress.setValue(0); scale.setValue(1); shake.setValue(0);
    if (reduced) return;
    const animation = success ? Animated.parallel([
      Animated.sequence([
        Animated.timing(scale, { toValue: .65, duration: 1, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 4, tension: 110, useNativeDriver: true }),
      ]),
      Animated.timing(progress, { toValue: 1, duration: 1900, useNativeDriver: true }),
    ]) : Animated.sequence([
      ...[-1, 1, -.8, .8, -.45, .45, 0].map(value => Animated.timing(shake, { toValue: value, duration: 105, useNativeDriver: true })),
    ]);
    animation.start();
    return () => animation.stop();
  }, [success, reduced, progress, scale, shake]);
  return <View style={styles.stage} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none">
    {success && !reduced && pieces.map((piece, index) => <Animated.View key={index} style={{
      position: 'absolute', left: 160, top: 45, width: index % 3 ? 7 : 5, height: index % 3 ? 12 : 7,
      borderRadius: index % 3 ? 2 : 4, backgroundColor: piece.color,
      opacity: progress.interpolate({ inputRange: [0, .08, .7, 1], outputRange: [0, 1, 1, 0] }),
      transform: [
        { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [0, piece.x] }) },
        { translateY: progress.interpolate({ inputRange: [0, .25, 1], outputRange: [0, -65 - index % 4 * 10, piece.y] }) },
        { rotate: progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', piece.turn] }) },
      ],
    }} />)}
    <Animated.View style={[styles.icon, { borderColor: success ? colors.success : colors.danger, transform: [
      { scale }, { translateX: shake.interpolate({ inputRange: [-1, 1], outputRange: [-9, 9] }) },
      { rotate: shake.interpolate({ inputRange: [-1, 1], outputRange: ['-12deg', '12deg'] }) },
    ] }]}>
      {success ? <Ionicons name="checkmark" size={52} color={colors.success}/> : <Svg width={64} height={64} viewBox="0 0 64 64" fill="none">
        <Circle cx={32} cy={30} r={22} stroke={colors.danger} strokeWidth={2.5}/>
        <Circle cx={24} cy={26} r={2.5} fill={colors.danger}/><Circle cx={40} cy={26} r={2.5} fill={colors.danger}/>
        <Path d="M23 42 Q32 33 41 42" stroke={colors.danger} strokeWidth={3} strokeLinecap="round"/>
      </Svg>}
    </Animated.View>
  </View>;
}
const styles = StyleSheet.create({
  stage: { width: 320, height: 116, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  icon: { width: 96, height: 96, borderRadius: 48, borderWidth: 3, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
});
