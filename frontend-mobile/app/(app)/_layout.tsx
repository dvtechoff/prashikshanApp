import { useMemo } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { useCurrentUserQuery } from '@/hooks/useCurrentUser';
import { UI_CONFIG } from '@/config/ui';

const iconNameMap: Record<
  string,
  { focused: keyof typeof Ionicons.glyphMap; unfocused: keyof typeof Ionicons.glyphMap }
> = {
  dashboard: { focused: 'speedometer', unfocused: 'speedometer-outline' },
  internships: { focused: 'briefcase', unfocused: 'briefcase-outline' },
  applications: { focused: 'document-text', unfocused: 'document-text-outline' },
  logbook: { focused: 'book', unfocused: 'book-outline' },
  analytics: { focused: 'analytics', unfocused: 'analytics-outline' },
  notifications: { focused: 'notifications', unfocused: 'notifications-outline' },
  profile: { focused: 'person-circle', unfocused: 'person-circle-outline' },
  'skill-readiness': { focused: 'school', unfocused: 'school-outline' },
  credits: { focused: 'ribbon', unfocused: 'ribbon-outline' }
};

const tabBarStyle = {
  height: 64,
  paddingTop: 8,
  paddingBottom: 12,
  borderTopColor: '#e2e8f0',
  backgroundColor: '#ffffff'
};

export default function AppLayout() {
  const {
    data: currentUser,
    isLoading,
    isError,
    refetch
  } = useCurrentUserQuery();

  const tabColors = useMemo(
    () => ({
      active: '#2563eb',
      inactive: '#94a3b8'
    }),
    []
  );

  const tabsByRole: Record<string, string[]> = {
    STUDENT: ['dashboard', 'internships', 'applications', 'logbook', 'notifications', 'profile'],
    FACULTY: ['dashboard', 'applications', 'logbook', 'analytics', 'notifications', 'profile'],
    INDUSTRY: ['dashboard', 'internships', 'applications', 'analytics', 'notifications', 'profile'],
    ADMIN: ['dashboard', 'analytics', 'notifications', 'profile']
  };

  const tabOptions: Record<
    string,
    {
      title: string;
    }
  > = {
    dashboard: { title: 'Dashboard' },
    internships: { title: 'Internships' },
    applications: { title: 'Applications' },
    logbook: { title: 'Logbook' },
    analytics: { title: 'Analytics' },
    notifications: { title: 'Alerts' },
    profile: { title: 'Profile' },
    credits: { title: 'Credits' },
    'skill-readiness': { title: 'Readiness' }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.statusText}>Loading your workspace…</Text>
      </View>
    );
  }

  if (isError || !currentUser) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>We couldn’t confirm your role.</Text>
        <Text style={styles.statusText}>Check your network and try again.</Text>
        <Pressable style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const activeTabs = tabsByRole[currentUser.role] ?? tabsByRole.STUDENT;

  const hiddenTabs = Object.keys(tabOptions).filter((name) => !activeTabs.includes(name));

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle,
        tabBarActiveTintColor: tabColors.active,
        tabBarInactiveTintColor: tabColors.inactive,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600'
        },
        tabBarIcon: ({ color, focused }) => {
          const icon = iconNameMap[route.name] ?? {
            focused: 'ellipse',
            unfocused: 'ellipse-outline'
          };
          return <Ionicons name={focused ? icon.focused : icon.unfocused} size={22} color={color} />;
        }
      })}
    >
      {activeTabs.map((name) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title: tabOptions[name]?.title ?? name,
            href: undefined,
            // Show header for dashboard with "Home" title
            ...(name === 'dashboard' && {
              headerShown: UI_CONFIG.SHOW_HEADERS,
              headerTitle: 'Home'
            })
          }}
        />
      ))}
      {hiddenTabs.map((name) => (
        <Tabs.Screen
          key={`hidden-${name}`}
          name={name}
          options={{
            title: tabOptions[name]?.title ?? name,
            href: null
          }}
        />
      ))}
      <Tabs.Screen
        name="students/[id]"
        options={{
          href: null
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
    backgroundColor: '#f8fafc'
  },
  statusText: {
    color: '#475569'
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'center'
  },
  retryButton: {
    marginTop: 8,
    backgroundColor: '#2563eb',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10
  },
  retryText: {
    color: '#ffffff',
    fontWeight: '600'
  }
});
