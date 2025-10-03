import { useEffect, useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

import { useApplyForInternship } from '@/hooks/useApplications';
import { useInternshipList } from '@/hooks/useInternships';
import { useCurrentUserQuery } from '@/hooks/useCurrentUser';
import { getErrorMessage } from '@/utils/error';

interface FormState {
  internshipId: string;
  resumeUrl: string;
  coverLetter: string;
}

const initialState: FormState = {
  internshipId: '',
  resumeUrl: '',
  coverLetter: ''
};

export default function NewApplicationScreen() {
  const params = useLocalSearchParams<{ internshipId?: string }>();
  const { data: internships, isLoading } = useInternshipList();
  const { data: currentUser } = useCurrentUserQuery();
  const [formState, setFormState] = useState<FormState>(initialState);
  const applyMutation = useApplyForInternship();

  useEffect(() => {
    if (params.internshipId && !formState.internshipId) {
      setFormState((prev) => ({ ...prev, internshipId: params.internshipId as string }));
    }
  }, [formState.internshipId, params.internshipId]);

  const isValid = useMemo(() => {
    return Boolean(formState.internshipId);
  }, [formState.internshipId]);

  const handleChange = <Key extends keyof FormState>(key: Key, value: FormState[Key]) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!isValid) {
      return;
    }
    try {
      await applyMutation.submit({
        internship_id: formState.internshipId,
        resume_snapshot_url: formState.resumeUrl.trim() || undefined
      });
      router.replace('/(app)/applications' as never);
    } catch (error) {
      Alert.alert('Could not submit application', getErrorMessage(error));
    }
  };

  if (currentUser?.role && currentUser.role !== 'STUDENT') {
    return (
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={96}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Applications restricted</Text>
          <Text style={styles.subtitle}>
            Only students can submit internship applications. Switch to a student account to continue.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={96}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Apply to an internship</Text>
        <Text style={styles.subtitle}>
          Choose the internship and attach your resume or cover letter link.
        </Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Internship</Text>
          <View style={styles.pickerWrapper}>
            {isLoading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#2563eb" />
                <Text style={styles.loadingText}>Loading internships…</Text>
              </View>
            ) : (
              <Picker
                selectedValue={formState.internshipId}
                onValueChange={(value: string) => handleChange('internshipId', value)}
              >
                <Picker.Item label="Select an internship" value="" />
                {(internships ?? []).map((internship) => (
                  <Picker.Item key={internship.id} label={internship.title} value={internship.id} />
                ))}
              </Picker>
            )}
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Resume link</Text>
          <TextInput
            value={formState.resumeUrl}
            onChangeText={(value) => handleChange('resumeUrl', value)}
            placeholder="https://..."
            style={styles.input}
            autoCapitalize="none"
            keyboardType="url"
          />
          <Text style={styles.helperText}>Upload your resume to cloud storage and paste the link.</Text>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Cover letter (optional)</Text>
          <TextInput
            value={formState.coverLetter}
            onChangeText={(value) => handleChange('coverLetter', value)}
            placeholder="Share why you’re a great fit"
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={6}
          />
        </View>

        <Pressable
          style={[styles.primaryButton, (!isValid || applyMutation.isPending) && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={!isValid || applyMutation.isPending}
        >
          {applyMutation.isPending ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.primaryButtonText}>Submit application</Text>
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
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#cbd5f5',
    borderRadius: 12,
    backgroundColor: '#ffffff'
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14
  },
  loadingText: {
    color: '#475569'
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
    minHeight: 140,
    textAlignVertical: 'top'
  },
  helperText: {
    color: '#64748b',
    fontSize: 13
  },
  primaryButton: {
    marginTop: 12,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center'
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16
  },
  buttonDisabled: {
    opacity: 0.5
  }
});
