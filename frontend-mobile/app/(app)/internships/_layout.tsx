import { Stack } from 'expo-router';

export default function InternshipsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Internships' }} />
      <Stack.Screen name="[id]" options={{ title: 'Internship details' }} />
    </Stack>
  );
}
