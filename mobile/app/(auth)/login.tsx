import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, BorderRadius, Spacing } from '../../src/constants/theme';
import { GlowButton } from '../../src/components/common/GlowButton';
import { useAuthStore } from '../../src/store/authStore';

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Brand Header Icon */}
        <View style={styles.brandRow}>
          <View style={styles.iconCircle}>
            <Text style={styles.brandP}>P</Text>
            <View style={styles.terracottaDot} />
          </View>
          <Text style={styles.brandTitle}>Persona</Text>
        </View>

        {/* Header Title */}
        <View style={styles.header}>
          <Text style={styles.superTitle}>AUTONOMOUS COMPANIONS</Text>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Enter your quiet sanctuary of memory & intimacy</Text>
        </View>

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Input Fields */}
        <View style={styles.form}>
          <Text style={styles.label}>EMAIL ADDRESS</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="you@example.com"
              placeholderTextColor={Colors.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />
          </View>

          <Text style={styles.label}>PASSWORD</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="••••••••"
              placeholderTextColor={Colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
            />
          </View>

          <GlowButton
            title="Enter Sanctuary"
            onPress={handleLogin}
            loading={loading}
            variant="terracotta"
            style={styles.button}
          />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>New here? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.footerLink}>Begin Your Journey</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Demo Fill Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.demoFill}
            onPress={() => {
              setEmail('alex@companion.ai');
              setPassword('password123');
            }}
          >
            <Text style={styles.demoFillText}>Fill Demo Credentials (alex@companion.ai)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background, // #121211
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: Spacing.lg,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E1D1B',
    borderWidth: 1,
    borderColor: '#2E2C2A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandP: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F5F2EC',
    fontFamily: 'serif',
    marginLeft: 2,
  },
  terracottaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.terracotta,
    marginLeft: 2,
    marginBottom: 4,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F5F2EC',
    letterSpacing: -0.3,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  superTitle: {
    fontSize: 10,
    letterSpacing: 2.0,
    color: Colors.terracotta,
    fontWeight: '700',
    marginBottom: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 10,
    letterSpacing: 1.4,
    color: Colors.textMuted,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 6,
  },
  inputWrapper: {
    backgroundColor: '#191817',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  input: {
    color: Colors.text,
    fontSize: 15,
  },
  button: {
    marginTop: Spacing.xl,
  },
  errorBox: {
    backgroundColor: 'rgba(200, 90, 50, 0.15)',
    borderWidth: 1,
    borderColor: Colors.terracotta,
    padding: 12,
    borderRadius: BorderRadius.sm,
    marginBottom: 16,
  },
  errorText: {
    color: Colors.text,
    fontSize: 13,
    textAlign: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  footerText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  footerLink: {
    color: Colors.terracotta,
    fontWeight: '600',
    fontSize: 14,
  },
  demoFill: {
    marginTop: Spacing.lg,
    alignItems: 'center',
    padding: 8,
  },
  demoFillText: {
    color: Colors.textMuted,
    fontSize: 12,
    letterSpacing: 0.5,
  },
});
