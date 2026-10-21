import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'FacePay',
  slug: 'facepay',
  scheme: 'facepay',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/facepay_app_icon_dark.png',
  userInterfaceStyle: 'dark',
  backgroundColor: '#0B0B0B',
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
      foregroundImage: './assets/facepay_mark.png',
      backgroundColor: '#0B0B0B',
    },
    permissions: ['CAMERA'],
  },
  web: {
    bundler: 'metro',
    output: 'single',
    favicon: './assets/facepay_app_icon_dark.png',
    name: 'FacePay',
    shortName: 'FacePay',
    backgroundColor: '#0B0B0B',
    themeColor: '#0B0B0B',
  },
  plugins: [
    'expo-router',
    'expo-font',
    ['expo-splash-screen', { image: './assets/facepay_mark.png', imageWidth: 200, resizeMode: 'contain', backgroundColor: '#0B0B0B' }],
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
