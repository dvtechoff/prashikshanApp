import { useState } from 'react';
import { router } from 'expo-router';
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

import { useRegisterMutation } from '@/hooks/useAuth';
import type { RegisterRequest, UserRole } from '@/types/api';
import { getErrorMessage } from '@/utils/error';

interface RegisterFormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

const initialState: RegisterFormState = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'STUDENT'
};

const roleOptions: Array<{ label: string; value: UserRole }> = [
  { label: 'Student', value: 'STUDENT' },
  { label: 'Faculty', value: 'FACULTY' },
  { label: 'Industry Mentor', value: 'INDUSTRY' }
];

export default function RegisterScreen() {
  const [formState, setFormState] = useState<RegisterFormState>(initialState);
  const registerMutation = useRegisterMutation();

  const passwordsMatch = formState.password === formState.confirmPassword;
  const isFormValid =
    !!formState.name.trim() &&
    !!formState.email.trim() &&
    formState.password.length >= 8 &&
    passwordsMatch &&
    !registerMutation.isPending;

  const handleChange = <Key extends keyof RegisterFormState>(key: Key, value: RegisterFormState[Key]) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const payload: RegisterRequest = {
      name: formState.name.trim(),
      email: formState.email.trim().toLowerCase(),
      password: formState.password,
      role: formState.role
    };

    try {
      await registerMutation.mutateAsync(payload);
      router.replace('/(app)');
    } catch (error) {
      Alert.alert('Could not create account', getErrorMessage(error));
    }
  };

  const goToLogin = () => {
    router.replace('/(auth)/login');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}
      keyboardVerticalOffset={80}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>Get started with Prashikshan in a few quick steps.</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full name</Text>
          <TextInput
            autoCapitalize="words"
            value={formState.name}
            onChangeText={(value) => handleChange('name', value)}
            placeholder="Enter your full name"
            style={styles.input}
            textContentType="name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            value={formState.email}
            onChangeText={(value) => handleChange('email', value)}
            placeholder="you@example.edu"
            style={styles.input}
            textContentType="emailAddress"
          />
        </View>

        <View style={styles.rowGroup}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              value={formState.password}
              onChangeText={(value) => handleChange('password', value)}
              placeholder="At least 8 characters"
              style={styles.input}
              secureTextEntry
              textContentType="newPassword"
            />
          </View>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Confirm password</Text>
            <TextInput
              value={formState.confirmPassword}
              onChangeText={(value) => handleChange('confirmPassword', value)}
              placeholder="Re-enter password"
              style={styles.input}
              secureTextEntry
              textContentType="password"
            />
          </View>
        </View>

        {!passwordsMatch && formState.confirmPassword.length > 0 && (
          <Text style={styles.errorText}>Passwords do not match.</Text>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Role</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={formState.role}
              onValueChange={(value: UserRole) => handleChange('role', value)}
            >
              {roleOptions.map((option) => (
                <Picker.Item key={option.value} label={option.label} value={option.value} />
              ))}
            </Picker>
          </View>
        </View>

        <Pressable
          style={[styles.button, !isFormValid && styles.buttonDisabled]}
          disabled={!isFormValid}
          onPress={handleSubmit}
        >
          {registerMutation.isPending ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Create account</Text>
          )}
        </Pressable>

        {registerMutation.isError && (
          <Text style={styles.errorText}>
            {getErrorMessage(
              registerMutation.failureReason,
              'Something went wrong. Please try again.'
            )}
          </Text>
        )}

        <Pressable onPress={goToLogin} style={styles.secondaryAction}>
          <Text style={styles.secondaryText}>Already have an account? Sign in</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  container: {
    padding: 24,
    gap: 20
  },
  header: {
    gap: 8
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a'
  },
  subtitle: {
    fontSize: 16,
    color: '#475569'
  },
  inputGroup: {
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
    color: '#0f172a'
  },
  rowGroup: {
    flexDirection: 'row',
    gap: 12
  },
  halfWidth: {
    flex: 1
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#cbd5f5',
    borderRadius: 12,
    overflow: 'hidden'
  },
  button: {
    marginTop: 8,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center'
  },
  buttonDisabled: {
    opacity: 0.5
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14
  },
  secondaryAction: {
    alignItems: 'center',
    paddingVertical: 4
  },
  secondaryText: {
    color: '#2563eb',
    fontSize: 15,
    fontWeight: '600'
  }
});
