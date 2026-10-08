import React, { createContext, useContext } from 'react';
import {
  Image,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
import { colors, fonts, gradients, radius } from '../theme';
import { formatZAR, relativeDay } from '../format';
import type { Transaction } from '../api/types';

type Weight = 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';

export function T({
  w = 'regular',
  size = 14,
  color = colors.text,
  style,
  ...rest
}: TextProps & { w?: Weight; size?: number; color?: string; style?: StyleProp<TextStyle> }) {
  return <Text {...rest} style={[{ fontFamily: fonts[w], fontSize: size, color }, style]} />;
}

export function Screen({
  children,
  style,
  padBottom = true,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padBottom?: boolean;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        { flex: 1, backgroundColor: colors.bg, paddingTop: insets.top, paddingBottom: padBottom ? insets.bottom : 0 },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Header({
  title,
  back = true,
  right,
  onBack,
}: {
  title?: string;
  back?: boolean;
  right?: React.ReactNode;
  onBack?: () => void;
}) {
  const router = useRouter();
  return (
    <View style={s.header}>
      <View style={s.headerSide}>
        {back && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={12}
            onPress={() => (onBack ? onBack() : router.canGoBack() ? router.back() : router.replace('/'))}
          >
            <Ionicons name="chevron-back" size={24} color={colors.white} />
          </Pressable>
        )}
      </View>
      <T w="semibold" size={17} accessibilityRole="header">
        {title}
      </T>
      <View style={[s.headerSide, { alignItems: 'flex-end' }]}>{right}</View>
    </View>
  );
}

export function GoldButton({
  label,
  onPress,
  disabled,
  icon,
  style,
  testID,
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [{ opacity: disabled ? 0.45 : pressed ? 0.85 : 1 }, style]}
    >
      <LinearGradient colors={gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.goldBtn}>
        {icon && <Ionicons name={icon} size={18} color={colors.black} style={{ marginRight: 8 }} />}
        <T w="bold" size={15} color={colors.black}>
          {label}
        </T>
      </LinearGradient>
    </Pressable>
  );
}

export function OutlineButton({
  label,
  onPress,
  style,
  icon,
  tone = 'default',
}: {
  label: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  icon?: keyof typeof Ionicons.glyphMap;
  tone?: 'default' | 'gold' | 'danger';
}) {
  const c = tone === 'gold' ? colors.gold : tone === 'danger' ? colors.danger : colors.white;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [s.outlineBtn, { borderColor: tone === 'default' ? colors.border : c, opacity: pressed ? 0.8 : 1 }, style]}
    >
      {icon && <Ionicons name={icon} size={18} color={c} style={{ marginRight: 8 }} />}
      <T w="semibold" size={14} color={c}>
        {label}
      </T>
    </Pressable>
  );
}

const LightCtx = createContext(false);
export const lightText = '#0B1226';
export const lightSub = '#6B7280';

export function Card({ children, style, light = false }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; light?: boolean }) {
  return (
    <LightCtx.Provider value={light}>
      <View style={[s.card, light && { backgroundColor: colors.white, borderColor: 'transparent' }, style]}>{children}</View>
    </LightCtx.Provider>
  );
}

export function IconCircle({
  name,
  size = 48,
  active = true,
}: {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  active?: boolean;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: active ? 'rgba(212,165,58,0.14)' : 'rgba(255,255,255,0.06)',
        borderWidth: 1.5,
        borderColor: active ? colors.gold : colors.border,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name={name} size={size * 0.46} color={active ? colors.gold : colors.muted} />
    </View>
  );
}

export function Logo({ width = 180 }: { width?: number }) {
  return (
    <Image
      accessibilityLabel="FacePay"
      source={require('../../assets/logo-full.png')}
      style={{ width, height: (width * 260) / 1130 }}
      resizeMode="contain"
    />
  );
}

export function Mark({ size = 120 }: { size?: number }) {
  return (
    <Image
      accessibilityLabel="FacePay mark"
      source={require('../../assets/icon-mark.png')}
      style={{ width: size, height: (size * 240) / 305 }}
      resizeMode="contain"
    />
  );
}

