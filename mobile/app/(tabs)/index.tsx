import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, BorderRadius, Spacing, Typography } from '../../src/constants/theme';
import { GlowButton } from '../../src/components/common/GlowButton';
import { DoubleBezelCard } from '../../src/components/common/DoubleBezelCard';
import { BrandHeader } from '../../src/components/common/BrandHeader';
import { IntimacyGauge } from '../../src/components/common/IntimacyGauge';
import { useCompanionStore, Persona } from '../../src/store/companionStore';
import { getAvatarSource } from '../../src/utils/avatar';

const ARCHETYPE_OPTIONS = [
  'confidant',
  'companion',
  'mentor',
  'philosopher',
  'artist',
  'friend',
  'soulmate',
];

export default function MobileLandingScreen() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state for Craft Persona
  const [name, setName] = useState('');
  const [archetype, setArchetype] = useState('confidant');
  const [gender, setGender] = useState('female');
  const [tagline, setTagline] = useState('');
  const [backstory, setBackstory] = useState('');
  const [accentQuote, setAccentQuote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    personas,
    activePersona,
    relationships,
    fetchPersonas,
    setActivePersona,
  } = useCompanionStore();

  useEffect(() => {
    fetchPersonas();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPersonas();
    setIsRefreshing(false);
  };

  const handleSelectAndChat = async (p: Persona) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await setActivePersona(p);
    router.push('/(tabs)/chat');
  };

  const handleStartCall = async (p: Persona) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await setActivePersona(p);
    router.push(`/call/${p.id}`);
  };

  const handleCreateSubmit = async () => {
    if (!name.trim() || !backstory.trim()) {
      return;
    }
    setIsSubmitting(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const newPersona: Persona = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      gender,
      archetype,
      tagline: tagline.trim() || 'A personal companion for thoughtful reflection.',
      accent_quote: accentQuote.trim() || 'Presence is the greatest gift one can offer.',
      system_prompt: `You are ${name.trim()}, a thoughtful ${archetype}. Respond with gentle sincerity and warmth.`,
      backstory: backstory.trim(),
      avatar_url: '/avatars/maya.jpg',
      voice_id: 'warm_whisper_female',
      speech_style: { warmth: 0.9, cadence: 'contemplative' },
    };

    await setActivePersona(newPersona);
    useCompanionStore.setState((state) => ({
      personas: [newPersona, ...state.personas],
    }));

    setName('');
    setTagline('');
    setBackstory('');
    setAccentQuote('');
    setIsSubmitting(false);
    setShowCreateModal(false);
  };

  const currentHeroPersona = activePersona || personas[0];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.terracotta}
          />
        }
      >
        {/* Floating Brand Header */}
        <BrandHeader
          showSubtitle={false}
          rightAction={
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => setShowCreateModal(true)}
              style={styles.headerNewBtn}
            >
              <Feather name="plus" size={13} color={Colors.text} />
              <Text style={styles.headerNewBtnText}>Craft</Text>
            </TouchableOpacity>
          }
        />

        {/* Editorial Hero Section — Exact Web App Alignment */}
        <View style={styles.heroSection}>
          {/* Terracotta Chip Badge */}
          <View style={styles.heroBadge}>
            <Feather name="heart" size={12} color={Colors.terracotta} />
            <Text style={styles.heroBadgeText}>
              AUTONOMOUS COGNITIVE COMPANIONS
            </Text>
          </View>

          {/* Large Editorial Headline */}
          <Text style={styles.heroTitle}>
            Intimacy built on memory & unhurried dialogue.
          </Text>

          {/* Editorial Subtext */}
          <Text style={styles.heroSubtitle}>
            AI partners with continuous inner monologue, dynamic emotional bonds, and absolute privacy agency.
          </Text>

          {/* Responsive Action CTAs */}
          <View style={styles.heroActionRow}>
            <GlowButton
              title={`Speak with ${currentHeroPersona?.name || 'Maya'}`}
              onPress={() => currentHeroPersona && handleSelectAndChat(currentHeroPersona)}
              variant="terracotta"
              trailingIcon={<Feather name="arrow-right" size={14} color="#FFF" />}
              style={styles.heroPrimaryBtn}
            />

            <GlowButton
              title="Craft Persona"
              onPress={() => setShowCreateModal(true)}
              variant="secondary"
              icon={<Feather name="plus" size={14} color={Colors.text} />}
              style={styles.heroSecondaryBtn}
            />
          </View>
        </View>

        {/* Curated Companion Dossier Section */}
        <View style={styles.dossierSection}>
          <View style={styles.dossierHeader}>
            <Text style={styles.dossierTitle}>Curated Companion Dossier</Text>
            <Text style={styles.dossierSubtitle}>
              {personas.length} Distinct Archetypes Available
            </Text>
          </View>

          {/* Companions Cards List with Double-Bezel Card Styling */}
          <View style={styles.cardsList}>
            {personas.map((persona) => {
              const rel =
                relationships[persona.id] || {
                  persona_id: persona.id,
                  intimacy_level: 15,
                  intimacy_xp: 50,
                  stage: 'Acquaintance',
                  mood_state: { joy: 0.8, empathy: 0.9, affection: 0.65 },
                  last_interaction_at: new Date().toISOString(),
                };

              const isSelected = activePersona?.id === persona.id;
              const displayQuote =
                persona.accent_quote ||
                persona.tagline ||
                (persona.backstory
                  ? persona.backstory.slice(0, 95) + '...'
                  : 'Presence is the greatest gift one can offer.');

              return (
                <DoubleBezelCard
                  key={persona.id}
                  active={isSelected}
                  onPress={() => handleSelectAndChat(persona)}
                  style={styles.cardWrapper}
                  innerStyle={styles.cardInner}
                >
                  {/* Top Row: Avatar & Archetype Badge */}
                  <View style={styles.cardTopRow}>
                    <View style={styles.avatarWrapper}>
                      <Image
                        source={getAvatarSource(persona.avatar_url)}
                        style={styles.avatarImage}
                        resizeMode="cover"
                      />
                      {/* Active green status badge */}
                      <View style={styles.avatarOnlineDot} />
                    </View>

                    <View style={styles.archetypeBadge}>
                      <Text style={styles.archetypeText}>
                        {persona.archetype.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  {/* Character Name & Tagline */}
                  <View style={styles.cardBody}>
                    <Text style={styles.personaName}>{persona.name}</Text>
                    <Text style={styles.personaTagline}>{persona.tagline}</Text>
                  </View>

                  {/* Editorial Italic Quote */}
                  <View style={styles.quoteBlock}>
                    <Text style={styles.quoteMark}>“</Text>
                    <Text style={styles.quoteText}>{displayQuote}</Text>
                  </View>

                  {/* Intimacy & Affection Gauge */}
                  <IntimacyGauge
                    relationship={rel}
                    stageName={rel.stage}
                    intimacyLevel={rel.intimacy_level}
                    moodState={rel.mood_state}
                  />

                  {/* Bottom Card Actions */}
                  <View style={styles.cardActionRow}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleSelectAndChat(persona)}
                      style={styles.beginSessionBtn}
                    >
                      <Text style={styles.beginSessionText}>Begin Session</Text>
                      <Feather name="arrow-right" size={13} color={Colors.terracotta} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleStartCall(persona)}
                      style={styles.voiceIconBtn}
                    >
                      <Feather name="phone-call" size={14} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </DoubleBezelCard>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Craft Persona Modal — Clean Editorial Form */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalSuperTitle}>CHARACTER ORIGIN</Text>
                <Text style={styles.modalTitle}>Craft Companion</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowCreateModal(false)}
                style={styles.modalCloseBtn}
              >
                <Feather name="x" size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
            >
              {/* Name */}
              <Text style={styles.inputLabel}>COMPANION NAME</Text>
              <TextInput
                placeholder="e.g. Seraphina, Soren, Maya"
                placeholderTextColor={Colors.textMuted}
                value={name}
                onChangeText={setName}
                style={styles.inputField}
              />

              {/* Archetype Chips */}
              <Text style={styles.inputLabel}>ARCHETYPE ESSENCE</Text>
              <View style={styles.archetypeChipsRow}>
                {ARCHETYPE_OPTIONS.map((item) => {
                  const isSelected = archetype === item;
                  return (
                    <TouchableOpacity
                      key={item}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setArchetype(item);
                      }}
                      style={[
                        styles.archetypeChip,
                        isSelected && styles.archetypeChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.archetypeChipText,
                          isSelected && styles.archetypeChipTextActive,
                        ]}
                      >
                        {item.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Tagline */}
              <Text style={styles.inputLabel}>SHORT TAGLINE</Text>
              <TextInput
                placeholder="A quiet essayist who listens to the spaces between words..."
                placeholderTextColor={Colors.textMuted}
                value={tagline}
                onChangeText={setTagline}
                style={styles.inputField}
              />

              {/* Accent Quote */}
              <Text style={styles.inputLabel}>ACCENT QUOTE</Text>
              <TextInput
                placeholder="Presence is the greatest gift one can offer."
                placeholderTextColor={Colors.textMuted}
                value={accentQuote}
                onChangeText={setAccentQuote}
                style={styles.inputField}
              />

              {/* Backstory */}
              <Text style={styles.inputLabel}>BACKSTORY & PERSONALITY</Text>
              <TextInput
                placeholder="Describe their history, perspectives, quirks, and conversation style..."
                placeholderTextColor={Colors.textMuted}
                value={backstory}
                onChangeText={setBackstory}
                multiline
                numberOfLines={3}
                style={[styles.inputField, { height: 80, textAlignVertical: 'top' }]}
              />

              {/* Submit CTA */}
              <View style={styles.modalSubmitWrapper}>
                <GlowButton
                  title="Bring Companion to Life"
                  onPress={handleCreateSubmit}
                  loading={isSubmitting}
                  variant="terracotta"
                  style={styles.modalSubmitBtn}
                />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background, // #121211
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: 50,
    paddingBottom: 70,
  },
  headerNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
  },
  headerNewBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },

  // Hero Section
  heroSection: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 9999,
    backgroundColor: Colors.terracottaBg,
    borderWidth: 1,
    borderColor: Colors.terracottaBorder,
    marginBottom: 14,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.terracotta,
    letterSpacing: 1.4,
  },
  heroTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.4,
    fontFamily: Typography.fontFamily.serif,
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  heroActionRow: {
    flexDirection: 'column',
    gap: 10,
  },
  heroPrimaryBtn: {
    width: '100%',
  },
  heroSecondaryBtn: {
    width: '100%',
  },

  // Dossier Section
  dossierSection: {
    marginTop: Spacing.sm,
  },
  dossierHeader: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: Spacing.md,
  },
  dossierTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.2,
  },
  dossierSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
    letterSpacing: 0.5,
  },

  // Companion Cards List
  cardsList: {
    gap: 16,
  },
  cardWrapper: {
    width: '100%',
  },
  cardInner: {
    padding: 18,
    gap: 14,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  avatarOnlineDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.online,
    borderWidth: 2,
    borderColor: '#191817',
  },
  archetypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  archetypeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#D5CEC4',
    letterSpacing: 1.2,
  },
  cardBody: {
    gap: 4,
  },
  personaName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.2,
  },
  personaTagline: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  quoteBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.025)',
    borderLeftWidth: 2,
    borderLeftColor: Colors.terracotta,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  quoteMark: {
    fontSize: 16,
    color: Colors.terracotta,
    marginRight: 4,
    lineHeight: 18,
    fontWeight: '700',
  },
  quoteText: {
    flex: 1,
    fontSize: 13,
    fontStyle: 'italic',
    color: '#D5CEC4',
    lineHeight: 18,
  },
  cardActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  beginSessionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(200, 90, 50, 0.08)',
  },
  beginSessionText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.terracotta,
  },
  voiceIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#191817',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  modalSuperTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.terracotta,
    letterSpacing: 1.8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: {
    maxHeight: 480,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 1.4,
    marginTop: 14,
    marginBottom: 6,
  },
  inputField: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: Colors.text,
    fontSize: 14,
  },
  archetypeChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  archetypeChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  archetypeChipActive: {
    backgroundColor: Colors.terracotta,
    borderColor: Colors.terracotta,
  },
  archetypeChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
  },
  archetypeChipTextActive: {
    color: '#FFF',
  },
  modalSubmitWrapper: {
    marginTop: 22,
    marginBottom: 16,
  },
  modalSubmitBtn: {
    width: '100%',
  },
});
