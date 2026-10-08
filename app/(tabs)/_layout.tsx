import React from 'react';
import { Platform, View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, gradients } from '../../src/theme';

type Icon = keyof typeof Ionicons.glyphMap;
const icon =
  (on: Icon, off: Icon) =>
  ({ color, focused }: { color: import("react-native").ColorValue; focused: boolean }) => <Ionicons name={focused ? on : off} size={22} color={color} />;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: '#7C86A0',
        tabBarStyle: {
          backgroundColor: '#060B18',
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'web' ? 64 : undefined,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontFamily: fonts.semibold, fontSize: 10, marginBottom: Platform.OS === 'web' ? 6 : 0 },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: icon('home', 'home-outline') }} />
      <Tabs.Screen name="wallet" options={{ title: 'Wallet', tabBarIcon: icon('wallet', 'wallet-outline') }} />
      <Tabs.Screen
        name="pay"
        options={{
          title: 'Pay',
          tabBarIcon: ({ focused }) => (
            <LinearGradient
              colors={gradients.gold}
              style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginTop: -4, opacity: focused ? 1 : 0.9 }}
            >
              <Ionicons name="scan" size={21} color={colors.black} />
            </LinearGradient>
          ),
        }}
      />
      <Tabs.Screen name="history" options={{ title: 'History', tabBarIcon: icon('receipt', 'receipt-outline') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: icon('person', 'person-outline') }} />
    </Tabs>
  );
}
