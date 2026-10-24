import '../src/residence';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
} from '@expo-google-fonts/poppins';
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
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  useEffect(() => {
    if (loaded || fontError) SplashScreen.hideAsync().catch(() => undefined);
  }, [loaded, fontError]);

  if (!loaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <AppProvider>
        <View style={{ flex: 1, backgroundColor: colors.black }}>
          <View
            style={[
              { flex: 1, width: '100%', backgroundColor: colors.bg },
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
