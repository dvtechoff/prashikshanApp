import { Stack } from 'expo-router';
import { UI_CONFIG } from '@/config/ui';

export default function LogbookLayout() {
  return (
    <Stack screenOptions={{ headerShown: UI_CONFIG.SHOW_HEADERS }}>
      <Stack.Screen name="index" options={{ title: 'Logbook' }} />
      <Stack.Screen name="new" options={{ title: 'New logbook entry' }} />
      <Stack.Screen name="[id]" options={{ title: 'Entry details' }} />
    </Stack>
  );
}
