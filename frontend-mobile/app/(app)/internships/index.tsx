import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View
} from 'react-native';

import { useInternshipFilters, useInternshipList } from '@/hooks/useInternships';
import { useCurrentUserQuery } from '@/hooks/useCurrentUser';
import { useApplicationList } from '@/hooks/useApplications';

const EmptyState = () => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyTitle}>No internships found</Text>
    <Text style={styles.emptyDescription}>
      Try adjusting the filters or check back later for new opportunities.
    </Text>
  </View>
);

export default function InternshipListScreen() {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [minCredits, setMinCredits] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const { data: user } = useCurrentUserQuery();

  const filters = useMemo(() => {
    const skillList = skillsInput
      .split(',')
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0);

    return {
      search,
      location: location.trim() || undefined,
      skills: skillList.length > 0 ? skillList : undefined,
      minCredits: minCredits ? Number(minCredits) : undefined,
      remote: remoteOnly ? true : undefined
    } as const;
  }, [location, minCredits, remoteOnly, search, skillsInput]);

  const { data, isLoading, isRefetching, refetch } = useInternshipList(filters);
  const internships = useInternshipFilters(data ?? [], search);
  const { data: applications } = useApplicationList();

  const isIndustry = user?.role === 'INDUSTRY';

  // Create a set of internship IDs that the user has already applied to
  const appliedInternshipIds = useMemo(() => {
    if (!applications) return new Set<string>();
    return new Set(applications.map(app => app.internship_id));
  }, [applications]);

  const renderItem = ({ item }: { item: (typeof internships)[number] }) => {
    const hasApplied = appliedInternshipIds.has(item.id);
    
    return (
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push({ pathname: '/(app)/internships/[id]', params: { id: item.id } })}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.title}>{item.title}</Text>
          <View style={styles.badges}>
            {item.remote && <Text style={styles.remoteBadge}>Remote</Text>}
            {hasApplied && <Text style={styles.appliedBadge}>Applied</Text>}
          </View>
        </View>
        {item.location && <Text style={styles.location}>{item.location}</Text>}
        {item.skills && item.skills.length > 0 && (
          <View style={styles.skillRow}>
            {item.skills.slice(0, 3).map((skill) => (
              <View key={skill} style={styles.skillChip}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
            {item.skills.length > 3 && (
              <View style={styles.moreChip}>
                <Text style={styles.moreChipText}>+{item.skills.length - 3}</Text>
              </View>
            )}
          </View>
        )}
        <View style={styles.metaRow}>
          {item.duration_weeks && (
            <Text style={styles.metaText}>Duration: {item.duration_weeks} weeks</Text>
          )}
          {item.credits !== null && item.credits !== undefined && (
            <Text style={styles.metaText}>Credits: {item.credits}</Text>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search by role, skill, or location"
        placeholderTextColor="#94a3b8"
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
      />
      <View style={styles.filterRow}>
        <TextInput
          placeholder="Location"
          value={location}
          onChangeText={setLocation}
          style={[styles.filterInput, styles.filterField]}
        />
        <TextInput
          placeholder="Skills (comma separated)"
          value={skillsInput}
          onChangeText={setSkillsInput}
          style={[styles.filterInput, styles.filterFieldWide]}
        />
      </View>
      <View style={styles.filterRow}>
        <TextInput
          placeholder="Min credits"
          value={minCredits}
          onChangeText={setMinCredits}
          style={[styles.filterInput, styles.filterField]}
          keyboardType="numeric"
        />
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Remote only</Text>
          <Switch value={remoteOnly} onValueChange={setRemoteOnly} />
        </View>
      </View>

      {isIndustry && (
        <Pressable
          style={styles.primaryButton}
          onPress={() => router.push('/(app)/internships/post' as never)}
        >
          <Text style={styles.primaryButtonText}>Post internship</Text>
        </Pressable>
      )}
      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Fetching internships…</Text>
        </View>
      ) : (
        <FlatList
          data={internships}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
              tintColor="#2563eb"
            />
          }
          ListEmptyComponent={<EmptyState />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8fafc'
  },
  searchInput: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    color: '#0f172a'
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12
  },
  filterInput: {
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    color: '#0f172a'
  },
  filterField: {
    flex: 1
  },
  filterFieldWide: {
    flex: 1.4
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  switchLabel: {
    color: '#0f172a',
    fontWeight: '500'
  },
  primaryButton: {
    marginVertical: 12,
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12
  },
  loadingText: {
    color: '#475569'
  },
  listContent: {
    paddingBottom: 24,
    gap: 16
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    gap: 10,
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1
  },
  cardPressed: {
    opacity: 0.9
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
    flexShrink: 0
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    flex: 1
  },
  remoteBadge: {
    backgroundColor: '#dcfce7',
    color: '#15803d',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    fontWeight: '600',
    fontSize: 12
  },
  appliedBadge: {
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    fontWeight: '600',
    fontSize: 12
  },
  location: {
    color: '#475569',
    fontSize: 14
  },
  skillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  skillChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#e0e7ff'
  },
  skillText: {
    color: '#3730a3',
    fontSize: 12,
    fontWeight: '600'
  },
  moreChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#f1f5f9'
  },
  moreChipText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600'
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12
  },
  metaText: {
    color: '#64748b',
    fontSize: 13
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
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center'
  }
});
