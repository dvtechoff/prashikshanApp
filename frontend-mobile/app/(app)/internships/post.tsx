import { useEffect, useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View
} from 'react-native';

import { useCreateInternship, useInternshipDetail, useUpdateInternship } from '@/hooks/useInternships';
import { useCurrentUserQuery } from '@/hooks/useCurrentUser';
import type { InternshipCreateRequest } from '@/types/api';
import { getErrorMessage } from '@/utils/error';

interface FormState {
  title: string;
  description: string;
  skills: string;
  stipend: string;
  location: string;
  remote: boolean;
  startDate: string;
  durationWeeks: string;
  credits: string;
  status: string;
}

const initialState: FormState = {
  title: '',
  description: '',
  skills: '',
  stipend: '',
  location: '',
  remote: false,
  startDate: '',
  durationWeeks: '',
  credits: '',
  status: 'OPEN'
};

export default function PostInternshipScreen() {
  const params = useLocalSearchParams<{ internshipId?: string }>();
  const internshipId = params.internshipId;
  const { data: user } = useCurrentUserQuery();
  const { data: internship, isLoading } = useInternshipDetail(internshipId);
  const createMutation = useCreateInternship();
  const updateMutation = useUpdateInternship();

  const [formState, setFormState] = useState<FormState>(initialState);

  useEffect(() => {
    if (internship && internshipId) {
      setFormState({
        title: internship.title,
        description: internship.description ?? '',
        skills: internship.skills?.join(', ') ?? '',
        stipend: internship.stipend ? String(internship.stipend) : '',
        location: internship.location ?? '',
        remote: internship.remote,
        startDate: internship.start_date ?? '',
        durationWeeks: internship.duration_weeks ? String(internship.duration_weeks) : '',
        credits: internship.credits ? String(internship.credits) : '',
        status: internship.status
      });
    }
  }, [internship, internshipId]);

  const isIndustryUser = user?.role === 'INDUSTRY';

  const isPending = createMutation.isPending || updateMutation.isPending;

  const isValid = useMemo(() => {
    return Boolean(formState.title.trim() && formState.description.trim());
  }, [formState.description, formState.title]);

  const handleChange = <Key extends keyof FormState>(key: Key, value: FormState[Key]) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!isIndustryUser) {
      Alert.alert('Access denied', 'Only industry mentors can post internships.');
      return;
    }

    const payload: InternshipCreateRequest = {
      title: formState.title.trim(),
      description: formState.description.trim(),
      skills: formState.skills
        .split(',')
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0),
      stipend: formState.stipend ? Number(formState.stipend) : null,
      location: formState.location.trim() || null,
      remote: formState.remote,
      start_date: formState.startDate.trim() || null,
      duration_weeks: formState.durationWeeks ? Number(formState.durationWeeks) : null,
      credits: formState.credits ? Number(formState.credits) : null,
      status: formState.status
    };

    try {
      if (internshipId) {
        await updateMutation.mutateAsync({ id: internshipId, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      router.back();
    } catch (error) {
      Alert.alert('Could not save internship', getErrorMessage(error));
    }
  };

  if (!isIndustryUser) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>This area is only for industry mentors.</Text>
        <Text style={styles.errorDescription}>
          Switch to an industry account to post or manage internship listings.
        </Text>
      </View>
    );
  }

  if (internshipId && isLoading && !internship) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.statusText}>Loading internship details…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={96}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{internshipId ? 'Update internship' : 'Post a new internship'}</Text>
        <Text style={styles.subtitle}>
          Share the opportunity details so students can apply.
        </Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            value={formState.title}
            onChangeText={(value) => handleChange('title', value)}
            placeholder="e.g. AI/ML Research Intern"
            style={styles.input}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            value={formState.description}
            onChangeText={(value) => handleChange('description', value)}
            placeholder="Summarize the work students will do"
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={6}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Skills (comma separated)</Text>
          <TextInput
            value={formState.skills}
            onChangeText={(value) => handleChange('skills', value)}
            placeholder="Python, Data Analysis, ML"
            style={styles.input}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Stipend (₹)</Text>
            <TextInput
              value={formState.stipend}
              onChangeText={(value) => handleChange('stipend', value)}
              placeholder="10000"
              keyboardType="numeric"
              style={styles.input}
            />
          </View>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Duration (weeks)</Text>
            <TextInput
              value={formState.durationWeeks}
              onChangeText={(value) => handleChange('durationWeeks', value)}
              placeholder="12"
              keyboardType="numeric"
              style={styles.input}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Start date</Text>
            <TextInput
              value={formState.startDate}
              onChangeText={(value) => handleChange('startDate', value)}
              placeholder="YYYY-MM-DD"
              style={styles.input}
            />
          </View>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Credits</Text>
            <TextInput
              value={formState.credits}
              onChangeText={(value) => handleChange('credits', value)}
              placeholder="4"
              keyboardType="numeric"
              style={styles.input}
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Location</Text>
          <TextInput
            value={formState.location}
            onChangeText={(value) => handleChange('location', value)}
            placeholder="City, State (or Remote)"
            style={styles.input}
          />
        </View>

        <View style={[styles.fieldGroup, styles.switchRow]}>
          <Text style={styles.label}>Remote friendly</Text>
          <Switch value={formState.remote} onValueChange={(value) => handleChange('remote', value)} />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.statusRow}>
            {['OPEN', 'DRAFT', 'CLOSED'].map((status) => (
              <Pressable
                key={status}
                style={[styles.statusChip, formState.status === status && styles.statusChipActive]}
                onPress={() => handleChange('status', status)}
              >
                <Text
                  style={[
                    styles.statusChipText,
                    formState.status === status && styles.statusChipTextActive
                  ]}
                >
                  {status}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          style={[styles.primaryButton, (!isValid || isPending) && styles.primaryButtonDisabled]}
          disabled={!isValid || isPending}
          onPress={handleSubmit}
        >
          {isPending ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.primaryButtonText}>
              {internshipId ? 'Save changes' : 'Publish internship'}
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  container: {
    padding: 20,
    gap: 18
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a'
  },
  subtitle: {
    fontSize: 15,
    color: '#475569'
  },
  fieldGroup: {
    gap: 8
  },
  label: {
    fontSize: 14,
    color: '#334155'
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#0f172a',
    backgroundColor: '#ffffff'
  },
  textArea: {
    height: 140,
    textAlignVertical: 'top'
  },
  row: {
    flexDirection: 'row',
    gap: 12
  },
  halfWidth: {
    flex: 1
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statusRow: {
    flexDirection: 'row',
    gap: 10
  },
  statusChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#cbd5f5'
  },
  statusChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb'
  },
  statusChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b'
  },
  statusChipTextActive: {
    color: '#ffffff'
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  primaryButtonDisabled: {
    opacity: 0.5
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600'
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
    backgroundColor: '#f8fafc'
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center'
  },
  errorDescription: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center'
  },
  statusText: {
    color: '#475569'
  }
});
