import { useMemo, useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { useInternshipDetail, useUpdateInternship, useDeleteInternship } from '@/hooks/useInternships';
import { useCurrentUserQuery } from '@/hooks/useCurrentUser';
import { useApplicationList } from '@/hooks/useApplications';

export default function InternshipDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching
  } = useInternshipDetail(id);
  const { data: user } = useCurrentUserQuery();
  const { data: applications } = useApplicationList();
  const updateInternshipMutation = useUpdateInternship();
  const deleteInternshipMutation = useDeleteInternship();
  const [isUpdating, setIsUpdating] = useState(false);

  const role = user?.role ?? 'STUDENT';
  const canApply = role === 'STUDENT';
  const canManage = role === 'INDUSTRY';

  // Count applications for this internship (for industry users)
  const applicationCount = useMemo(() => {
    if (!canManage || !applications) return 0;
    return applications.filter(app => app.internship_id === id).length;
  }, [applications, id, canManage]);

  const postedDate = useMemo(
    () => (data?.created_at ? new Date(data.created_at).toLocaleDateString() : null),
    [data?.created_at]
  );

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return;
    
    setIsUpdating(true);
    try {
      await updateInternshipMutation.mutateAsync({
        id,
        payload: { status: newStatus }
      });
      Alert.alert('Success', `Internship status updated to ${newStatus}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update internship status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Internship',
      'Are you sure you want to delete this internship? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!id) return;
            try {
              await deleteInternshipMutation.mutateAsync(id);
              Alert.alert('Success', 'Internship deleted successfully', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete internship');
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.statusText}>Loading internship details…</Text>
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>We couldn’t load this internship</Text>
        <Text style={styles.errorMessage}>{error?.message ?? 'Please try again shortly.'}</Text>
        <Pressable style={styles.primaryButton} onPress={() => refetch()}>
          {isRefetching ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.primaryButtonText}>Retry</Text>
          )}
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{data.title}</Text>
        <Text style={styles.subTitle}>{data.location ?? 'Location shared after selection'}</Text>
        {postedDate && <Text style={styles.meta}>Posted {postedDate}</Text>}
      </View>

      {data.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About the opportunity</Text>
          <Text style={styles.sectionBody}>{data.description}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key details</Text>
        <View style={styles.metaList}>
          {data.remote && <Text style={styles.metaPill}>Remote friendly</Text>}
          {data.duration_weeks && (
            <Text style={styles.metaPill}>Duration: {data.duration_weeks} weeks</Text>
          )}
          {data.credits !== null && data.credits !== undefined && (
            <Text style={styles.metaPill}>Credits: {data.credits}</Text>
          )}
          {data.stipend && <Text style={styles.metaPill}>Stipend: ₹{data.stipend}</Text>}
        </View>
      </View>

      {data.skills && data.skills.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills preferred</Text>
          <View style={styles.skillsContainer}>
            {data.skills.map((skill) => (
              <View key={skill} style={styles.skillChip}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {canManage && (
        <>
          {/* Show applications count */}
          <View style={styles.industrySection}>
            <View style={styles.applicationsSummary}>
              <Text style={styles.applicationsLabel}>Applications Received</Text>
              <Text style={styles.applicationsCount}>{applicationCount}</Text>
            </View>
          </View>

          {/* Status Management Section */}
          <View style={styles.statusManagementSection}>
            <Text style={styles.statusManagementTitle}>Internship Status</Text>
            <View style={styles.statusButtonsRow}>
              <Pressable
                style={[
                  styles.statusButton,
                  data.status === 'OPEN' && styles.statusButtonActive,
                  isUpdating && styles.statusButtonDisabled
                ]}
                onPress={() => handleStatusChange('OPEN')}
                disabled={isUpdating || data.status === 'OPEN'}
              >
                <Text style={[
                  styles.statusButtonText,
                  data.status === 'OPEN' && styles.statusButtonTextActive
                ]}>
                  {data.status === 'OPEN' ? '✓ Open' : 'Open'}
                </Text>
              </Pressable>
              
              <Pressable
                style={[
                  styles.statusButton,
                  data.status === 'CLOSED' && styles.statusButtonActive,
                  isUpdating && styles.statusButtonDisabled
                ]}
                onPress={() => handleStatusChange('CLOSED')}
                disabled={isUpdating || data.status === 'CLOSED'}
              >
                <Text style={[
                  styles.statusButtonText,
                  data.status === 'CLOSED' && styles.statusButtonTextActive
                ]}>
                  {data.status === 'CLOSED' ? '✓ Closed' : 'Closed'}
                </Text>
              </Pressable>
              
              <Pressable
                style={[
                  styles.statusButton,
                  data.status === 'ARCHIVED' && styles.statusButtonActive,
                  isUpdating && styles.statusButtonDisabled
                ]}
                onPress={() => handleStatusChange('ARCHIVED')}
                disabled={isUpdating || data.status === 'ARCHIVED'}
              >
                <Text style={[
                  styles.statusButtonText,
                  data.status === 'ARCHIVED' && styles.statusButtonTextActive
                ]}>
                  {data.status === 'ARCHIVED' ? '✓ Archived' : 'Archived'}
                </Text>
              </Pressable>
            </View>
            {isUpdating && (
              <ActivityIndicator size="small" color="#2563eb" style={{ marginTop: 8 }} />
            )}
          </View>
        </>
      )}

      <View style={styles.actionRow}>
        {canApply && (
          <Pressable
            style={[styles.primaryButton, data.status !== 'OPEN' && styles.disabledButton]}
            onPress={() =>
              router.push({ pathname: '/(app)/applications/new', params: { internshipId: data.id } })
            }
            disabled={data.status !== 'OPEN'}
          >
            <Text style={styles.primaryButtonText}>
              {data.status === 'OPEN' ? 'Apply for this internship' : 'Applications closed'}
            </Text>
          </Pressable>
        )}
      </View>
      
      {canManage && (
        <View style={styles.industryActions}>
          <Pressable
            style={styles.primaryButton}
            onPress={() => router.push({
              pathname: '/(app)/applications',
              params: { internshipId: data.id, internshipTitle: data.title }
            })}
          >
            <Text style={styles.primaryButtonText}>View Applications ({applicationCount})</Text>
          </Pressable>
          
          <Pressable
            style={styles.secondaryButton}
            onPress={() =>
              router.push({ pathname: '/(app)/internships/post', params: { internshipId: data.id } })
            }
          >
            <Text style={styles.secondaryButtonText}>Edit Listing</Text>
          </Pressable>

          <Pressable
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Text style={styles.deleteButtonText}>Delete Internship</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f8fafc',
    gap: 24
  },
  header: {
    gap: 8
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a'
  },
  subTitle: {
    color: '#475569'
  },
  meta: {
    color: '#64748b',
    fontSize: 13
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
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
  sectionBody: {
    fontSize: 15,
    lineHeight: 22,
    color: '#475569'
  },
  metaList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  metaPill: {
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    fontWeight: '600',
    fontSize: 13
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  skillChip: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999
  },
  skillText: {
    color: '#3730a3',
    fontWeight: '600'
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700'
  },
  disabledButton: {
    backgroundColor: '#cbd5f5',
    shadowOpacity: 0
  },
  actionRow: {
    gap: 12
  },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#cbd5f5',
    alignItems: 'center',
    backgroundColor: '#ffffff'
  },
  secondaryButtonText: {
    color: '#1e293b',
    fontSize: 16,
    fontWeight: '600'
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f8fafc',
    gap: 16
  },
  statusText: {
    fontSize: 15,
    color: '#475569'
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'center'
  },
  errorMessage: {
    fontSize: 15,
    color: '#dc2626',
    textAlign: 'center'
  },
  industrySection: {
    marginBottom: 16
  },
  industryActions: {
    gap: 12
  },
  applicationsSummary: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
    gap: 8
  },
  applicationsLabel: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  applicationsCount: {
    fontSize: 40,
    fontWeight: '700',
    color: '#2563eb'
  },
  statusManagementSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
    gap: 16
  },
  statusManagementTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a'
  },
  statusButtonsRow: {
    flexDirection: 'row',
    gap: 10
  },
  statusButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56
  },
  statusButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
    shadowColor: '#2563eb',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4
  },
  statusButtonDisabled: {
    opacity: 0.6
  },
  statusButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569'
  },
  statusButtonTextActive: {
    color: '#ffffff',
    fontWeight: '700'
  },
  deleteButton: {
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#dc2626',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    marginTop: 8
  },
  deleteButtonText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '700'
  }
});
