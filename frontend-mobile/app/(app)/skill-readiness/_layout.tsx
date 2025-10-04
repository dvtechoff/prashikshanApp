import { Stack } from 'expo-router';
import { UI_CONFIG } from '@/config/ui';

export default function SkillReadinessLayout() {
  return (
    <Stack screenOptions={{ headerShown: UI_CONFIG.SHOW_HEADERS }}>
      <Stack.Screen name="index" options={{ title: 'Skill readiness' }} />
    </Stack>
  );
}
