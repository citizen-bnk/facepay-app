import React, { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { RECIPIENTS } from '../src/merchants';
import { colors, fonts } from '../src/theme';
import { Card, Header, Pill, Screen, T, lightSub, lightText } from '../src/ui/kit';

export default function Send() {
  const router = useRouter();
  const [tab, setTab] = useState('Local Transfer');
  const [q, setQ] = useState('');
  const list = RECIPIENTS.filter((r) => r.name.toLowerCase().includes(q.toLowerCase()));
  const go = (id: string, name: string) =>
    router.push({ pathname: '/amount', params: { merchantId: id, merchantName: name, source: 'send' } });

  return (
    <Screen style={{ paddingHorizontal: 20 }}>
      <Header title="Send Money" />
      <View style={{ flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 12, padding: 3 }}>
        {['Local Transfer', 'International'].map((t) => (
          <Pill segmented key={t} label={t} active={tab === t} onPress={() => setTab(t)} />
        ))}
      </View>
      {tab === 'International' ? (
        <Card style={{ marginTop: 16, alignItems: 'center', paddingVertical: 28 }}>
          <T size={13} color={colors.muted} style={{ textAlign: 'center' }}>
            International transfers are not available yet.
          </T>
        </Card>
      ) : (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 12, paddingHorizontal: 12, height: 44, marginTop: 14 }}>
            <Ionicons name="search" size={18} color="#9AA3B5" />
            <TextInput
              accessibilityLabel="Search recipients"
              value={q}
              onChangeText={setQ}
              placeholder="Search name, phone or bank account"
              placeholderTextColor="#9AA3B5"
              style={{ flex: 1, marginLeft: 8, color: lightText, fontFamily: fonts.regular, fontSize: 13, outlineWidth: 0 } as object}
            />
          </View>
          <View style={{ flexDirection: 'row', marginTop: 20, justifyContent: 'space-between' }}>
            {list.map((r) => (
              <Pressable key={r.id} accessibilityRole="button" accessibilityLabel={`Send to ${r.name}`} onPress={() => go(r.id, r.name)} style={{ alignItems: 'center', width: '24%' }}>
                <View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: colors.surfaceAlt, borderWidth: 1.5, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center' }}>
                  <T w="bold" size={18} color={colors.gold}>{r.name[0]}</T>
                </View>
                <T size={10} style={{ marginTop: 6, textAlign: 'center' }}>{r.name}</T>
              </Pressable>
            ))}
          </View>
          <T w="bold" size={14} style={{ marginTop: 24, marginBottom: 10 }}>
            Recent Transfers
          </T>
          <Card light style={{ paddingVertical: 4 }}>
            {RECIPIENTS.slice(0, 2).map((r, i) => (
              <Pressable key={r.id} onPress={() => go(r.id, r.name)} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: i === 0 ? 1 : 0, borderBottomColor: '#ECEEF3' }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(212,165,58,0.15)', alignItems: 'center', justifyContent: 'center' }}>
                  <T w="bold" size={14} color={colors.goldDark}>{r.name[0]}</T>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <T w="semibold" size={13} color={lightText}>{r.name}</T>
                  <T size={11} color={lightSub}>Tap to send again</T>
                </View>
                <Ionicons name="chevron-forward" size={16} color={lightSub} />
              </Pressable>
            ))}
          </Card>
        </>
      )}
    </Screen>
  );
}
