import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

import { useLogbookEntryDetail, useUpdateLogbookEntry } from '@/hooks/useLogbookEntries';
import { useCurrentUserQuery } from '@/hooks/useCurrentUser';

export default function LogbookEntryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, error, refetch } = useLogbookEntryDetail(id);
  const { data: currentUser } = useCurrentUserQuery();
  const updateMutation = useUpdateLogbookEntry();
  const [comment, setComment] = useState('');

  const role = currentUser?.role ?? 'STUDENT';
  const canReview = role === 'FACULTY';

  const handleApprove = async () => {
    if (!id) return;
    try {
      await updateMutation.mutateAsync({
        id,
        payload: {
          approved: true,
          faculty_comments: comment.trim() || undefined
        }
      });
      Alert.alert('Approved', 'The logbook entry has been approved successfully.');
      setComment('');
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to approve entry.');
    }
  };

  const handleReject = async () => {
    if (!id) return;
    if (!comment.trim()) {
      Alert.alert('Comment required', 'Please provide feedback before rejecting.');
      return;
    }
    try {
      await updateMutation.mutateAsync({
        id,
        payload: {
          approved: false,
          faculty_comments: comment.trim()
        }
      });
      Alert.alert('Rejected', 'The logbook entry has been rejected with your feedback.');
      setComment('');
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to reject entry.');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.statusText}>Loading entry…</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>We couldn’t find this logbook entry.</Text>
        {error && <Text style={styles.errorDescription}>{error.message}</Text>}
        <Pressable style={styles.primaryButton} onPress={() => refetch()}>
          <Text style={styles.primaryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Entry summary</Text>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>{new Date(data.entry_date).toLocaleDateString()}</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Hours logged</Text>
          <Text style={styles.value}>{data.hours}</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Approval</Text>
          <Text style={[styles.badge, data.approved ? styles.badgeApproved : styles.badgePending]}>
            {data.approved ? 'Approved' : 'Pending approval'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What was accomplished</Text>
        <Text style={styles.body}>{data.description}</Text>
      </View>

      {data.attachments && data.attachments.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attachments</Text>
          {data.attachments.map((attachment) => (
            <View key={attachment.url} style={styles.attachmentRow}>
              <View>
                <Text style={styles.attachmentName}>{attachment.name}</Text>
                <Text style={styles.attachmentUrl}>{attachment.url}</Text>
              </View>
              <Pressable onPress={() => Alert.alert('Attachment', 'Download coming soon.') }>
                <Text style={styles.link}>Open</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {canReview && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Faculty comments</Text>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Leave feedback for the student"
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={4}
          />
          <View style={styles.actionRow}>
            <Pressable 
              style={[styles.secondaryButton, styles.rejectButton]} 
              onPress={handleReject}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <ActivityIndicator size="small" color="#dc2626" />
              ) : (
                <Text style={styles.rejectText}>Reject</Text>
              )}
            </Pressable>
            <Pressable 
              style={[styles.primaryButton, styles.approveButton]} 
              onPress={handleApprove}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.primaryButtonText}>Approve</Text>
              )}
            </Pressable>
          </View>
        </View>
      )}

      {data.faculty_comments && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Faculty feedback</Text>
          <Text style={styles.body}>{data.faculty_comments}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 18,
    backgroundColor: '#f8fafc'
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    gap: 12,
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a'
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  label: {
    color: '#475569',
    fontSize: 14
  },
  value: {
    color: '#0f172a',
    fontWeight: '600'
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    fontWeight: '700'
  },
  badgeApproved: {
    backgroundColor: '#dcfce7',
    color: '#15803d'
  },
  badgePending: {
    backgroundColor: '#fef3c7',
    color: '#b45309'
  },
  body: {
    color: '#475569',
    lineHeight: 22
  },
  attachmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  attachmentName: {
    fontWeight: '600',
    color: '#0f172a'
  },
  attachmentUrl: {
    color: '#2563eb'
  },
  link: {
    color: '#2563eb',
    fontWeight: '600'
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#f8fafc',
    color: '#0f172a'
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top'
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12
  },
  primaryButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12
  },
  approveButton: {
    backgroundColor: '#16a34a'
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700'
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingVertical: 14,
    alignItems: 'center'
  },
  rejectButton: {
    backgroundColor: '#fff1f2'
  },
  rejectText: {
    color: '#b91c1c',
    fontWeight: '700'
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
    backgroundColor: '#f8fafc'
  },
  statusText: {
    color: '#475569'
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'center'
  },
  errorDescription: {
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center'
  }
});
