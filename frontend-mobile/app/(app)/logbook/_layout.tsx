import { Stack } from 'expo-router';

export default function LogbookLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Logbook' }} />
      <Stack.Screen name="new" options={{ title: 'New logbook entry' }} />
      <Stack.Screen name="[id]" options={{ title: 'Entry details' }} />
    </Stack>
  );
}
