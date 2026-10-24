import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../src/state/app';
import { colors } from '../src/theme';
import { GoldButton, Header, OutlineButton, Screen, T } from '../src/ui/kit';

const POINTS: { icon: keyof typeof Ionicons.glyphMap; text: string }[] = [
  { icon: 'scan', text: 'A short liveness check confirms you are present when you choose to pay with your face.' },
  { icon: 'phone-portrait', text: 'This testing build uses simulated verification. No live certified biometric provider is connected. FacePay does not upload face photos from this app.' },
  { icon: 'hand-left', text: 'You can pay with a PIN instead at any time. Face Pay is optional.' },
  { icon: 'ban', text: 'Revoke this consent whenever you like in Profile > Biometric consent.' },
];

/** Explicit biometric consent. Nothing is pre-ticked. */
export default function Consent() {
  const router = useRouter();
  const { grantConsent, pinHash } = useApp();
  const [agree, setAgree] = useState(false);

  const next = (granted: boolean) => {
    const pinRoute = { pathname: '/pin', params: { mode: 'setup', next: '/' } } as const;
    if (granted) router.replace({ pathname: '/face-auth', params: { purpose: 'enrol' } });
    else router.replace(pinHash ? '/' : pinRoute);
  };

  return (
    <Screen style={{ paddingHorizontal: 24 }}>
      <Header title="Biometric consent" back={false} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 12 }}>
        <View style={{ alignItems: 'center', marginTop: 8 }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(212,165,58,0.14)', borderWidth: 1.5, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="shield-checkmark" size={34} color={colors.gold} />
          </View>
          <T w="bold" size={22} style={{ marginTop: 16, textAlign: 'center' }}>
            Use your face to pay?
          </T>
          <T size={13} color={colors.muted} style={{ marginTop: 8, textAlign: 'center', lineHeight: 20 }}>
            Face data is sensitive personal information. We need your explicit consent before enabling Face Pay.
          </T>
        </View>
        <View style={{ marginTop: 20 }}>
          {POINTS.map((p) => (
            <View key={p.icon} style={{ flexDirection: 'row', marginBottom: 14 }}>
              <Ionicons name={p.icon} size={20} color={colors.gold} style={{ width: 30, marginTop: 1 }} />
              <T size={13} color="#D5DAE6" style={{ flex: 1, lineHeight: 19 }}>
                {p.text}
              </T>
            </View>
          ))}
        </View>
        <Pressable
          testID="consent-check"
          accessibilityRole="checkbox"
          accessibilityState={{ checked: agree }}
          onPress={() => setAgree((a) => !a)}
          style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 4 }}
        >
          <View style={{ width: 24, height: 24, borderRadius: 7, borderWidth: 1.5, borderColor: agree ? colors.gold : colors.muted, backgroundColor: agree ? colors.gold : 'transparent', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
            {agree && <Ionicons name="checkmark" size={16} color={colors.black} />}
          </View>
          <T size={13} style={{ flex: 1, lineHeight: 19 }}>
            I consent to FacePay processing a face liveness check to authorise my payments. I understand I can revoke this at any time.
          </T>
        </Pressable>
      </ScrollView>
      <View style={{ paddingBottom: 20, paddingTop: 8 }}>
        <GoldButton
          label="I agree, enable Face Pay"
          disabled={!agree}
          onPress={async () => {
            await grantConsent();
            next(true);
          }}
        />
        <OutlineButton label="Not now, use PIN only" style={{ marginTop: 10 }} onPress={() => next(false)} />
      </View>
    </Screen>
  );
}
