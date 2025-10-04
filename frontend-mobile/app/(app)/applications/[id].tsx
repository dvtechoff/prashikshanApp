import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
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

import {
  useApplicationDetail,
  useUpdateApplication
} from '@/hooks/useApplications';
import { useCurrentUserQuery } from '@/hooks/useCurrentUser';
import { getErrorMessage } from '@/utils/error';

export default function ApplicationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: application, isLoading, error, refetch } = useApplicationDetail(id);
  const updateMutation = useUpdateApplication();
  const { data: currentUser } = useCurrentUserQuery();
  const [facultyComment, setFacultyComment] = useState('');

  const role = currentUser?.role ?? 'STUDENT';
  const isFaculty = role === 'FACULTY';
  
  // Check if the current user has already made a decision
  const hasAlreadyDecided = isFaculty 
    ? application?.faculty_status !== 'PENDING'
    : application?.industry_status !== 'PENDING';
  
  const canApprove = (role === 'FACULTY' || role === 'INDUSTRY') && !hasAlreadyDecided;

  const handleDecision = async (decision: 'APPROVED' | 'REJECTED') => {
    if (!application) {
      return;
    }
    try {
      await updateMutation.mutateAsync({
        id: application.id,
        payload: isFaculty
          ? { faculty_status: decision }
          : { industry_status: decision }
      });
      router.back();
    } catch (err) {
      Alert.alert('Update failed', getErrorMessage(err));
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.statusText}>Loading application…</Text>
      </View>
    );
  }

  if (!application) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>We couldn’t find this application.</Text>
        {error && <Text style={styles.errorDescription}>{error.message}</Text>}
        <Pressable style={styles.primaryButton} onPress={() => refetch()}>
          <Text style={styles.primaryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const internship = application.internship;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Application overview</Text>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Applied on</Text>
          <Text style={styles.value}>{new Date(application.applied_at).toLocaleDateString()}</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Industry status</Text>
          <Text style={styles.badge}>{application.industry_status}</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Faculty status</Text>
          <Text style={styles.badge}>{application.faculty_status}</Text>
        </View>
      </View>

      {internship && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Internship</Text>
          <Text style={styles.heading}>{internship.title}</Text>
          <Text style={styles.body}>{internship.description ?? 'No description provided.'}</Text>
          <View style={styles.metaGrid}>
            <View>
              <Text style={styles.metaLabel}>Location</Text>
              <Text style={styles.metaValue}>{internship.location ?? 'TBD'}</Text>
            </View>
            <View>
              <Text style={styles.metaLabel}>Duration</Text>
              <Text style={styles.metaValue}>
                {internship.duration_weeks ? `${internship.duration_weeks} weeks` : 'Not specified'}
              </Text>
            </View>
            <View>
              <Text style={styles.metaLabel}>Credits</Text>
              <Text style={styles.metaValue}>
                {internship.credits !== null && internship.credits !== undefined
                  ? internship.credits
                  : 'TBD'}
              </Text>
            </View>
          </View>
        </View>
      )}

      {application.resume_snapshot_url && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resume</Text>
          <Text style={styles.link}>
            {application.resume_snapshot_url.replace(/^https?:\/\//, '')}
          </Text>
          <Text style={styles.bodySmall}>Download to review the student’s resume.</Text>
        </View>
      )}

      {canApprove && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Decision</Text>
          <Text style={styles.bodySmall}>
            Share feedback with the student before approving or rejecting their application.
          </Text>
          <TextInput
            value={facultyComment}
            onChangeText={setFacultyComment}
            placeholder="Optional comments"
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={4}
          />
          <View style={styles.actionRow}>
            <Pressable style={[styles.secondaryButton, styles.rejectButton]} onPress={() => handleDecision('REJECTED')}>
              {updateMutation.isPending ? (
                <ActivityIndicator color="#dc2626" />
              ) : (
                <Text style={styles.rejectText}>Reject</Text>
              )}
            </Pressable>
            <Pressable
              style={[styles.primaryButton, styles.approveButton]}
              onPress={() => handleDecision('APPROVED')}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.primaryButtonText}>Approve</Text>
              )}
            </Pressable>
          </View>
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
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    fontWeight: '700'
  },
  heading: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a'
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: '#475569'
  },
  metaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  metaLabel: {
    color: '#64748b',
    fontSize: 13
  },
  metaValue: {
    color: '#0f172a',
    fontWeight: '600'
  },
  link: {
    color: '#2563eb',
    fontWeight: '600'
  },
  bodySmall: {
    color: '#64748b',
    fontSize: 13
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5f5',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
    color: '#0f172a'
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top'
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
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
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
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
