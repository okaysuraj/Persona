import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, BorderRadius, Spacing } from '../../src/constants/theme';
import { GlowButton } from '../../src/components/common/GlowButton';
import { api } from '../../src/services/api';
import { useCompanionStore } from '../../src/store/companionStore';
import { getAvatarSource } from '../../src/utils/avatar';

const PRESET_AVATARS = [
  '/avatars/maya.jpg',
  '/avatars/soren.jpg',
  '/avatars/elena.jpg',
  '/avatars/kaelen.jpg',
];

const ARCHETYPES = [
  { key: 'confidant', label: 'Confidant' },
  { key: 'companion', label: 'Companion' },
  { key: 'mentor', label: 'Mentor' },
  { key: 'philosopher', label: 'Philosopher' },
  { key: 'artist', label: 'Artist' },
  { key: 'friend', label: 'Friend' },
  { key: 'soulmate', label: 'Soulmate' },
];

export default function CreatePersonaScreen() {
  const router = useRouter();
  const setActivePersona = useCompanionStore((state) => state.setActivePersona);

  const [name, setName] = useState('');
  const [archetype, setArchetype] = useState('confidant');
  const [gender] = useState('female');
  const [tagline, setTagline] = useState('');
  const [accentQuote, setAccentQuote] = useState('');
  const [backstory, setBackstory] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!name.trim() || !backstory.trim()) {
      setError('Please provide a name and backstory for this companion.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const newPersona = {
        id: `custom-${Date.now()}`,
        name: name.trim(),
        gender,
        archetype,
        tagline: tagline.trim() || `A thoughtful ${archetype}`,
        accent_quote: accentQuote.trim() || 'Presence is the greatest gift one can offer.',
        system_prompt: `You are ${name.trim()}, a thoughtful ${archetype}. Respond with gentle sincerity and warmth.`,
        backstory: backstory.trim(),
        avatar_url: selectedAvatar,
        voice_id: 'default_warm',
        speech_style: { warmth: 0.9, cadence: 'contemplative' },
      };

      try {
        await api.createPersona(newPersona);
      } catch (_) {
        // Local persistence fallback
      }

      useCompanionStore.setState((state) => ({
        personas: [newPersona, ...state.personas],
      }));
      await setActivePersona(newPersona);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (err: any) {
      setError(err.message || 'Failed to create companion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Feather name="chevron-left" size={20} color={Colors.text} />
            <Text style={styles.backButtonText}>Cancel</Text>
          </TouchableOpacity>

          <View style={styles.titleGroup}>
            <Text style={styles.superTitle}>CHARACTER ORIGIN</Text>
            <Text style={styles.title}>Craft Companion</Text>
            <Text style={styles.subtitle}>Define an original presence, tone, and backstory</Text>
          </View>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Visual Avatar Presets */}
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
                <Image source={getAvatarSource(url)} style={styles.avatarImg} />
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Name Input */}
        <Text style={styles.label}>COMPANION NAME</Text>
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
            placeholder="A quiet essayist who listens to the spaces between words..."
            placeholderTextColor={Colors.textMuted}
            value={tagline}
            onChangeText={setTagline}
            style={styles.input}
          />
        </View>

        {/* Accent Quote */}
        <Text style={styles.label}>ACCENT QUOTE</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="Presence is the greatest gift one can offer."
            placeholderTextColor={Colors.textMuted}
            value={accentQuote}
            onChangeText={setAccentQuote}
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
          title="Bring Companion to Life"
          onPress={handleCreate}
          loading={loading}
          variant="terracotta"
          style={styles.submitBtn}
        />
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
    paddingHorizontal: Spacing.md,
    paddingTop: 48,
    paddingBottom: 60,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButtonText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  titleGroup: {
    gap: 4,
  },
  superTitle: {
    fontSize: 10,
    letterSpacing: 2.0,
    color: Colors.terracotta,
    fontWeight: '700',
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
    marginTop: 2,
  },
  label: {
    fontSize: 11,
    letterSpacing: 1.4,
    color: Colors.textMuted,
    fontWeight: '600',
    marginTop: 18,
    marginBottom: 8,
  },
  avatarRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  avatarChoice: {
    marginRight: 12,
    borderRadius: 18,
    padding: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarChoiceActive: {
    borderColor: Colors.terracotta,
  },
  avatarImg: {
    width: 64,
    height: 64,
    borderRadius: 14,
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
    lineHeight: 22,
  },
  archetypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  archetypeCard: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  archetypeCardActive: {
    backgroundColor: Colors.terracotta,
    borderColor: Colors.terracotta,
  },
  archetypeLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  archetypeLabelActive: {
    color: '#FFF',
  },
  submitBtn: {
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
});
