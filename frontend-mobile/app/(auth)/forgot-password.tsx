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

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert('Email required', 'Please enter your email address.');
      return;
    }

    setIsLoading(true);
    
    // TODO: Connect to backend API when ready
    // await apiClient.post('/api/v1/auth/forgot-password', { email });
    
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Reset link sent',
        'If an account exists with this email, you will receive a password reset link shortly.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot password?</Text>
      <Text style={styles.subtitle}>
        Enter your email and we'll send you a link to reset your password.
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email address</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="your.email@example.com"
          placeholderTextColor="#94a3b8"
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          style={styles.input}
        />
      </View>

      <Pressable
        style={[styles.primaryButton, (!email || isLoading) && styles.primaryButtonDisabled]}
        onPress={handleSubmit}
        disabled={!email || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.primaryButtonText}>Send reset link</Text>
        )}
      </Pressable>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Remember your password? </Text>
        <Link href="/(auth)/login" asChild>
          <Pressable>
            <Text style={styles.link}>Sign in</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f8fafc',
    gap: 20
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 24
  },
  inputGroup: {
    gap: 8
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b'
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#0f172a'
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8
  },
  primaryButtonDisabled: {
    opacity: 0.5
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12
  },
  footerText: {
    color: '#475569',
    fontSize: 15
  },
  link: {
    color: '#2563eb',
    fontSize: 15,
    fontWeight: '600'
  }
});
