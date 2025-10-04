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
        bounces={false}
        overScrollMode="never"
        scrollEnabled={false}
      >
        {/* Header with Icon */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="school" size={48} color="#2563eb" />
          </View>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to your Prashikshan account</Text>
        </View>

        {/* Login Form Card */}
        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#64748b" style={styles.inputIcon} />
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
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Password</Text>
              <Link href="/(auth)/forgot-password" asChild>
                <Pressable>
                  <Text style={styles.forgotLink}>Forgot?</Text>
                </Pressable>
              </Link>
            </View>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#64748b" style={styles.inputIcon} />
              <TextInput
                value={formState.password}
                onChangeText={(value: string) => handleChange('password', value)}
                placeholder="Enter your password"
                placeholderTextColor="#94a3b8"
                style={styles.input}
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
                  size={22} 
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
              <>
                <Text style={styles.buttonText}>Sign In</Text>
                <Ionicons name="arrow-forward" size={20} color="#ffffff" />
              </>
            )}
          </Pressable>

          {loginMutation.isError && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color="#dc2626" />
              <Text style={styles.errorText}>
                {getErrorMessage(
                  loginMutation.failureReason,
                  'Invalid credentials. Please try again.'
                )}
              </Text>
            </View>
          )}
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Sign Up Link */}
        <Link href="../register" asChild>
          <Pressable style={styles.secondaryAction}>
            <Text style={styles.secondaryText}>
              Don&apos;t have an account? <Text style={styles.secondaryTextBold}>Sign Up</Text>
            </Text>
          </Pressable>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%'
  },
  header: {
    alignItems: 'center',
    marginBottom: 32
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    color: '#1e293b',
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 8
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3
  },
  inputGroup: {
    marginBottom: 20
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8
  },
  forgotLink: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52
  },
  inputIcon: {
    marginRight: 12
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b'
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
    padding: 4,
    marginLeft: 8
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 8,
    shadowColor: '#2563eb',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
    elevation: 0
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 12,
    marginTop: 16
  },
  errorText: {
    flex: 1,
    color: '#dc2626',
    fontSize: 14,
    marginLeft: 8
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0'
  },
  dividerText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 16
  },
  secondaryAction: {
    alignItems: 'center'
  },
  secondaryText: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center'
  },
  secondaryTextBold: {
    color: '#2563eb',
    fontWeight: '600'
  }
});
