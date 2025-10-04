import { Stack } from 'expo-router';
import { UI_CONFIG } from '@/config/ui';

export default function CreditsLayout() {
  return (
    <Stack screenOptions={{ headerShown: UI_CONFIG.SHOW_HEADERS }}>
      <Stack.Screen name="index" options={{ title: 'Credits & Reports' }} />
    </Stack>
  );
}
