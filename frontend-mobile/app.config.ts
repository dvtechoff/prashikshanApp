import type { ConfigContext, ExpoConfig } from 'expo/config';

declare const process: {
  env?: Record<string, string | undefined>;
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Prashikshan',
  slug: 'prashikshan',
  scheme: 'prashikshan',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.prashikshan.app'
  },
  android: {
    package: 'com.prashikshan.app',
    softwareKeyboardLayoutMode: 'pan',
    adaptiveIcon: {
      backgroundColor: '#ffffff'
    },
    userInterfaceStyle: 'automatic'
  },
  web: {
    bundler: 'metro'
  },
  plugins: ['expo-router'],
  experiments: {
    typedRoutes: true
  },
  extra: {
    apiUrl: process.env?.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8000'
  }
});
