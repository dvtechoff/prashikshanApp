import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

export const API_URL: string =
  typeof extra.apiUrl === 'string' && extra.apiUrl.length > 0
    ? extra.apiUrl
    : 'http://10.0.2.2:8000';
