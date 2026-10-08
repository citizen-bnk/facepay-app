import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'FacePay',
  slug: 'facepay',
  scheme: 'facepay',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon-1024.png',
  userInterfaceStyle: 'dark',
  backgroundColor: '#081020',
  ios: {
    bundleIdentifier: 'com.facepay.app',
    supportsTablet: false,
    infoPlist: {
      NSCameraUsageDescription:
        'FacePay uses the camera to scan payment QR codes and to run the on-device face liveness check you opt in to. Camera frames are never stored or uploaded.',
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: 'com.facepay.app',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-foreground.png',
      backgroundColor: '#081020',
    },
    permissions: ['CAMERA'],
  },
  web: {
    bundler: 'metro',
    output: 'single',
    favicon: './assets/favicon.png',
    name: 'FacePay',
    shortName: 'FacePay',
    backgroundColor: '#081020',
    themeColor: '#081020',
  },
  plugins: [
    'expo-router',
    'expo-font',
    ['expo-splash-screen', { image: './assets/splash-icon.png', imageWidth: 200, resizeMode: 'contain', backgroundColor: '#081020' }],
    'expo-secure-store',
    [
      'expo-camera',
      {
        cameraPermission:
          'FacePay uses the camera to scan payment QR codes and to run the face liveness check you opt in to. Camera frames are never stored or uploaded.',
        recordAudioAndroid: false,
      },
    ],
  ],
  experiments: { typedRoutes: false },
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? null,
  },
};

export default config;
