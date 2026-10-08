import React, { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BILLERS } from '../src/merchants';
import { colors, fonts } from '../src/theme';
import { Card, Header, Screen, T, lightText } from '../src/ui/kit';

export default function Bills() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const list = BILLERS.filter((b) => b.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <Screen style={{ paddingHorizontal: 20 }}>
      <Header title="Bills & Services" />
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 12, paddingHorizontal: 12, height: 44 }}>
        <Ionicons name="search" size={18} color="#9AA3B5" />
        <TextInput
          accessibilityLabel="Search bills"
          value={q}
          onChangeText={setQ}
          placeholder="Search bills, services or providers"
          placeholderTextColor="#9AA3B5"
          style={{ flex: 1, marginLeft: 8, color: lightText, fontFamily: fonts.regular, fontSize: 13, outlineWidth: 0 } as object}
        />
      </View>
      <Card light style={{ marginTop: 16, paddingVertical: 20 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {list.map((b) => (
            <Pressable
              key={b.id}
              accessibilityRole="button"
              accessibilityLabel={b.name}
              onPress={() => router.push({ pathname: '/amount', params: { merchantId: b.id, merchantName: b.name, source: 'bill' } })}
              style={{ width: '33.33%', alignItems: 'center', marginBottom: 20 }}
            >
              <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(212,165,58,0.15)', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={b.icon} size={24} color={colors.goldDark} />
              </View>
              <T w="medium" size={11} color={lightText} style={{ marginTop: 8, textAlign: 'center' }}>
                {b.name}
              </T>
            </Pressable>
          ))}
        </View>
        {list.length === 0 && (
          <T size={12} color="#6B7280" style={{ textAlign: 'center' }}>
            No matching services.
          </T>
        )}
      </Card>
    </Screen>
  );
}
