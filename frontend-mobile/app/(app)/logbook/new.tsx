import { useState, useMemo } from 'react';
import { router } from 'expo-router';
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

import { useCreateLogbookEntry } from '@/hooks/useLogbookEntries';
import { useApplicationList } from '@/hooks/useApplications';
import { useInternshipList } from '@/hooks/useInternships';
import type { LogbookAttachment } from '@/types/api';
import { getErrorMessage } from '@/utils/error';

interface FormState {
  entryDate: string;
  hours: string;
  description: string;
  applicationId: string;
}

const initialState: FormState = {
  entryDate: '',
  hours: '',
  description: '',
  applicationId: ''
};

export default function NewLogbookEntryScreen() {
  const [formState, setFormState] = useState<FormState>(initialState);
  const [attachments, setAttachments] = useState<LogbookAttachment[]>([]);
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const createEntry = useCreateLogbookEntry();
  const { data: applications } = useApplicationList();
  const { data: internships } = useInternshipList();

  // Filter applications that are approved by both industry and faculty
  const acceptedApplications = useMemo(() => {
    if (!applications) return [];
    return applications.filter(
      app => app.industry_status === 'APPROVED' && app.faculty_status === 'APPROVED'
    );
  }, [applications]);

  // Create a map of internship IDs to internship data for quick lookup
  const internshipMap = useMemo(() => {
    if (!internships) return new Map();
    return new Map(internships.map(internship => [internship.id, internship]));
  }, [internships]);

  const isValid = Boolean(
    formState.entryDate &&
    formState.hours &&
    formState.description &&
    formState.applicationId
  );

  const handleChange = <Key extends keyof FormState>(key: Key, value: FormState[Key]) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddAttachment = () => {
    if (!attachmentName.trim() || !attachmentUrl.trim()) {
      Alert.alert('Missing info', 'Please provide both file name and URL.');
      return;
    }
    setAttachments((prev) => [
      ...prev,
      { name: attachmentName.trim(), url: attachmentUrl.trim() }
    ]);
    setAttachmentName('');
    setAttachmentUrl('');
  };

  const handleRemoveAttachment = (name: string) => {
    setAttachments((prev) => prev.filter((item) => item.name !== name));
  };

  const handleSubmit = async () => {
    if (!isValid) {
      Alert.alert('Missing details', 'Please fill in date, hours, and description.');
      return;
    }
    const payload = {
  application_id: formState.applicationId.trim(),
      entry_date: formState.entryDate,
      hours: Number(formState.hours),
      description: formState.description.trim(),
      attachments
    };

    try {
      const result = await createEntry.submit(payload);
      if (result.status === 'synced') {
        router.replace('/(app)/logbook' as never);
      } else {
        Alert.alert(
          'Saved offline',
          'We stored your entry locally and will sync it when you reconnect.'
        );
        router.replace('/(app)/logbook' as never);
      }
    } catch (error) {
      Alert.alert('Could not save entry', getErrorMessage(error));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={96}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>New logbook entry</Text>
        <Text style={styles.subtitle}>Document your weekly experience and hours.</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={formState.entryDate}
            onChangeText={(value) => handleChange('entryDate', value)}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.fieldGroup, styles.halfWidth]}>
            <Text style={styles.label}>Hours worked</Text>
            <TextInput
              style={styles.input}
              placeholder="6"
              value={formState.hours}
              onChangeText={(value) => handleChange('hours', value)}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Select Internship</Text>
          <Text style={styles.helperText}>Choose from your accepted internships</Text>
          {acceptedApplications.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No accepted internships found</Text>
              <Text style={styles.emptySubtext}>
                You need to have an approved internship application before creating a logbook entry.
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.applicationsList} nestedScrollEnabled>
              {acceptedApplications.map((app) => {
                const internship = internshipMap.get(app.internship_id);
                const isSelected = formState.applicationId === app.id;
                return (
                  <Pressable
                    key={app.id}
                    style={[
                      styles.applicationCard,
                      isSelected && styles.applicationCardSelected
                    ]}
                    onPress={() => handleChange('applicationId', app.id)}
                  >
                    <View style={styles.radioContainer}>
                      <View style={[
                        styles.radioOuter,
                        isSelected && styles.radioOuterSelected
                      ]}>
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                      <View style={styles.applicationInfo}>
                        <Text style={[
                          styles.applicationTitle,
                          isSelected && styles.applicationTitleSelected
                        ]}>
                          {internship?.title || 'Internship'}
                        </Text>
                        {internship?.location && (
                          <Text style={styles.applicationLocation}>
                            {internship.location}
                          </Text>
                        )}
                        <Text style={styles.applicationMeta}>
                          Applied: {new Date(app.applied_at).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Summarize what you worked on and what you learned."
            value={formState.description}
            onChangeText={(value) => handleChange('description', value)}
            multiline
            numberOfLines={6}
          />
        </View>

        <View style={styles.attachmentSection}>
          <Text style={styles.sectionTitle}>Attachments</Text>
          <Text style={styles.helperText}>Upload files to cloud storage and paste the links here.</Text>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.attachmentInput]}
              placeholder="File name"
              value={attachmentName}
              onChangeText={setAttachmentName}
            />
            <TextInput
              style={[styles.input, styles.attachmentInput]}
              placeholder="https://..."
              value={attachmentUrl}
              onChangeText={setAttachmentUrl}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>
          <Pressable style={styles.secondaryButton} onPress={handleAddAttachment}>
            <Text style={styles.secondaryButtonText}>Add attachment</Text>
          </Pressable>

          {attachments.length > 0 && (
            <View style={styles.attachmentList}>
              {attachments.map((attachment) => (
                <View key={attachment.name} style={styles.attachmentItem}>
                  <View>
                    <Text style={styles.attachmentName}>{attachment.name}</Text>
                    <Text style={styles.attachmentUrl}>{attachment.url}</Text>
                  </View>
                  <Pressable onPress={() => handleRemoveAttachment(attachment.name)}>
                    <Text style={styles.removeText}>Remove</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>

        <Pressable
          style={[styles.primaryButton, (!isValid || createEntry.isPending) && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={!isValid || createEntry.isPending}
        >
          {createEntry.isPending ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.primaryButtonText}>Save entry</Text>
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
  textArea: {
    minHeight: 160,
    textAlignVertical: 'top'
  },
  row: {
    flexDirection: 'row',
    gap: 12
  },
  halfWidth: {
    flex: 1
  },
  attachmentSection: {
    gap: 12,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
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
  helperText: {
    color: '#64748b',
    fontSize: 13
  },
  attachmentInput: {
    flex: 1
  },
  secondaryButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#94a3b8'
  },
  secondaryButtonText: {
    color: '#1e293b',
    fontWeight: '600'
  },
  attachmentList: {
    gap: 12
  },
  attachmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#f8fafc',
    borderRadius: 12
  },
  attachmentName: {
    fontWeight: '700',
    color: '#0f172a'
  },
  attachmentUrl: {
    color: '#2563eb'
  },
  removeText: {
    color: '#dc2626',
    fontWeight: '600'
  },
  attachmentInputRow: {
    flexDirection: 'row',
    gap: 10
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 16
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16
  },
  buttonDisabled: {
    opacity: 0.5
  },
  emptyState: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 8
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#a16207',
    textAlign: 'center'
  },
  emptySubtext: {
    fontSize: 14,
    color: '#92400e',
    textAlign: 'center'
  },
  applicationsList: {
    maxHeight: 300,
    borderWidth: 1,
    borderColor: '#cbd5f5',
    borderRadius: 12,
    backgroundColor: '#ffffff'
  },
  applicationCard: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  applicationCardSelected: {
    backgroundColor: '#eff6ff',
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb'
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2
  },
  radioOuterSelected: {
    borderColor: '#2563eb'
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563eb'
  },
  applicationInfo: {
    flex: 1,
    gap: 4
  },
  applicationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a'
  },
  applicationTitleSelected: {
    color: '#1d4ed8'
  },
  applicationLocation: {
    fontSize: 14,
    color: '#64748b'
  },
  applicationMeta: {
    fontSize: 12,
    color: '#94a3b8'
  }
});
