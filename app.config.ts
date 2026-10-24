import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'FACEPAY',
  owner: 'xtracash',
  slug: 'facepay-app-live',
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
    './plugins/withDeviceLocation.cjs',
    'expo-background-task',
    ['expo-notifications', { color: '#D4AF37' }],
    ['expo-location', {
      locationWhenInUsePermission: 'With your consent, FACEPAY records one home-location check per day for 15 days. No continuous route tracking.',
      locationAlwaysAndWhenInUsePermission: 'Allow optional daily background home checks during your chosen window. You can stop and delete the 15-day check at any time.',
      isIosBackgroundLocationEnabled: true,
      isAndroidBackgroundLocationEnabled: true,
      isAndroidForegroundServiceEnabled: false,
    }],
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
    eas: { projectId: '337c9782-6c11-4499-adf8-23b17b6e7003' },
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? null,
    releaseChannel: process.env.FACEPAY_STORE || 'preview',
  },
};

export default config;
