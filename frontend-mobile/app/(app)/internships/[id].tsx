import { useMemo } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { useInternshipDetail } from '@/hooks/useInternships';
import { useCurrentUserQuery } from '@/hooks/useCurrentUser';

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

  const role = user?.role ?? 'STUDENT';
  const canApply = role === 'STUDENT';
  const canManage = role === 'INDUSTRY';

  const postedDate = useMemo(
    () => (data?.created_at ? new Date(data.created_at).toLocaleDateString() : null),
    [data?.created_at]
  );

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
        {canManage && (
          <Pressable
            style={styles.secondaryButton}
            onPress={() =>
              router.push({ pathname: '/(app)/internships/post', params: { internshipId: data.id } })
            }
          >
            <Text style={styles.secondaryButtonText}>Update listing</Text>
          </Pressable>
        )}
      </View>
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
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center'
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600'
  },
  disabledButton: {
    backgroundColor: '#cbd5f5'
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#cbd5f5',
    alignItems: 'center'
  },
  secondaryButtonText: {
    color: '#1e293b',
    fontSize: 15,
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
  }
});
