import { Stack } from 'expo-router';
import { UI_CONFIG } from '@/config/ui';

export default function ApplicationsLayout() {
  return (
    <Stack screenOptions={{ headerShown: UI_CONFIG.SHOW_HEADERS }}>
      <Stack.Screen name="index" options={{ title: 'Applications' }} />
      <Stack.Screen name="[id]" options={{ title: 'Application details' }} />
      <Stack.Screen name="new" options={{ title: 'Apply for internship' }} />
    </Stack>
  );
}
