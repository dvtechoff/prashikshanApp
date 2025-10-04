import { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text, StyleSheet, Animated } from 'react-native';
import { Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStatus } from '@/hooks/useAuth';

export default function Index() {
  const { isAuthenticated } = useAuthStatus();
  const [isReady, setIsReady] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.5));

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Delay to show splash screen
    const timer = setTimeout(() => setIsReady(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return (
      <View style={styles.container}>
        {/* Background Gradient Effect */}
        <View style={styles.gradientCircle1} />
        <View style={styles.gradientCircle2} />
        
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          {/* Logo/Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="school" size={80} color="#2563eb" />
          </View>

          {/* App Name */}
          <Text style={styles.appName}>Prashikshan</Text>
          <Text style={styles.tagline}>Internship Management System</Text>

          {/* Loading Indicator */}
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </Animated.View>

        {/* Footer */}
        
      </View>
    );
  }

  return <Redirect href={isAuthenticated ? '/(app)/dashboard' : '/(auth)/login'} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden'
  },
  gradientCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#dbeafe',
    opacity: 0.4,
    top: -100,
    right: -100
  },
  gradientCircle2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#e0e7ff',
    opacity: 0.3,
    bottom: -80,
    left: -80
  },
  content: {
    alignItems: 'center',
    gap: 16,
    zIndex: 1
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#2563eb',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8
  },
  appName: {
    fontSize: 42,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -1
  },
  tagline: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
    letterSpacing: 0.5,
    marginBottom: 32
  },
  loaderContainer: {
    marginTop: 24,
    alignItems: 'center',
    gap: 12
  },
  loadingText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500'
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center'
  },
  footerText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500'
  }
});
