import React, { useState } from 'react';
import { ScrollView, Switch, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/state/app';
import { useWallet } from '../../src/state/hooks';
import { formatZAR } from '../../src/format';
import { colors } from '../../src/theme';
import { Card, GoldButton, ListRow, OutlineButton, Pill, Screen, T, lightText } from '../../src/ui/kit';
import { VirtualCard } from '../../src/ui/VirtualCard';

export default function Wallet() {
  const { cardFrozen, setCardFrozen } = useApp();
  const { wallet } = useWallet();
  const [open, setOpen] = useState<'settings' | 'limits' | null>(null);
  const [tab, setTab] = useState('Cards');
  const [online, setOnline] = useState(true);
  const [replaced, setReplaced] = useState(false);
  const masked = wallet?.methods[0]?.maskedDisplay.replace(/\D/g, '').slice(-4) || '1234';

  return (
    <Screen padBottom={false}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 32 }}>
        <T w="bold" size={22} accessibilityRole="header">
          My Wallet
        </T>
        <View style={{ flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 12, padding: 3, marginVertical: 16 }}>
          {['Cards', 'Banks', 'E-Money'].map((t) => (
            <Pill segmented key={t} label={t} active={tab === t} onPress={() => setTab(t)} />
          ))}
        </View>
        {tab !== 'Cards' && (
          <Card style={{ alignItems: 'center', paddingVertical: 28 }}>
            <T size={13} color={colors.muted} style={{ textAlign: 'center', lineHeight: 19 }}>
              No {tab.toLowerCase()} linked. Linking is not available in this build.
            </T>
          </Card>
        )}
        {tab === 'Cards' && (<>
        <VirtualCard frozen={cardFrozen} masked={masked} />

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
          {[
            { label: 'Add to Apple Wallet', icon: 'logo-apple' as const },
            { label: 'Add to Google Wallet', icon: 'logo-google' as const },
          ].map((b) => (
            <View key={b.label} style={{ flex: 1, height: 44, borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.black, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', opacity: 0.6 }}>
              <Ionicons name={b.icon} size={16} color={colors.white} />
              <T w="medium" size={10} style={{ marginLeft: 6 }}>
                {b.label}
              </T>
            </View>
          ))}
        </View>
        <T size={10} color={colors.slate} style={{ marginTop: 6, textAlign: 'center' }}>
          Wallet provisioning is not enabled in this build.
        </T>

        <Card style={{ marginTop: 18 }}>
          <T size={11} color={colors.muted}>
            Provider balance
          </T>
          <T w="bold" size={24} style={{ marginTop: 4 }}>
            {wallet ? formatZAR(wallet.availableBalanceMinor) : 'R ...'}
          </T>
          <T size={10} color={colors.slate} style={{ marginTop: 4 }}>
            Held and reported by {wallet?.provider ?? 'your provider'}. FacePay does not hold your funds.
          </T>
        </Card>

        <Card light style={{ marginTop: 14, paddingVertical: 4 }}>
          <ListRow icon="globe-outline" label="Global Use" sub="Use your FacePay card online, in-store and abroad." />
        </Card>

        <Card light style={{ marginTop: 14, paddingVertical: 4 }}>
          <ListRow icon="settings-outline" label="Card Settings" onPress={() => setOpen(open === 'settings' ? null : 'settings')} />
          {open === 'settings' && (
            <View style={{ paddingBottom: 12, paddingLeft: 28 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <T size={13} color={lightText}>Online payments</T>
                <Switch value={online} onValueChange={setOnline} trackColor={{ true: colors.gold, false: "#2A3350" }} {...({ activeThumbColor: colors.white } as object)} thumbColor={colors.white} />
              </View>
            </View>
          )}
          <ListRow icon="speedometer-outline" label="Transaction Limits" onPress={() => setOpen(open === 'limits' ? null : 'limits')} />
          {open === 'limits' && (
            <View style={{ paddingBottom: 12, paddingLeft: 28 }}>
              <T size={13} color={lightText}>Per payment: {formatZAR(500000)}</T>
              <T size={13} color={lightText} style={{ marginTop: 4 }}>Per day: {formatZAR(2000000)}</T>
              <T size={10} color={colors.slate} style={{ marginTop: 6 }}>
                Limits are set by your provider. Contact support to change them.
              </T>
            </View>
          )}
          <ListRow
            icon="snow-outline"
            label="Freeze Card"
            sub={cardFrozen ? 'Card is frozen. Payments are blocked.' : undefined}
            right={<Switch accessibilityLabel="Freeze Card" value={cardFrozen} onValueChange={setCardFrozen} trackColor={{ true: colors.gold, false: "#2A3350" }} {...({ activeThumbColor: colors.white } as object)} thumbColor={colors.white} />}
          />
          <ListRow
            icon="refresh-outline"
            label="Replace Card"
            sub={replaced ? 'Replacement requested. A new virtual card will arrive shortly.' : undefined}
            last
            onPress={() => setReplaced(true)}
          />
        </Card>
        {replaced && <OutlineButton label="Undo request" style={{ marginTop: 12 }} onPress={() => setReplaced(false)} />}
        <View style={{ marginTop: 18, opacity: 0.5 }}>
          <GoldButton label="+  Add Card or Account" disabled />
        </View>
        </>)}
      </ScrollView>
    </Screen>
  );
}
