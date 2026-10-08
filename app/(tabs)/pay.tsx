import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/state/app';
import { DEMO_QR, parseQr } from '../../src/payment/qr';
import { PAYEES } from '../../src/merchants';
import { registerMerchantName } from '../../src/api/fixtures';
import { colors } from '../../src/theme';
import { FaceGlyph, GoldButton, IconCircle, OutlineButton, Pill, Screen, T } from '../../src/ui/kit';

type Mode = 'face' | 'qr' | 'nfc';

export default function Pay() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const { setDraft } = useApp();
  const [mode, setMode] = useState<Mode>(params.mode === 'nfc' ? 'nfc' : params.mode === 'face' ? 'face' : 'qr');
  const [merchant, setMerchant] = useState(PAYEES[0]);
  const [perm, requestPerm] = useCameraPermissions();
  const [qrError, setQrError] = useState<string | null>(null);
  const handled = useRef(false);

  useEffect(() => {
    if (params.mode === 'qr' || params.mode === 'nfc' || params.mode === 'face') setMode(params.mode);
  }, [params.mode]);
  useEffect(() => {
    if (mode === 'qr') handled.current = false;
  }, [mode]);

  const goAmount = (id: string, name: string, source: string, amountMinor?: number) => {
    registerMerchantName(id, name);
    if (amountMinor) {
      setDraft({ merchantId: id, merchantName: name, amountMinor, source: source as 'qr' });
      router.push('/review');
    } else {
      router.push({ pathname: '/amount', params: { merchantId: id, merchantName: name, source } });
    }
  };

  const onScan = ({ data }: { data: string }) => {
    if (handled.current) return;
    const p = parseQr(data);
    if (!p) {
      setQrError('That QR code is not a FacePay payment code.');
      return;
    }
    handled.current = true;
    setQrError(null);
    goAmount(p.merchantId, p.merchantName, 'qr', p.amountMinor);
  };

  const tabs: { key: Mode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'qr', label: 'QR Code', icon: 'qr-code-outline' },
    { key: 'nfc', label: 'NFC / Tap', icon: 'wifi-outline' },
    { key: 'face', label: 'Face Pay', icon: 'happy-outline' },
  ];

  return (
    <Screen padBottom={false}>
      <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
        <T w="bold" size={22} accessibilityRole="header">
          Scan & Pay
        </T>
        <View style={{ flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 14, padding: 4, marginTop: 16, borderWidth: 1, borderColor: colors.border }}>
          {tabs.map((t) => {
            const on = mode === t.key;
            return (
              <Pressable
                key={t.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                onPress={() => setMode(t.key)}
                style={{ flex: 1, height: 40, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: on ? colors.gold : 'transparent' }}
              >
                <Ionicons name={t.icon} size={16} color={on ? colors.black : colors.muted} />
                <T w="semibold" size={12} color={on ? colors.black : colors.muted} style={{ marginLeft: 6 }}>
                  {t.label}
                </T>
              </Pressable>
            );
          })}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32, flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {mode === 'face' && (
          <View style={{ alignItems: 'center' }}>
            <View style={{ width: 190, height: 190, borderRadius: 95, borderWidth: 3, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(212,165,58,0.07)', marginTop: 8 }}>
              <FaceGlyph size={140} />
            </View>
            <T w="semibold" size={17} style={{ marginTop: 20 }}>
              Pay with your face
            </T>
            <T size={12} color={colors.muted} style={{ marginTop: 6, textAlign: 'center', lineHeight: 18 }}>
              Choose who you are paying, enter the amount, then confirm with a face check or your PIN.
            </T>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 20, flexGrow: 0 }}>
              {PAYEES.map((p) => (
                <Pill key={p.id} label={p.name} active={merchant.id === p.id} onPress={() => setMerchant(p)} />
              ))}
            </ScrollView>
            <GoldButton label={`Pay ${merchant.name}`} icon="happy-outline" style={{ width: '100%', marginTop: 20 }} onPress={() => goAmount(merchant.id, merchant.name, 'face')} />
          </View>
        )}

        {mode === 'qr' && (
          <View>
            <View style={{ backgroundColor: colors.white, borderRadius: 22, padding: 18, alignItems: 'center' }}>
              <View style={{ width: 250, height: 250, borderRadius: 12, overflow: 'hidden', backgroundColor: '#EEF0F5', alignItems: 'center', justifyContent: 'center' }}>
                {perm?.granted ? (
                  <CameraView
                    style={{ position: 'absolute', width: '100%', height: '100%' }}
                    facing="back"
                    barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                    onBarcodeScanned={onScan}
                  />
                ) : (
                  <View style={{ alignItems: 'center', padding: 20 }}>
                    <Ionicons name="qr-code" size={84} color="#C9CEDB" />
                    <T size={11} color="#6B7280" style={{ marginTop: 10, textAlign: 'center', lineHeight: 16 }}>
                      {perm && !perm.canAskAgain ? 'Camera blocked. Enable it in settings, or enter an amount.' : 'Allow camera access to scan a payment QR code.'}
                    </T>
                    {(!perm || perm.canAskAgain) && (
                      <OutlineButton label="Allow camera" tone="gold" style={{ marginTop: 10, height: 36 }} onPress={() => requestPerm().catch(() => undefined)} />
                    )}
                  </View>
                )}
              </View>
              <View pointerEvents="none" style={{ position: 'absolute', top: 10, left: 10, right: 10, bottom: 10 }}>
                {[
                  { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 16 },
                  { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 16 },
                  { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 16 },
                  { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 16 },
                ].map((c, i) => (
                  <View key={i} style={[{ position: 'absolute', width: 36, height: 36, borderColor: colors.gold }, c]} />
                ))}
              </View>
            </View>
            <T size={13} color={qrError ? colors.danger : colors.white} style={{ textAlign: 'center', marginTop: 16, lineHeight: 19 }}>
              {qrError ?? 'Scan merchant QR code\nto pay instantly'}
            </T>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 18 }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Demo QR"
                onPress={() => onScan({ data: DEMO_QR })}
                style={{ flex: 1, height: 84, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}
              >
                <Ionicons name="image-outline" size={24} color={colors.gold} />
                <T size={11} style={{ marginTop: 8 }}>Demo QR (simulate scan)</T>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Enter Amount"
                onPress={() => router.push({ pathname: '/amount', params: { source: 'manual' } })}
                style={{ flex: 1, height: 84, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}
              >
                <Ionicons name="keypad-outline" size={24} color={colors.gold} />
                <T size={11} style={{ marginTop: 8 }}>Enter Amount</T>
              </Pressable>
            </View>
          </View>
        )}

        {mode === 'nfc' && (
          <View style={{ alignItems: 'center', paddingTop: 12 }}>
            <IconCircle name="wifi" size={120} />
            <T w="semibold" size={17} style={{ marginTop: 24 }}>
              Tap to pay
            </T>
            <T size={12} color={colors.muted} style={{ marginTop: 8, textAlign: 'center', lineHeight: 18, paddingHorizontal: 12 }}>
              Hold your phone near a FacePay tap module or terminal. NFC tap is available in the native iOS and Android apps.
            </T>
            <OutlineButton label="Enter amount instead" icon="keypad-outline" style={{ marginTop: 24, alignSelf: 'stretch' }} onPress={() => router.push({ pathname: '/amount', params: { source: 'nfc' } })} />
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
