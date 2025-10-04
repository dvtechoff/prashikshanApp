import { Stack } from 'expo-router';
import { UI_CONFIG } from '@/config/ui';

export default function NotificationsLayout() {
  return (
    <Stack screenOptions={{ headerShown: UI_CONFIG.SHOW_HEADERS }}>
      <Stack.Screen name="index" options={{ title: 'Notifications' }} />
      <Stack.Screen name="new" options={{ title: 'Send Notification' }} />
    </Stack>
  );
}
