import React, { useState } from 'react';
import { ScrollView, Switch, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../../src/state/app';
import { isLive } from '../../src/api/client';
import { mobileRequest, mobileToken } from '../../src/mobile-api';
import { stopResidenceSchedule } from '../../src/residence';
import { colors } from '../../src/theme';
import { Card, ListRow, OutlineButton, Screen, T } from '../../src/ui/kit';

export default function Profile() {
  const router = useRouter();
  const { name, phone, biometricConsent, grantConsent, revokeConsent, pinHash, signOut } = useApp();
  const [notif, setNotif] = useState(true);
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  return (
    <Screen padBottom={false}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 32 }}>
        <T w="bold" size={22} accessibilityRole="header">
          Profile & Settings
        </T>
        <View style={{ alignItems: 'center', marginVertical: 20 }}>
          <View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: colors.surfaceAlt, borderWidth: 2, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center' }}>
            <T w="bold" size={34} color={colors.gold}>
              {name.slice(0, 1).toUpperCase()}
            </T>
          </View>
          <T w="bold" size={18} style={{ marginTop: 12 }}>
            {name}
          </T>
          <T size={12} color={colors.muted} style={{ marginTop: 2 }}>
            {phone || '+27 82 123 4567'}
          </T>
        </View>

        <T w="semibold" size={11} color={colors.gold} style={{ letterSpacing: 1, marginBottom: 6 }}>
          PRIVACY & SECURITY
        </T>
        <Card light style={{ paddingVertical: 4 }}>
          <ListRow
            icon="scan"
            label="Biometric consent"
            sub={biometricConsent ? 'Face Pay is on. Revoke any time.' : 'Face Pay is off. You pay with your PIN.'}
            right={
              <Switch
                accessibilityLabel="Biometric consent"
                value={biometricConsent}
                onValueChange={(v) => {
                  if (v) router.push('/consent');
                  else setConfirmRevoke(true);
                }}
                trackColor={{ true: colors.gold, false: "#2A3350" }} {...({ activeThumbColor: colors.white } as object)}
                thumbColor={colors.white}
              />
            }
          />
          {confirmRevoke && (
            <View style={{ paddingBottom: 14, paddingLeft: 28 }}>
              <T size={12} color="#374056" style={{ lineHeight: 18 }}>
                Revoke consent? Face Pay will stop working immediately and you will use your PIN.
              </T>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                <OutlineButton label="Keep" tone="gold" style={{ flex: 1, height: 40 }} onPress={() => setConfirmRevoke(false)} />
                <OutlineButton
                  label="Revoke"
                  tone="danger"
                  style={{ flex: 1, height: 40 }}
                  onPress={async () => {
                    await revokeConsent();
                    setConfirmRevoke(false);
                  }}
                />
              </View>
            </View>
          )}
          <ListRow
            icon="keypad"
            label="Payment PIN"
            sub={pinHash ? 'Change your 4-digit PIN' : 'Not set. Create one to pay without Face Pay.'}
            onPress={() => router.push({ pathname: '/pin', params: { mode: 'setup', next: '/(tabs)/profile' } })}
          />
          <ListRow icon="location-outline" label="Proof of residence" sub="15-day consent-based home check" onPress={() => router.push('/residence')} />
          <ListRow icon="shield-checkmark-outline" label="Security" sub="Device and sign-in protection" last />
        </Card>

        <T w="semibold" size={11} color={colors.gold} style={{ letterSpacing: 1, marginTop: 20, marginBottom: 6 }}>
          PREFERENCES
        </T>
        <Card light style={{ paddingVertical: 4 }}>
          <ListRow icon="person-outline" label="Personal Information" />
          <ListRow
            icon="notifications-outline"
            label="Notifications"
            right={<Switch value={notif} onValueChange={setNotif} trackColor={{ true: colors.gold, false: "#2A3350" }} {...({ activeThumbColor: colors.white } as object)} thumbColor={colors.white} />}
          />
          <ListRow icon="language-outline" label="Language" sub="English (South Africa)" />
          <ListRow icon="help-circle-outline" label="Help & Support" />
          <ListRow icon="document-text-outline" label="Terms & Privacy" last />
        </Card>

        <OutlineButton label="Log out" tone="danger" icon="log-out-outline" style={{ marginTop: 22 }} onPress={async () => { await signOut(); router.replace('/onboarding'); }} />
        <OutlineButton label="Delete mobile account" tone="danger" style={{ marginTop: 12 }} onPress={() => setConfirmDelete(true)} />
        {confirmDelete && <View style={{ marginTop: 16 }}>
          <T size={13}>Delete your mobile account, residence address, location checks and sign-in sessions? This cannot be undone. Developer subscriptions are managed separately in the developer portal.</T>
          {!!deleteError && <T size={12} color={colors.danger} style={{marginTop:8}}>{deleteError}</T>}
          <View style={{flexDirection:'row',gap:10,marginTop:12}}>
            <OutlineButton label="Keep account" disabled={deleting} style={{flex:1}} onPress={() => setConfirmDelete(false)}/>
            <OutlineButton label={deleting ? 'Deleting...' : 'Delete permanently'} tone="danger" disabled={deleting} style={{flex:1}} onPress={async () => {
              setDeleting(true); setDeleteError('');
              try {
                await stopResidenceSchedule();
                if (await mobileToken()) await mobileRequest('/account',{method:'DELETE'});
                await signOut(); router.replace('/onboarding');
              } catch(error) { setDeleteError(error instanceof Error ? error.message : 'Deletion failed. Please retry.'); }
              finally { setDeleting(false); }
            }}/>
          </View>
        </View>}
        <T size={10} color={colors.slate} style={{ textAlign: 'center', marginTop: 16 }}>
          FacePay v1.0.0 {'·'} {isLive ? 'Connected to FacePay API' : 'Demo mode (built-in sample data)'}
        </T>
      </ScrollView>
    </Screen>
  );
}
