import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
} from 'react-native';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration (use your existing credentials)
const supabase = createClient(
  'https://koxnemiudjbditxuojxw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtveG5lbWl1ZGpiZGl0eHVvanh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNDczMDIsImV4cCI6MjA2ODkyMzMwMn0.OxaHUwgkNjn51PQ8mrw_LR0Em0pBEXiQ6OaeMlt2Qds'
);

interface AuthScreenProps {
  navigation: any;
}

export default function AuthScreen({ navigation }: AuthScreenProps) {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      
      // For iOS, you'll need to configure Google Sign-In differently
      // This is a placeholder - actual implementation requires react-native-google-signin
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });

      if (error) {
        Alert.alert('Error', error.message);
        return;
      }

      // Navigate to dashboard on success
      navigation.replace('Dashboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: '/attached_assets/Vector_1753691011402.png' }}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>LUMINADOC</Text>
          <Text style={styles.subtitle}>Multi-AI Assistant Platform</Text>
        </View>

        {/* Sign In Button */}
        <TouchableOpacity
          style={[styles.signInButton, loading && styles.disabled]}
          onPress={handleGoogleSignIn}
          disabled={loading}
        >
          <Text style={styles.signInButtonText}>
            {loading ? 'Signing in...' : 'Continue with Google'}
          </Text>
        </TouchableOpacity>

        {/* Features */}
        <View style={styles.features}>
          <Text style={styles.featureTitle}>AI Models Available:</Text>
          <View style={styles.featureList}>
            <Text style={styles.feature}>• Claude - Legal & Compliance</Text>
            <Text style={styles.feature}>• ChatGPT - General Knowledge</Text>
            <Text style={styles.feature}>• Gemini - Marketing Strategy</Text>
            <Text style={styles.feature}>• Grok - Technical Analysis</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
  },
  signInButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
  },
  disabled: {
    opacity: 0.6,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  features: {
    marginTop: 24,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  featureList: {
    gap: 8,
  },
  feature: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 4,
  },
});