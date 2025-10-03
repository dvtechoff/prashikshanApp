import { useMemo } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ColorSchemeName, useColorScheme } from 'react-native';

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
  profile: { focused: 'person-circle', unfocused: 'person-circle-outline' }
};

const tabBarStyle = {
  height: 64,
  paddingTop: 8,
  paddingBottom: 12,
  borderTopColor: '#e2e8f0',
  backgroundColor: '#ffffff'
};

const headerStyleByTheme = (scheme: ColorSchemeName) => ({
  backgroundColor: scheme === 'dark' ? '#0f172a' : '#ffffff'
});

export default function AppLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const tabColors = useMemo(
    () => ({
      active: '#2563eb',
      inactive: '#94a3b8',
      headerTint: isDark ? '#f8fafc' : '#0f172a'
    }),
    [isDark]
  );

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: headerStyleByTheme(colorScheme),
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: '600'
        },
        headerTintColor: tabColors.headerTint,
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
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="internships" options={{ title: 'Internships' }} />
      <Tabs.Screen name="applications" options={{ title: 'Applications' }} />
      <Tabs.Screen name="logbook" options={{ title: 'Logbook' }} />
      <Tabs.Screen name="analytics" options={{ title: 'Analytics' }} />
      <Tabs.Screen name="notifications" options={{ title: 'Alerts' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
