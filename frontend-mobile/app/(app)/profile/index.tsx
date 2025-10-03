import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { Pressable } from 'react-native';

import {
  useCurrentUserQuery,
  useUpdateCurrentUserMutation
} from '@/hooks/useCurrentUser';

interface ExtendedProfileState {
  name: string;
  email: string;
  collegeId: string;
  skills: string;
  resume: string;
  course: string;
  year: string;
}

const initialState: ExtendedProfileState = {
  name: '',
  email: '',
  collegeId: '',
  skills: '',
  resume: '',
  course: '',
  year: ''
};

export default function ProfileScreen() {
  const { data, isLoading } = useCurrentUserQuery();
  const updateMutation = useUpdateCurrentUserMutation();
  const [formState, setFormState] = useState<ExtendedProfileState>(initialState);

  useEffect(() => {
    if (!data) {
      return;
    }
    setFormState((prev) => ({
      ...prev,
      name: data.name,
      email: data.email,
      collegeId: data.college_id ?? '',
      skills: prev.skills,
      resume: prev.resume,
      course: prev.course,
      year: prev.year
    }));
  }, [data]);

  const hasChanges = useMemo(() => {
    if (!data) {
      return false;
    }
    return (
      formState.name !== data.name ||
      formState.collegeId !== (data.college_id ?? '') ||
      formState.skills.trim().length > 0 ||
      formState.resume.trim().length > 0 ||
      formState.course.trim().length > 0 ||
      formState.year.trim().length > 0
    );
  }, [data, formState]);

  const handleChange = <Key extends keyof ExtendedProfileState>(key: Key, value: ExtendedProfileState[Key]) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!data) {
      return;
    }
    try {
      await updateMutation.mutateAsync({
        name: formState.name.trim(),
        college_id: formState.collegeId.trim() || null
      });
      Alert.alert('Profile updated', 'Your information has been refreshed. Additional fields will sync soon.');
    } catch (error) {
      Alert.alert('Update failed', error instanceof Error ? error.message : 'Please try again later.');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.statusText}>Loading your profile…</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Unable to load profile details.</Text>
        <Text style={styles.errorDescription}>
          Please pull down to refresh or try again later.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Personal information</Text>
      <Text style={styles.subtitle}>Update your contact details and academic profile.</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Full name</Text>
          <TextInput
            value={formState.name}
            onChangeText={(value) => handleChange('name', value)}
            placeholder="Your name"
            style={styles.input}
          />
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput value={formState.email} editable={false} style={[styles.input, styles.disabled]} />
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>College ID</Text>
          <TextInput
            value={formState.collegeId}
            onChangeText={(value) => handleChange('collegeId', value)}
            placeholder="Enter your college ID"
            style={styles.input}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Academic profile</Text>
        <View style={styles.row}>
          <View style={[styles.fieldGroup, styles.halfWidth]}>
            <Text style={styles.label}>Course</Text>
            <TextInput
              value={formState.course}
              onChangeText={(value) => handleChange('course', value)}
              placeholder="B.Tech Computer Science"
              style={styles.input}
            />
          </View>
          <View style={[styles.fieldGroup, styles.halfWidth]}>
            <Text style={styles.label}>Year</Text>
            <TextInput
              value={formState.year}
              onChangeText={(value) => handleChange('year', value)}
              placeholder="3rd"
              style={styles.input}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Career profile</Text>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Skills</Text>
          <TextInput
            value={formState.skills}
            onChangeText={(value) => handleChange('skills', value)}
            placeholder="e.g. JavaScript, UI Design, React Native"
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={3}
          />
          <Text style={styles.helperText}>Separate skills with commas to keep your profile organised.</Text>
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Resume link</Text>
          <TextInput
            value={formState.resume}
            onChangeText={(value) => handleChange('resume', value)}
            placeholder="https://..."
            style={styles.input}
            autoCapitalize="none"
            keyboardType="url"
          />
        </View>
      </View>

      <Pressable
        style={[styles.primaryButton, (!hasChanges || updateMutation.isPending) && styles.buttonDisabled]}
        disabled={!hasChanges || updateMutation.isPending}
        onPress={handleSave}
      >
        {updateMutation.isPending ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.primaryButtonText}>Save changes</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 20,
    backgroundColor: '#f8fafc'
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a'
  },
  subtitle: {
    color: '#475569'
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    gap: 16,
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
  fieldGroup: {
    gap: 8
  },
  label: {
    color: '#334155',
    fontSize: 14
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
  disabled: {
    backgroundColor: '#e2e8f0',
    color: '#475569'
  },
  row: {
    flexDirection: 'row',
    gap: 12
  },
  halfWidth: {
    flex: 1
  },
  textArea: {
    textAlignVertical: 'top'
  },
  helperText: {
    color: '#64748b',
    fontSize: 13
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16
  },
  buttonDisabled: {
    opacity: 0.5
  },
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
    fontSize: 20,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'center'
  },
  errorDescription: {
    color: '#dc2626',
    textAlign: 'center'
  }
});
