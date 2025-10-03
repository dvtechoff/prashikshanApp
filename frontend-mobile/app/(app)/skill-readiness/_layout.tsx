import { Stack } from 'expo-router';

export default function SkillReadinessLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Skill readiness' }} />
    </Stack>
  );
}
