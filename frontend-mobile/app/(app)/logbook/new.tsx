import { useState } from 'react';
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
          <View style={[styles.fieldGroup, styles.halfWidth]}>
            <Text style={styles.label}>Application ID</Text>
            <TextInput
              style={styles.input}
              placeholder="Link to application"
              value={formState.applicationId}
              onChangeText={(value) => handleChange('applicationId', value)}
            />
          </View>
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
  }
});
