import React, { useEffect } from 'react';
import { Platform, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
} from '@expo-google-fonts/montserrat';
import { AppProvider, useApp } from '../src/state/app';
import { colors } from '../src/theme';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

const PUBLIC = ['splash', 'onboarding', 'login', 'device'];

function Guard({ children }: { children: React.ReactNode }) {
  const { ready, signedIn } = useApp();
  const segments = useSegments();
  const router = useRouter();
  const first = (segments[0] as string | undefined) ?? '(tabs)';
  useEffect(() => {
    if (ready && !signedIn && !PUBLIC.includes(first)) router.replace('/splash');
  }, [ready, signedIn, first, router]);
  return <>{children}</>;
}

export default function RootLayout() {
  const [loaded, fontError] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
  });

  useEffect(() => {
    if (loaded || fontError) SplashScreen.hideAsync().catch(() => undefined);
  }, [loaded, fontError]);

  if (!loaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <AppProvider>
        <View style={{ flex: 1, backgroundColor: Platform.OS === 'web' ? '#F8F6EE' : colors.black }}>
          <View
            style={[
              { flex: 1, width: '100%', backgroundColor: colors.bg },
              Platform.OS === 'web' ? { maxWidth: 420, alignSelf: 'center', overflow:'hidden', borderRadius:28, borderWidth:3, borderColor:'#22282D', boxShadow:'0 14px 48px rgba(25,20,9,.18)' } : null,
            ]}
          >
            <StatusBar style="light" />
            <Guard>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: colors.bg },
                  animation: 'fade',
                }}
              >
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="payment" options={{ gestureEnabled: false }} />
              </Stack>
            </Guard>
          </View>
        </View>
      </AppProvider>
    </SafeAreaProvider>
  );
}
