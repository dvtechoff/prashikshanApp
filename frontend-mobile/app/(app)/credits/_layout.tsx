import { Stack } from 'expo-router';

export default function CreditsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Credits & Reports' }} />
    </Stack>
  );
}
