module.exports = ({ config }) => ({
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
    package: 'com.prashikshan.app'
  },
  web: {
    bundler: 'metro'
  },
  plugins: ['expo-router'],
  experiments: {
    typedRoutes: true
  },
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8000'
  }
});
