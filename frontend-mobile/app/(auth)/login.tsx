import { useState } from 'react';
import { Link, router } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

import { useLoginMutation } from '@/hooks/useAuth';
import { getErrorMessage } from '@/utils/error';

interface LoginFormState {
  email: string;
  password: string;
}

const initialState: LoginFormState = {
  email: '',
  password: ''
};

export default function LoginScreen() {
  const [formState, setFormState] = useState<LoginFormState>(initialState);
  const loginMutation = useLoginMutation();

  const handleChange = (key: keyof LoginFormState, value: string) => {
    setFormState((prev: LoginFormState) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    try {
      await loginMutation.mutateAsync(formState);
      router.replace('/(app)');
    } catch (error) {
      Alert.alert('Login failed', getErrorMessage(error, 'Please double-check your credentials.'));
    }
  };

  const disableSubmit = !formState.email || !formState.password || loginMutation.isPending;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Sign in to continue learning.</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          autoCapitalize="none"
          value={formState.email}
          onChangeText={(value: string) => handleChange('email', value)}
          keyboardType="email-address"
          placeholder="you@example.edu"
          style={styles.input}
          textContentType="emailAddress"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          value={formState.password}
          onChangeText={(value: string) => handleChange('password', value)}
          placeholder="••••••••"
          style={styles.input}
          secureTextEntry
          textContentType="password"
        />
      </View>

      <Pressable
        style={[styles.button, disableSubmit && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={disableSubmit}
      >
        {loginMutation.isPending ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Sign in</Text>
        )}
      </Pressable>

      {loginMutation.isError && (
        <Text style={styles.errorText}>
          {getErrorMessage(
            loginMutation.failureReason,
            'Unable to sign in right now. Please try again.'
          )}
        </Text>
      )}

  <Link href="../register" asChild>
        <Pressable style={styles.secondaryAction}>
          <Text style={styles.secondaryText}>Don&apos;t have an account? Create one</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center'
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    color: '#0f172a'
  },
  subtitle: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 32
  },
  inputGroup: {
    marginBottom: 20
  },
  label: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 6
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
  button: {
    marginTop: 16,
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
    marginTop: 12,
    color: '#dc2626',
    textAlign: 'center'
  },
  secondaryAction: {
    marginTop: 24,
    alignItems: 'center'
  },
  secondaryText: {
    color: '#2563eb',
    fontSize: 15,
    fontWeight: '600'
  }
});