export function FaceGlyph({ size = 160, color = colors.gold }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Ellipse cx="50" cy="44" rx="20" ry="25" stroke={color} strokeWidth="2.2" />
      <Path d="M30 40c0-14 8-22 20-22s20 8 20 22c-6-4-10-9-12-14-8 6-18 9-28 14z" stroke={color} strokeWidth="1.6" fill="rgba(212,165,58,0.12)" />
      <Path d="M20 96c2-18 14-26 30-26s28 8 30 26" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <Circle cx="42" cy="45" r="1.8" fill={color} />
      <Circle cx="58" cy="45" r="1.8" fill={color} />
      <Path d="M44 57c4 3 8 3 12 0" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

const merchantIcon = (name: string): keyof typeof Ionicons.glyphMap => {
  const n = name.toLowerCase();
  if (n.includes('uber')) return 'car';
  if (n.includes('bp')) return 'speedometer';
  if (n.includes('checkers')) return 'basket';
  if (n.includes('pick')) return 'cart';
  return 'storefront';
};

export function TxRow({ tx, last }: { tx: Transaction; last?: boolean }) {
  const neg = tx.status === 'captured' || tx.status === 'authorised' || tx.status === 'pending';
  const refunded = tx.status === 'refunded';
  const light = useContext(LightCtx);
  const statusColor =
    tx.status === 'captured' ? (light ? lightSub : colors.muted) : tx.status === 'declined' ? colors.danger : colors.warn;
  return (
    <View style={[s.txRow, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: light ? '#ECEEF3' : colors.border }]}>
      <View style={s.txIcon}>
        <Ionicons name={merchantIcon(tx.merchantName)} size={18} color={colors.gold} />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <T w="semibold" size={14} color={light ? lightText : colors.text}>
          {tx.merchantName}
        </T>
        <T size={11} color={statusColor} style={{ marginTop: 2 }}>
          {relativeDay(tx.createdAt)}
          {tx.status !== 'captured' ? `  ·  ${tx.status === 'declined' ? 'Declined' : tx.status === 'refunded' ? 'Refunded' : 'Pending'}` : ''}
        </T>
      </View>
      <T
        w="bold"
        size={14}
        color={tx.status === 'declined' ? colors.muted : refunded ? colors.success : colors.danger}
        style={tx.status === 'declined' ? { textDecorationLine: 'line-through' } : undefined}
      >
        {refunded ? '+' : neg || tx.status === 'declined' ? '-' : ''}
        {formatZAR(tx.amountMinor, { space: false })}
      </T>
    </View>
  );
}

export function ListRow({
  icon,
  label,
  sub,
  onPress,
  right,
  last,
  danger,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sub?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  last?: boolean;
  danger?: boolean;
}) {
  const light = useContext(LightCtx);
  const c = danger ? colors.danger : light ? lightText : colors.white;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={!onPress}
      style={[s.listRow, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: light ? '#ECEEF3' : colors.border }]}
    >
      <Ionicons name={icon} size={20} color={danger ? colors.danger : colors.gold} style={{ width: 28 }} />
      <View style={{ flex: 1 }}>
        <T w="medium" size={14} color={c}>
          {label}
        </T>
        {sub ? (
          <T size={11} color={light ? lightSub : colors.muted} style={{ marginTop: 2 }}>
            {sub}
          </T>
        ) : null}
      </View>
      {right ?? (onPress ? <Ionicons name="chevron-forward" size={18} color={colors.muted} /> : null)}
    </Pressable>
  );
}

export function Keypad({
  onKey,
  onDelete,
  decimal = false,
}: {
  onKey: (k: string) => void;
  onDelete: () => void;
  decimal?: boolean;
}) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', decimal ? '.' : '', '0', 'del'];
  return (
    <View style={s.keypad}>
      {keys.map((k, i) =>
        k === '' ? (
          <View key={i} style={s.key} />
        ) : (
          <Pressable
            key={i}
            accessibilityRole="button"
            accessibilityLabel={k === 'del' ? 'Delete' : k}
            onPress={() => (k === 'del' ? onDelete() : onKey(k))}
            style={({ pressed }) => [s.key, pressed && { backgroundColor: 'rgba(255,255,255,0.08)' }]}
          >
            {k === 'del' ? (
              <Ionicons name="backspace-outline" size={24} color={colors.white} />
            ) : (
              <T w="semibold" size={24}>
                {k}
              </T>
            )}
          </Pressable>
        ),
      )}
    </View>
  );
}

export function Pill({ label, active, onPress, segmented }: { label: string; active?: boolean; onPress?: () => void; segmented?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      onPress={onPress}
      style={[s.pill, active && { backgroundColor: colors.gold, borderColor: colors.gold }, segmented && { flex: 1, marginRight: 0, borderWidth: 0, backgroundColor: active ? colors.gold : 'transparent' }]}
    >
      <T w="semibold" size={12} numberOfLines={1} color={active ? colors.black : colors.muted}>
        {label}
      </T>
    </Pressable>
  );
}

const s = StyleSheet.create({
  header: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  headerSide: { width: 56 },
  goldBtn: { height: 52, borderRadius: radius.pill, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  outlineBtn: { height: 48, borderRadius: radius.pill, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 16 },
  txRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  txIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(212,165,58,0.12)', alignItems: 'center', justifyContent: 'center' },
  listRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: 330, alignSelf: 'center' },
  key: { width: '33.33%', height: 62, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  pill: { paddingHorizontal: 16, height: 34, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
});
