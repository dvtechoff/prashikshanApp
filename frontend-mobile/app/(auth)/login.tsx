import { useState } from 'react';
import { Link, router } from 'expo-router';
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
import { Ionicons } from '@expo/vector-icons';

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
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLoginMutation();

  const handleChange = (key: keyof LoginFormState, value: string) => {
    setFormState((prev: LoginFormState) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    try {
      await loginMutation.mutateAsync(formState);
        router.replace('/(app)/dashboard');
    } catch (error) {
      Alert.alert('Login failed', getErrorMessage(error, 'Please double-check your credentials.'));
    }
  };

  const disableSubmit = !formState.email || !formState.password || loginMutation.isPending;

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
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
            placeholderTextColor="#94a3b8"
            style={styles.input}
            textContentType="emailAddress"
            autoComplete="email"
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Password</Text>
            <Link href="/(auth)/forgot-password" asChild>
              <Pressable>
                <Text style={styles.forgotLink}>Forgot Password?</Text>
              </Pressable>
            </Link>
          </View>
          <View style={styles.passwordInputContainer}>
            <TextInput
              value={formState.password}
              onChangeText={(value: string) => handleChange('password', value)}
              placeholder="••••••••"
              placeholderTextColor="#94a3b8"
              style={styles.passwordInput}
              secureTextEntry={!showPassword}
              textContentType="password"
              autoComplete="password"
            />
            <Pressable 
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons 
                name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                size={24} 
                color="#64748b" 
              />
            </Pressable>
          </View>
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%'
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
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  label: {
    fontSize: 14,
    color: '#334155'
  },
  forgotLink: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600'
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
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5f5',
    borderRadius: 12,
    paddingRight: 12
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#0f172a'
  },
  eyeIcon: {
    padding: 4
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
