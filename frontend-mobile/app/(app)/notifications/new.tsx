import { useState } from 'react';
import { router } from 'expo-router';
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
import { Ionicons } from '@expo/vector-icons';

import { useCreateBulkNotification } from '@/hooks/useNotifications';
import { useCurrentUserQuery } from '@/hooks/useCurrentUser';
import { getErrorMessage } from '@/utils/error';

export default function NewNotificationScreen() {
  const { data: currentUser } = useCurrentUserQuery();
  const createNotification = useCreateBulkNotification();
  
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<Set<'STUDENT' | 'FACULTY' | 'INDUSTRY'>>(new Set());

  const toggleRole = (role: 'STUDENT' | 'FACULTY' | 'INDUSTRY') => {
    setSelectedRoles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(role)) {
        newSet.delete(role);
      } else {
        newSet.add(role);
      }
      return newSet;
    });
  };

  const canSendNotifications = currentUser?.role === 'FACULTY' || currentUser?.role === 'INDUSTRY';

  const handleSend = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (selectedRoles.size === 0) {
      Alert.alert('Error', 'Please select at least one target audience');
      return;
    }

    try {
      // Send notification to each selected role
      const promises = Array.from(selectedRoles).map(role =>
        createNotification.mutateAsync({
          title: title.trim(),
          body: body.trim() || undefined,
          target_role: role
        })
      );

      await Promise.all(promises);
      
      Alert.alert('Success', 'Notification sent successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error));
    }
  };

  if (!canSendNotifications) {
    return (
      <View style={styles.centered}>
        <Ionicons name="lock-closed" size={48} color="#94a3b8" />
        <Text style={styles.errorTitle}>Access Denied</Text>
        <Text style={styles.errorDescription}>
          Only faculty and industry can send notifications
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Send Notification</Text>
        <Text style={styles.subtitle}>Broadcast a message to students or staff</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Notification title"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Message</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Notification message (optional)"
            value={body}
            onChangeText={setBody}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Send to * (select one or more)</Text>
          <View style={styles.checkboxGroup}>
            <Pressable
              style={[styles.checkboxButton, selectedRoles.has('STUDENT') && styles.checkboxButtonActive]}
              onPress={() => toggleRole('STUDENT')}
            >
              <View style={styles.checkboxOuter}>
                {selectedRoles.has('STUDENT') && (
                  <Ionicons name="checkmark" size={16} color="#2563eb" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>All Students</Text>
            </Pressable>

            <Pressable
              style={[styles.checkboxButton, selectedRoles.has('FACULTY') && styles.checkboxButtonActive]}
              onPress={() => toggleRole('FACULTY')}
            >
              <View style={styles.checkboxOuter}>
                {selectedRoles.has('FACULTY') && (
                  <Ionicons name="checkmark" size={16} color="#2563eb" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>All Faculty</Text>
            </Pressable>

            <Pressable
              style={[styles.checkboxButton, selectedRoles.has('INDUSTRY') && styles.checkboxButtonActive]}
              onPress={() => toggleRole('INDUSTRY')}
            >
              <View style={styles.checkboxOuter}>
                {selectedRoles.has('INDUSTRY') && (
                  <Ionicons name="checkmark" size={16} color="#2563eb" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>All Industry Partners</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>

        <Pressable
          style={[styles.sendButton, createNotification.isPending && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={createNotification.isPending}
        >
          {createNotification.isPending ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Ionicons name="send" size={20} color="#ffffff" />
              <Text style={styles.sendButtonText}>Send Notification</Text>
            </>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    gap: 24,
    backgroundColor: '#f8fafc'
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
    backgroundColor: '#f8fafc'
  },
  header: {
    gap: 4
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a'
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b'
  },
  form: {
    gap: 20
  },
  field: {
    gap: 8
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a'
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#0f172a'
  },
  textArea: {
    minHeight: 120,
    paddingTop: 14
  },
  checkboxGroup: {
    gap: 12
  },
  checkboxButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16
  },
  checkboxButtonActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff'
  },
  checkboxOuter: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '500'
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center'
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a'
  },
  sendButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  sendButtonDisabled: {
    opacity: 0.6
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff'
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0f172a'
  },
  errorDescription: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center'
  }
});
