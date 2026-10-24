import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../src/state/app';
import { colors, fonts } from '../src/theme';
import { PHONE_COUNTRIES, phoneInputValue, type CountryCode } from '../src/phone';
import { DEMO_OTP_ENABLED, normalisePhone, requestOtp, verifyOtp, otpDeliveryStatus } from '../src/otp';
import { GoldButton, Header, Keypad, Screen, T } from '../src/ui/kit';

export default function Login() {
  const router = useRouter();
  const { signIn } = useApp();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState<CountryCode>('ZA');
  const [countryPicker, setCountryPicker] = useState(false);
  const [search, setSearch] = useState('');
  const [verifiedPhone, setVerifiedPhone] = useState('');
  const selectedCountry = PHONE_COUNTRIES.find(c => c.code === country)!;
  const formatNumber = () => { const value = phoneInputValue(phone, country); if (value) { setCountry(value.country); setPhone(value.national); } }; 
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [delivery, setDelivery] = useState('whatsapp');
  useEffect(() => { if(step!=='otp'||DEMO_OTP_ENABLED)return; let mounted=true; const poll=()=>otpDeliveryStatus().then(value=>{if(mounted)setDelivery(value)}).catch(()=>{}); void poll();const timer=setInterval(poll,15000);return()=>{mounted=false;clearInterval(timer)}; },[step]);

  const sendCode = async () => {
    const p = normalisePhone(phone, country);
    if (!p) return setError('Enter a valid mobile number for the selected country.');
    setError(null);
    setBusy(true);
    try {
      setVerifiedPhone(p);
      const formatted = phoneInputValue(p, country);
      if (formatted) { setCountry(formatted.country); setPhone(formatted.national); }
      setDelivery(await requestOtp(p));
      setStep('otp');
    } catch (error) { setError(error instanceof Error ? error.message : 'Could not send the code. Please retry.'); }
    finally { setBusy(false); }
  };

  const submit = async (c: string) => {
    const p = verifiedPhone;
    setBusy(true);
    try {
    const ok = await verifyOtp(p, c);
    if (!ok) {
      setBusy(false);
      setCode('');
      return setError('That code is incorrect. Try again.');
    }
    await signIn(p);
    setBusy(false);
    router.replace('/consent');
    } catch (error) { setError(error instanceof Error ? error.message : 'Verification failed. Please retry.'); setCode(''); } finally { setBusy(false); }
  };

  const press = (k: string) => {
    if (busy || code.length >= 6) return;
    const next = code + k;
    setCode(next);
    setError(null);
    if (next.length === 6) submit(next);
  };

  return (
    <Screen style={{ paddingHorizontal: 24 }}>
      <Modal visible={countryPicker} animationType="slide" onRequestClose={() => setCountryPicker(false)}><View style={{flex:1,backgroundColor:colors.bg,padding:24,paddingTop:48}}><Pressable accessibilityRole="button" accessibilityLabel="Close country selector" onPress={() => setCountryPicker(false)} style={{paddingVertical:16}}><T>Close</T></Pressable><T w="bold" size={23}>Choose your country</T><TextInput accessibilityLabel="Search countries" value={search} onChangeText={setSearch} placeholder="Country or calling code" placeholderTextColor={colors.muted} style={{color:colors.white,padding:16,borderWidth:1,borderColor:colors.border,borderRadius:12,marginVertical:16}}/><ScrollView>{PHONE_COUNTRIES.filter(c => (c.name+' '+c.code+' '+c.dial).toLowerCase().includes(search.toLowerCase())).map(c => <Pressable key={c.code} accessibilityRole="button" accessibilityLabel={c.name+' '+c.dial} onPress={() => {setCountry(c.code);setCountryPicker(false);setSearch('');setError(null);}} style={{paddingVertical:16,borderBottomWidth:1,borderColor:colors.border}}><T>{c.name}  {c.dial}</T></Pressable>)}</ScrollView></View></Modal>
      <Header title={step === 'phone' ? 'Sign in' : 'Verify your number'} onBack={() => (step === 'otp' ? (setStep('phone'), setCode('')) : router.back())} />
      {step === 'phone' ? (
        <View style={{ flex: 1 }}>
          <T w="bold" size={24} style={{ marginTop: 24 }}>
            What's your mobile number?
          </T>
          <T color={colors.muted} style={{ marginTop: 8, lineHeight: 20 }}>
            We’ll send your code on WhatsApp first. SMS is used only when the provider confirms this number is not on WhatsApp.
          </T>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 28,
              height: 56,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: error ? colors.danger : colors.border,
              backgroundColor: colors.surface,
              paddingHorizontal: 16,
            }}
          >
            <Pressable accessibilityRole="button" accessibilityLabel="Select country code" onPress={() => setCountryPicker(true)} style={{ minHeight: 44, justifyContent: 'center' }}><T w="semibold">{selectedCountry.dial} ▾</T></Pressable>
            <View style={{ width: 1, height: 24, backgroundColor: colors.border, marginHorizontal: 12 }} />
            <TextInput
              testID="phone-input"
              accessibilityLabel="Mobile number"
              value={phone}
              onBlur={formatNumber}
              onChangeText={(t) => {
                const formatted = phoneInputValue(t, country);
                if (formatted) { setCountry(formatted.country); setPhone(formatted.national); }
                else setPhone(t);
                setError(null);
              }}
              placeholder={country === 'ZA' ? '82 123 4567' : 'Mobile number'}
              placeholderTextColor={colors.slate}
              keyboardType="phone-pad"
              autoComplete="tel"
              style={{ flex: 1, color: colors.white, fontFamily: fonts.medium, fontSize: 16, outlineWidth: 0 } as object}
            />
          </View>
          {error && (
            <T size={12} color={colors.danger} style={{ marginTop: 8 }}>
              {error}
            </T>
          )}
          <View style={{ flex: 1 }} />
          <GoldButton label={busy ? 'Sending...' : 'Send code'} disabled={busy} onPress={sendCode} style={{ marginBottom: 24 }} />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <T w="bold" size={24} style={{ marginTop: 24 }}>
            Enter the 6-digit code
          </T>
          <T color={colors.muted} style={{ marginTop: 8, lineHeight: 20 }}>
            Number: {verifiedPhone}. {DEMO_OTP_ENABLED ? 'Sandbox only: no message was sent. Use test code 123456.' : delivery === 'sms' ? 'WhatsApp was unavailable for this number. Check your SMS.' : 'Check WhatsApp for your code.'}
          </T>
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 28 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <View
                key={i}
                style={{
                  width: 46,
                  height: 56,
                  marginHorizontal: 4,
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: i === code.length ? colors.gold : error ? colors.danger : colors.border,
                  backgroundColor: colors.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <T w="bold" size={22}>
                  {code[i] ?? ''}
                </T>
              </View>
            ))}
          </View>
          <View style={{ height: 24, alignItems: 'center', justifyContent: 'center', marginTop: 12 }}>
            {busy ? <ActivityIndicator color={colors.gold} /> : error ? <T size={12} color={colors.danger}>{error}</T> : null}
          </View>
          <View style={{ flex: 1 }} />
          <Keypad onKey={press} onDelete={() => setCode((c) => c.slice(0, -1))} />
          <View style={{ height: 16 }} />
        </View>
      )}
    </Screen>
  );
}
