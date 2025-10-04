import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';

import { useAuthStatus } from '@/hooks/useAuth';

export default function Index() {
  const { isAuthenticated } = useAuthStatus();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Small delay to ensure storage is fully loaded
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return <Redirect href={isAuthenticated ? '/(app)/dashboard' : '/(auth)/login'} />;
}
