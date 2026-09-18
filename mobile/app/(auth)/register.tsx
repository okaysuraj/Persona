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

export default function RegisterScreen() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async () => {
    if (!displayName || !email || !password) {
      setErrorMessage('Please fill out all fields.');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      await register(email, password, displayName);
      router.replace('/(tabs)');
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed.');
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
        <View style={styles.header}>
          <Text style={styles.superTitle}>ORIGIN</Text>
          <Text style={styles.title}>Begin Your Story</Text>
          <Text style={styles.subtitle}>Create an intimate space with an AI companion</Text>
        </View>

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          <Text style={styles.label}>YOUR NAME OR NICKNAME</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="What your companion will call you"
              placeholderTextColor={Colors.textMuted}
              value={displayName}
              onChangeText={setDisplayName}
              style={styles.input}
            />
          </View>

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
            title="Create Sanctuary"
            variant="burgundy"
            onPress={handleRegister}
            loading={loading}
            style={styles.button}
          />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
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
});
