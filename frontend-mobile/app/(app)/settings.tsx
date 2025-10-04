import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useCurrentUserQuery } from '@/hooks/useCurrentUser';
import { useSignOut } from '@/hooks/useAuth';

type SettingItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  disabled?: boolean;
  roleSpecific?: string[];
} & (
  | { toggle: true; value: boolean; onToggle: (value: boolean) => void; onPress?: never; showArrow?: never }
  | { toggle?: false; onPress: () => void; showArrow: boolean; value?: never; onToggle?: never }
);

export default function SettingsScreen() {
  const { data: currentUser } = useCurrentUserQuery();
  const signOut = useSignOut();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  const settingsSections: Array<{ title: string; items: SettingItem[] }> = [
    {
      title: 'Navigation',
      items: [
        {
          icon: 'home-outline' as const,
          label: 'Dashboard',
          onPress: () => router.push('/(app)/dashboard'),
          showArrow: true
        },
        {
          icon: 'document-text-outline' as const,
          label: 'Applications',
          onPress: () => router.push('/(app)/applications'),
          showArrow: true
        },
        {
          icon: 'analytics-outline' as const,
          label: 'Analytics',
          onPress: () => router.push('/(app)/analytics'),
          showArrow: true
        },
        {
          icon: 'briefcase-outline' as const,
          label: 'Internships',
          onPress: () => router.push('/(app)/internships'),
          showArrow: true,
          roleSpecific: ['STUDENT', 'INDUSTRY']
        },
        {
          icon: 'book-outline' as const,
          label: 'Logbook',
          onPress: () => router.push('/(app)/logbook'),
          showArrow: true,
          roleSpecific: ['STUDENT', 'FACULTY']
        },
        {
          icon: 'ribbon-outline' as const,
          label: 'Credits',
          onPress: () => router.push('/(app)/credits'),
          showArrow: true,
          roleSpecific: ['STUDENT']
        },
        {
          icon: 'school-outline' as const,
          label: 'Skill Readiness',
          onPress: () => router.push('/(app)/skill-readiness'),
          showArrow: true,
          roleSpecific: ['STUDENT']
        },
        {
          icon: 'notifications-outline' as const,
          label: 'Notifications',
          onPress: () => router.push('/(app)/notifications'),
          showArrow: true
        }
      ]
    },
    {
      title: 'Account',
      items: [
        {
          icon: 'person-outline' as const,
          label: 'View Profile',
          onPress: () => router.push('/(app)/profile'),
          showArrow: true
        },
        {
          icon: 'create-outline' as const,
          label: 'Edit Profile',
          onPress: () => router.push('/(app)/profile/edit'),
          showArrow: true
        },
        {
          icon: 'key-outline' as const,
          label: 'Change Password',
          onPress: () => {
            // TODO: Implement password change
          },
          showArrow: true
        }
      ]
    },
    {
      title: 'Notifications',
      items: [
        {
          icon: 'notifications-outline' as const,
          label: 'All Notifications',
          toggle: true,
          value: notificationsEnabled,
          onToggle: setNotificationsEnabled
        },
        {
          icon: 'mail-outline' as const,
          label: 'Email Notifications',
          toggle: true,
          value: emailNotifications,
          onToggle: setEmailNotifications,
          disabled: !notificationsEnabled
        },
        {
          icon: 'phone-portrait-outline' as const,
          label: 'Push Notifications',
          toggle: true,
          value: pushNotifications,
          onToggle: setPushNotifications,
          disabled: !notificationsEnabled
        }
      ]
    },
    {
      title: 'App',
      items: [
        {
          icon: 'information-circle-outline' as const,
          label: 'About',
          onPress: () => {
            // TODO: Show about page
          },
          showArrow: true
        },
        {
          icon: 'help-circle-outline' as const,
          label: 'Help & Support',
          onPress: () => {
            // TODO: Show help page
          },
          showArrow: true
        },
        {
          icon: 'shield-checkmark-outline' as const,
          label: 'Privacy Policy',
          onPress: () => {
            // TODO: Show privacy policy
          },
          showArrow: true
        },
        {
          icon: 'document-text-outline' as const,
          label: 'Terms of Service',
          onPress: () => {
            // TODO: Show terms
          },
          showArrow: true
        }
      ]
    }
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      {/* User Info Card */}
      {currentUser && (
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(currentUser.name || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{currentUser.name || 'User'}</Text>
            <Text style={styles.userEmail}>{currentUser.email}</Text>
            <View style={styles.roleTag}>
              <Text style={styles.roleTagText}>{currentUser.role}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Settings Sections */}
      {settingsSections.map((section, sectionIndex) => {
        // Filter items based on roleSpecific property
        const filteredItems = section.items.filter(item => {
          if ('roleSpecific' in item && item.roleSpecific && currentUser) {
            return item.roleSpecific.includes(currentUser.role);
          }
          return true;
        });

        // Don't render section if no items after filtering
        if (filteredItems.length === 0) return null;

        return (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {filteredItems.map((item, itemIndex) => (
                <View key={itemIndex}>
                  <Pressable
                    style={[
                      styles.settingItem,
                      item.disabled && styles.settingItemDisabled
                    ]}
                    onPress={item.onPress}
                    disabled={item.disabled || item.toggle}
                  >
                    <View style={styles.settingItemLeft}>
                      <View style={styles.iconContainer}>
                        <Ionicons 
                          name={item.icon} 
                          size={22} 
                          color={item.disabled ? '#94a3b8' : '#475569'} 
                        />
                      </View>
                    <Text style={[
                      styles.settingLabel,
                      item.disabled && styles.settingLabelDisabled
                    ]}>
                      {item.label}
                    </Text>
                  </View>
                  
                  {item.toggle ? (
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      disabled={item.disabled}
                      trackColor={{ false: '#cbd5e1', true: '#3b82f6' }}
                      thumbColor="#ffffff"
                    />
                  ) : item.showArrow ? (
                    <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                  ) : null}
                </Pressable>
                {itemIndex < filteredItems.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>
        );
      })}

      {/* Sign Out Button */}
      <Pressable style={styles.signOutButton} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={22} color="#dc2626" />
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </Pressable>

      {/* App Version */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  contentContainer: {
    padding: 20,
    gap: 20,
    paddingBottom: 40
  },
  header: {
    marginBottom: 16
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a'
  },
  userCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff'
  },
  userInfo: {
    flex: 1,
    gap: 4
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a'
  },
  userEmail: {
    fontSize: 14,
    color: '#64748b'
  },
  roleTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4
  },
  roleTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb'
  },
  section: {
    gap: 12
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    paddingLeft: 4
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16
  },
  settingItemDisabled: {
    opacity: 0.5
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  settingLabel: {
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '500',
    flex: 1
  },
  settingLabelDisabled: {
    color: '#94a3b8'
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginLeft: 64
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fee2e2',
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3
  },
  signOutButtonText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600'
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 8
  },
  versionText: {
    fontSize: 14,
    color: '#94a3b8'
  }
});
