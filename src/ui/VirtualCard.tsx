import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { gradients, colors } from '../theme';
import { Logo, T } from './kit';
import { GoldWave } from './GoldWave';

export function VirtualCard({ frozen = false, masked = '1234' }: { frozen?: boolean; masked?: string }) {
  return (
    <LinearGradient
      colors={gradients.card}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ width: '100%', aspectRatio: 85.6 / 53.98, borderRadius: 14, padding: 20, borderWidth: 1, borderColor: 'rgba(212,165,58,0.35)', opacity: frozen ? 0.55 : 1 }}
    >
      <View pointerEvents="none" style={{position:'absolute',left:0,right:0,bottom:0,height:135,opacity:.75}}><GoldWave/></View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View><Logo width={150}/><T size={8} color={colors.muted} style={{ marginTop: 5, letterSpacing: 1.5 }}>VIRTUAL CARD · SANDBOX</T></View>
        <Ionicons name={frozen ? 'snow' : 'wifi'} size={20} color={colors.gold} style={{ transform: [{ rotate: frozen ? '0deg' : '90deg' }] }} />
      </View>
      <View style={{ flex: 1 }} />
      <T w="semibold" size={17} color={colors.goldLight} style={{ letterSpacing: 2 }}>
        {'••••  ••••  ••••  '}{masked}
      </T>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8 }}>
        <T size={11} color={colors.muted}>
          {frozen ? 'FROZEN' : 'THABO'}
        </T>
        <T w="extrabold" size={22} style={{ fontStyle: 'italic' }}>
          VISA
        </T>
      </View>
    </LinearGradient>
  );
}
