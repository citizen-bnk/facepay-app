import React, { useState } from 'react';
import { ScrollView, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTransactions } from '../../src/state/hooks';
import { formatZAR } from '../../src/format';
import { colors, fonts } from '../../src/theme';
import { Card, Pill, Screen, T, TxRow, lightText } from '../../src/ui/kit';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'captured', label: 'Paid' },
  { key: 'pending', label: 'Pending' },
  { key: 'declined', label: 'Declined' },
];

function groupOf(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return 'Today';
  const days = (now.getTime() - d.getTime()) / 86400000;
  return days < 7 ? 'This Week' : 'Earlier';
}

export default function History() {
  const [status, setStatus] = useState('all');
  const [q, setQ] = useState('');
  const { items, error } = useTransactions(status, q);
  const spent = (items ?? []).filter((t) => t.status === 'captured').reduce((a, t) => a + t.amountMinor, 0);

  return (
    <Screen padBottom={false}>
      <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
        <T w="bold" size={22} accessibilityRole="header">
          Transaction History
        </T>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, height: 44, marginTop: 14 }}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            accessibilityLabel="Search transactions"
            value={q}
            onChangeText={setQ}
            placeholder="Search merchant"
            placeholderTextColor={colors.slate}
            style={{ flex: 1, marginLeft: 8, color: colors.white, fontFamily: fonts.regular, fontSize: 14, outlineWidth: 0 } as object}
          />
        </View>
        <View style={{ flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 12, padding: 3, marginTop: 12 }}>
          {FILTERS.map((f) => (
            <Pill segmented key={f.key} label={f.label} active={status === f.key} onPress={() => setStatus(f.key)} />
          ))}
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 32 }}>
        {items && status === 'all' && (
          <T size={12} color={colors.muted} style={{ marginBottom: 10 }}>
            Paid in this list: <T w="bold" size={12} color={colors.white}>{formatZAR(spent)}</T>
          </T>
        )}
        {error && (
          <T size={12} color={colors.danger}>
            Could not load transactions: {error}
          </T>
        )}
        <Card light style={{ paddingVertical: 4 }}>
          {items === null ? (
            <T size={12} color={colors.muted} style={{ padding: 16 }}>
              Loading...
            </T>
          ) : items.length === 0 ? (
            <T size={13} color={colors.muted} style={{ padding: 20, textAlign: 'center' }}>
              No transactions match.
            </T>
          ) : (
            items.map((t, i) => {
              const grp = groupOf(t.createdAt);
              const showHead = i === 0 || groupOf(items[i - 1].createdAt) !== grp;
              return (
                <View key={t.id + i}>
                  {showHead && (
                    <T w="semibold" size={12} color={lightText} style={{ marginTop: 12 }}>
                      {grp}
                    </T>
                  )}
                  <TxRow tx={t} last={i === items.length - 1} />
                </View>
              );
            })
          )}
        </Card>
      </ScrollView>
    </Screen>
  );
}
