import { Stack } from 'expo-router';

export default function ApplicationsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Applications' }} />
      <Stack.Screen name="[id]" options={{ title: 'Application details' }} />
      <Stack.Screen name="new" options={{ title: 'Apply for internship' }} />
    </Stack>
  );
}
