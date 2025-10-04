import { useCallback } from 'react';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  useMarkNotificationAsRead,
  useNotificationList
} from '@/hooks/useNotifications';
import { useCurrentUserQuery } from '@/hooks/useCurrentUser';

export default function NotificationsScreen() {
  const { data: currentUser } = useCurrentUserQuery();
  const { data, isLoading, isRefetching, refetch } = useNotificationList();
  const markAsRead = useMarkNotificationAsRead();

  const canSendNotifications = currentUser?.role === 'FACULTY' || currentUser?.role === 'INDUSTRY';

  const handlePress = useCallback(
    (id: string, read: boolean) => {
      if (!read) {
        markAsRead.mutate(id);
      }
    },
    [markAsRead]
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.statusText}>Checking for updates…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {canSendNotifications && (
        <View style={styles.headerActions}>
          <Pressable
            style={styles.composeButton}
            onPress={() => router.push('/notifications/new')}
          >
            <Ionicons name="add-circle" size={20} color="#ffffff" />
            <Text style={styles.composeButtonText}>Send Notification</Text>
          </Pressable>
        </View>
      )}

      <FlatList
        data={data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor="#2563eb" />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>You&apos;re all caught up</Text>
            <Text style={styles.emptyDescription}>
              We&apos;ll let you know when there are updates from internships, faculty, or industry mentors.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={[styles.card, !item.read && styles.unreadCard]}
            onPress={() => handlePress(item.id, item.read)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              {!item.read && <View style={styles.unreadDot} />}
            </View>
            {item.body && <Text style={styles.cardBody}>{item.body}</Text>}
            <Text style={styles.timestamp}>
              {new Date(item.created_at).toLocaleString()}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  headerActions: {
    padding: 20,
    paddingBottom: 12
  },
  composeButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12
  },
  composeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff'
  },
  list: {
    padding: 20,
    paddingTop: 8,
    gap: 16
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    gap: 8,
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1
  },
  unreadCard: {
    borderWidth: 1,
    borderColor: '#818cf8'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a'
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: '#4f46e5'
  },
  cardBody: {
    color: '#475569'
  },
  timestamp: {
    color: '#64748b',
    fontSize: 13
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12
  },
  statusText: {
    color: '#475569'
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
    gap: 12
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a'
  },
  emptyDescription: {
    color: '#64748b',
    textAlign: 'center'
  }
});
