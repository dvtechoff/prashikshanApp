import { Redirect } from 'expo-router';

import { useAuthStatus } from '@/hooks/useAuth';

export default function Index() {
  const { isAuthenticated } = useAuthStatus();
  return <Redirect href={isAuthenticated ? '/(app)/dashboard' : '/(auth)/login'} />;
}
