import { Stack } from 'expo-router';
import { UI_CONFIG } from '@/config/ui';

export default function InternshipsLayout() {
  return (
    <Stack screenOptions={{ headerShown: UI_CONFIG.SHOW_HEADERS }}>
      <Stack.Screen name="index" options={{ title: 'Internships' }} />
      <Stack.Screen name="[id]" options={{ title: 'Internship details' }} />
    </Stack>
  );
}
