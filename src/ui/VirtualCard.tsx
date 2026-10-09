import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { gradients, colors } from '../theme';
import { Mark, T } from './kit';
import { GoldWave } from './GoldWave';

export function VirtualCard({ frozen = false, masked = '1234' }: { frozen?: boolean; masked?: string }) {
  return (
    <LinearGradient
      colors={gradients.card}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderRadius: 18, padding: 18, height: 176, borderWidth: 1, borderColor: 'rgba(212,165,58,0.35)', opacity: frozen ? 0.55 : 1 }}
    >
      <View pointerEvents="none" style={{position:'absolute',left:0,right:0,bottom:0,height:135,opacity:.75}}><GoldWave/></View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Mark size={38} />
          <View style={{ marginLeft: 8 }}>
            <T w="extrabold" size={15} style={{ letterSpacing: 0.5 }}>
              FACE<T w="extrabold" size={15} color={colors.gold}>PAY</T>
            </T>
            <T size={8} color={colors.muted} style={{ letterSpacing: 1.5 }}>
              VIRTUAL CARD
            </T>
          </View>
        </View>
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
