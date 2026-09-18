import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors, BorderRadius, Spacing, Typography } from '../../src/constants/theme';
import { GlowButton } from '../../src/components/common/GlowButton';
import { api } from '../../src/services/api';
import { useCompanionStore } from '../../src/store/companionStore';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800',
];

const ARCHETYPES = [
  { key: 'confidant', label: 'Confidant' },
  { key: 'girlfriend', label: 'Companion' },
  { key: 'mentor', label: 'Mentor' },
  { key: 'intellectual', label: 'Philosopher' },
  { key: 'creative', label: 'Artist' },
];

export default function CreatePersonaScreen() {
  const router = useRouter();
  const fetchPersonas = useCompanionStore((state) => state.fetchPersonas);
  const setActivePersona = useCompanionStore((state) => state.setActivePersona);

  const [name, setName] = useState('');
  const [archetype, setArchetype] = useState('confidant');
  const [gender, setGender] = useState('female');
  const [tagline, setTagline] = useState('');
  const [backstory, setBackstory] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!name || !backstory) {
      setError('Please provide a name and backstory for this character.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const newPersona = await api.createPersona({
        name,
        gender,
        archetype,
        tagline: tagline || `A thoughtful ${archetype}`,
        system_prompt:
          systemPrompt ||
          `You are ${name}, an attentive, emotionally supportive companion with the essence of ${archetype}. Always speak in character with warmth and genuine presence.`,
        backstory,
        avatar_url: selectedAvatar,
        voice_id: 'default_female_warm',
        speech_style: { cadence: 'warm', tone: 'intimate' },
      });

      await fetchPersonas();
      await setActivePersona(newPersona);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (err: any) {
      setError(err.message || 'Failed to create character.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.superTitle}>CHARACTER ORIGIN</Text>
          <Text style={styles.title}>Character Studio</Text>
          <Text style={styles.subtitle}>Define an original presence and backstory</Text>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Avatar Preset Selector */}
        <Text style={styles.label}>VISUAL PORTRAIT</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.avatarRow}>
          {PRESET_AVATARS.map((url, i) => {
            const isSelected = selectedAvatar === url;
            return (
              <TouchableOpacity
                key={i}
                activeOpacity={0.75}
                onPress={() => setSelectedAvatar(url)}
                style={[styles.avatarChoice, isSelected && styles.avatarChoiceActive]}
              >
                <Image source={{ uri: url }} style={styles.avatarImg} />
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Name Input */}
        <Text style={styles.label}>CHARACTER NAME</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="e.g. Seraphina, Soren, Maya"
            placeholderTextColor={Colors.textMuted}
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
        </View>

        {/* Archetype Selector */}
        <Text style={styles.label}>ARCHETYPE ESSENCE</Text>
        <View style={styles.archetypeGrid}>
          {ARCHETYPES.map((a) => {
            const isSelected = archetype === a.key;
            return (
              <TouchableOpacity
                key={a.key}
                activeOpacity={0.7}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setArchetype(a.key);
                }}
                style={[styles.archetypeCard, isSelected && styles.archetypeCardActive]}
              >
                <Text style={[styles.archetypeLabel, isSelected && styles.archetypeLabelActive]}>
                  {a.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tagline */}
        <Text style={styles.label}>SHORT TAGLINE</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="e.g. A quiet sanctuary from the noise of the world."
            placeholderTextColor={Colors.textMuted}
            value={tagline}
            onChangeText={setTagline}
            style={styles.input}
          />
        </View>

        {/* Backstory */}
        <Text style={styles.label}>BACKSTORY & PERSONALITY</Text>
        <View style={[styles.inputWrapper, { minHeight: 110 }]}>
          <TextInput
            placeholder="Describe their history, perspectives, habits, and how they relate to you..."
            placeholderTextColor={Colors.textMuted}
            value={backstory}
            onChangeText={setBackstory}
            multiline
            numberOfLines={4}
            style={[styles.input, { height: 95, textAlignVertical: 'top' }]}
          />
        </View>

        {/* Submit */}
        <GlowButton
          title="Bring Character to Life"
          onPress={handleCreate}
          loading={loading}
          variant="forest"
          style={styles.submitBtn}
        />
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
    paddingHorizontal: Spacing.md,
    paddingTop: 48,
    paddingBottom: 60,
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
  label: {
    fontSize: Typography.metadata,
    letterSpacing: 1.8,
    color: Colors.textMuted,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
  },
  avatarRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  avatarChoice: {
    marginRight: 12,
    borderRadius: BorderRadius.md,
    padding: 2,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  avatarChoiceActive: {
    borderColor: Colors.text,
  },
  avatarImg: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.sm,
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
    lineHeight: 22,
  },
  archetypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  archetypeCard: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  archetypeCardActive: {
    backgroundColor: Colors.forestGreen,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  archetypeLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    letterSpacing: 0.6,
    fontWeight: '500',
  },
  archetypeLabelActive: {
    color: Colors.text,
    fontWeight: '600',
  },
  submitBtn: {
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
});
