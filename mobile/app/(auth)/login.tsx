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
import { Colors, BorderRadius, Spacing, Typography } from '../../src/constants/theme';
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Title */}
        <View style={styles.header}>
          <Text style={styles.superTitle}>AUTHENTICATION</Text>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Enter your quiet sanctuary</Text>
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
            variant="forest"
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
            <Text style={styles.demoFillText}>Fill Demo Credentials</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  superTitle: {
    fontSize: Typography.metadata,
    letterSpacing: 2.2,
    color: Colors.textMuted,
    fontWeight: '600',
    marginBottom: 6,
  },
  title: {
    fontSize: Typography.screenTitle, // 36px
    lineHeight: Typography.lineHeight.screenTitle,
    fontWeight: '400',
    color: Colors.text,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: Typography.metadata,
    letterSpacing: 1.8,
    color: Colors.textMuted,
    fontWeight: '600',
    marginTop: 18,
    marginBottom: 8,
  },
  inputWrapper: {
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  input: {
    color: Colors.text,
    fontSize: Typography.body, // 16px
  },
  button: {
    marginTop: Spacing.xl,
  },
  errorBox: {
    backgroundColor: 'rgba(90, 44, 42, 0.25)',
    borderWidth: 1,
    borderColor: Colors.burgundy,
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
    color: Colors.text,
    fontWeight: '600',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  demoFill: {
    marginTop: Spacing.lg,
    alignItems: 'center',
    padding: 8,
  },
  demoFillText: {
    color: Colors.textMuted,
    fontSize: 12,
    letterSpacing: 1.0,
  },
});
