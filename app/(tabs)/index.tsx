import React, { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/state/app';
import { useWallet } from '../../src/state/hooks';
import { formatZAR } from '../../src/format';
import { isLive } from '../../src/api/client';
import { colors } from '../../src/theme';
import { Card, Screen, T, TxRow, lightText } from '../../src/ui/kit';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

export default function Home() {
  const router = useRouter();
  const { name } = useApp();
  const { wallet, error, reload } = useWallet();
  const [hidden, setHidden] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const actions: { icon: keyof typeof Ionicons.glyphMap; label: string; to: string }[] = [
    { icon: 'scan-circle', label: 'Pay', to: '/(tabs)/pay?mode=face' },
    { icon: 'arrow-down-circle', label: 'Receive', to: '/receive' },
    { icon: 'qr-code', label: 'Scan', to: '/(tabs)/pay?mode=qr' },
    { icon: 'apps', label: 'More', to: '/bills' },
  ];
  const quick: { icon: keyof typeof Ionicons.glyphMap; label: string; to: string }[] = [
    { icon: 'storefront', label: 'Pay Shops', to: '/(tabs)/pay?mode=face' },
    { icon: 'paper-plane', label: 'Send Money', to: '/send' },
    { icon: 'phone-portrait', label: 'Buy Airtime', to: '/bills' },
    { icon: 'receipt', label: 'Pay Bills', to: '/bills' },
  ];

  return (
    <Screen padBottom={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            tintColor={colors.gold}
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await reload();
              setRefreshing(false);
            }}
          />
        }
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surfaceAlt, borderWidth: 1.5, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center' }}>
            <T w="bold" size={17} color={colors.gold}>
              {name.slice(0, 1).toUpperCase()}
            </T>
          </View>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <T size={12} color={colors.muted}>
              {greeting()}
            </T>
            <T w="bold" size={18}>
              {name}
            </T>
          </View>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="notifications-outline" size={20} color={colors.white} />
          </View>
        </View>

        <Pressable
          onPress={() => setHidden((h) => !h)}
          accessibilityRole="button"
          accessibilityLabel={hidden ? 'Show balance' : 'Hide balance'}
          style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginTop: 20, borderWidth: 1, borderColor: 'rgba(212,165,58,0.25)' }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <T size={11} color={colors.muted}>
              Available Balance
            </T>
            <Ionicons name={hidden ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.muted} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
            <T w="bold" size={28} testID="balance">
              {wallet ? (hidden ? 'R \u2022\u2022\u2022\u2022\u2022\u2022' : formatZAR(wallet.availableBalanceMinor)) : 'R ...'}
            </T>
            <Ionicons name="chevron-forward" size={20} color={colors.gold} />
          </View>
          <T size={10} color={colors.slate} style={{ marginTop: 4 }}>
            Provider balance{wallet ? ` \u00b7 ${wallet.provider}` : ''}
          </T>
        </Pressable>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 }}>
          {actions.map((a) => (
            <Pressable key={a.label} accessibilityRole="button" accessibilityLabel={a.label} onPress={() => router.push(a.to as never)} style={{ alignItems: 'center', width: '22%' }}>
              <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={a.icon} size={26} color={colors.goldDark} />
              </View>
              <T w="medium" size={11} style={{ marginTop: 6 }}>
                {a.label}
              </T>
            </Pressable>
          ))}
        </View>

        {error && (
          <Card style={{ marginTop: 14, borderColor: colors.danger }}>
            <T size={12} color={colors.danger}>
              Could not refresh balance: {error}. Pull down to retry.
            </T>
          </Card>
        )}

        <Card light style={{ marginTop: 22, padding: 14 }}>
        <T w="bold" size={13} color={lightText} style={{ marginBottom: 12 }}>
          Quick Actions
        </T>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {quick.map((q) => (
            <Pressable
              key={q.label}
              accessibilityRole="button"
              accessibilityLabel={q.label}
              onPress={() => router.push(q.to as never)}
              style={{ width: '23.5%', alignItems: 'center' }}
            >
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(212,165,58,0.15)', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={q.icon} size={22} color={colors.goldDark} />
              </View>
              <T w="medium" size={10} color={lightText} style={{ marginTop: 6, textAlign: 'center' }}>
                {q.label}
              </T>
            </Pressable>
          ))}
        </View>
        </Card>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
          <T w="bold" size={15}>
            Recent Activity
          </T>
          <Pressable onPress={() => router.push('/(tabs)/history')} accessibilityRole="link">
            <T w="semibold" size={12} color={colors.gold}>
              See all
            </T>
          </Pressable>
        </View>
        <Card light style={{ marginTop: 10, paddingVertical: 4 }}>
          {wallet ? (
            wallet.recent.map((t, i) => <TxRow key={t.id} tx={t} last={i === wallet.recent.length - 1} />)
          ) : (
            <T size={12} color={colors.muted} style={{ padding: 16 }}>
              Loading...
            </T>
          )}
        </Card>
        {!isLive && (
          <T size={10} color={colors.slate} style={{ textAlign: 'center', marginTop: 14 }}>
            Demo mode: showing built-in sample data.
          </T>
        )}
      </ScrollView>
    </Screen>
  );
}
