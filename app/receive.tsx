import React from 'react';
import { View } from 'react-native';
import { useApp } from '../src/state/app';
import { colors } from '../src/theme';
import { Card, FaceGlyph, Header, Screen, T } from '../src/ui/kit';

export default function Receive() {
  const { phone } = useApp();
  return (
    <Screen style={{ paddingHorizontal: 20 }}>
      <Header title="Receive" />
      <Card style={{ alignItems: 'center', marginTop: 24, paddingVertical: 32 }}>
        <FaceGlyph size={96} />
        <T w="bold" size={18} style={{ marginTop: 16 }}>
          Your FacePay ID
        </T>
        <T w="semibold" size={16} color={colors.gold} style={{ marginTop: 6 }}>
          {phone || '+27 82 123 4567'}
        </T>
        <T size={12} color={colors.muted} style={{ marginTop: 14, textAlign: 'center', lineHeight: 18 }}>
          Share this ID to be paid by another FacePay user. Money requests are not available in this build.
        </T>
      </Card>
      <View style={{ flex: 1 }} />
    </Screen>
  );
}
