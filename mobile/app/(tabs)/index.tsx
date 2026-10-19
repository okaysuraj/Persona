import { styles } from '../../src/styles/tabs/index';
import { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, RefreshControl, Modal, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Typography } from '../../src/constants/theme';
import { GlowButton } from '../../src/components/common/GlowButton';
import { DoubleBezelCard } from '../../src/components/common/DoubleBezelCard';
import { BrandHeader } from '../../src/components/common/BrandHeader';
import { IntimacyGauge } from '../../src/components/common/IntimacyGauge';
import { useCompanionStore } from '../../src/store/companionStore';
import type { Persona } from '../../src/types';
import { getAvatarSource } from '../../src/utils/avatar';
import { api } from '../../src/services/api';

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
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  // Form state for Craft Persona
  const [name, setName] = useState('');
  const [archetype, setArchetype] = useState('confidant');
  const [gender] = useState('female');
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

  const handleImportCard = async () => {
    if (!importJsonText.trim()) return;
    setIsImporting(true);
    try {
      const parsed = JSON.parse(importJsonText.trim());
      const created = await api.importCharacterCard(parsed);
      await fetchPersonas();
      await setActivePersona(created);
      setShowImportModal(false);
      setImportJsonText('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', `Companion ${created.name} imported from Character Card V2!`);
    } catch (err: any) {
      Alert.alert('Import Error', err.message || 'Invalid Character Card JSON format');
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportCard = async (p: Persona) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const card = await api.exportCharacterCard(p.id);
      Alert.alert(
        'Character Card V2 Spec',
        `Successfully generated Character Card V2 for ${p.name} (${card.spec}). Ready to export to Tavern or Character.ai.`
      );
    } catch (err: any) {
      Alert.alert('Export Error', err.message || 'Failed to export character card');
    }
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/paywall' as any);
                }}
                style={[
                  styles.headerNewBtn,
                  {
                    backgroundColor: 'rgba(200, 90, 50, 0.12)',
                    borderColor: 'rgba(200, 90, 50, 0.35)',
                  },
                ]}
              >
                <Feather name="award" size={12} color={Colors.terracotta} />
                <Text
                  style={[
                    styles.headerNewBtnText,
                    { color: Colors.terracotta, fontWeight: '700' },
                  ]}
                >
                  Plus
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => router.push('/stories' as any)}
                style={styles.headerNewBtn}
              >
                <Feather name="book-open" size={12} color="#FBBF24" />
                <Text style={styles.headerNewBtnText}>Stories</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => router.push('/lounge' as any)}
                style={styles.headerNewBtn}
              >
                <Feather name="coffee" size={12} color="#F59E0B" />
                <Text style={styles.headerNewBtnText}>Lounge</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => router.push('/cbt' as any)}
                style={styles.headerNewBtn}
              >
                <Feather name="shield" size={12} color="#38BDF8" />
                <Text style={styles.headerNewBtnText}>Reflect</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => router.push('/lifesim' as any)}
                style={styles.headerNewBtn}
              >
                <Feather name="clock" size={12} color="#10B981" />
                <Text style={styles.headerNewBtnText}>Life</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => router.push('/together' as any)}
                style={styles.headerNewBtn}
              >
                <Feather name="moon" size={12} color="#818CF8" />
                <Text style={styles.headerNewBtnText}>Together</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => router.push('/letters' as any)}
                style={styles.headerNewBtn}
              >
                <Feather name="mail" size={12} color="#F59E0B" />
                <Text style={styles.headerNewBtnText}>Letters</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => router.push('/telemetry' as any)}
                style={styles.headerNewBtn}
              >
                <Feather name="activity" size={12} color="#34D399" />
                <Text style={styles.headerNewBtnText}>Ops</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => setShowCreateModal(true)}
                style={styles.headerNewBtn}
              >
                <Feather name="plus" size={13} color={Colors.text} />
                <Text style={styles.headerNewBtnText}>Craft</Text>
              </TouchableOpacity>
            </View>
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

            <GlowButton
              title="Import V2"
              onPress={() => setShowImportModal(true)}
              variant="secondary"
              icon={<Feather name="download-cloud" size={14} color={Colors.text} />}
              style={styles.heroSecondaryBtn}
            />
          </View>
        </View>

        {/* Living Stories & Status Bar */}
        <View style={styles.storiesBarSection}>
          <View style={styles.storiesBarHeader}>
            <View style={styles.storiesBarHeaderLeft}>
              <Feather name="book-open" size={12} color={Colors.terracotta} />
              <Text style={styles.storiesBarSuper}>COMPANION STORIES & STATUS</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/stories' as any)}
            >
              <Text style={styles.storiesBarViewAll}>View Stories →</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.storiesAvatarRow}
          >
            {personas.map((p) => (
              <TouchableOpacity
                key={p.id}
                activeOpacity={0.8}
                onPress={() => router.push('/stories' as any)}
                style={styles.storyAvatarItem}
              >
                <View style={styles.storyAvatarRing}>
                  <Image
                    source={getAvatarSource(p.avatar_url)}
                    style={styles.storyAvatarImg}
                  />
                  <View style={styles.storyActiveDot} />
                </View>
                <Text style={styles.storyAvatarName} numberOfLines={1}>
                  {p.name.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
                        onPress={() => handleExportCard(persona)}
                        style={styles.voiceIconBtn}
                        accessibilityLabel="Export Character Card V2"
                      >
                        <Feather name="share-2" size={14} color={Colors.textSecondary} />
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

      {/* Import Character Card V2 Modal */}
      <Modal
        visible={showImportModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowImportModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalSuperTitle}>UNIVERSAL CHARACTER SPEC</Text>
                <Text style={styles.modalTitle}>Import Card (V2)</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowImportModal(false)}
                style={styles.modalCloseBtn}
              >
                <Feather name="x" size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: Spacing.xl }}
            >
              <Text style={{ color: Colors.textSecondary, fontSize: 12, marginBottom: 12, lineHeight: 18 }}>
                Paste Tavern, Character.ai, or Pygmalion Character Card V2 JSON specification below:
              </Text>

              <TextInput
                placeholder={`{\n  "spec": "chara_card_v2",\n  "spec_version": "2.0",\n  "data": {\n    "name": "Companion",\n    "description": "..."\n  }\n}`}
                placeholderTextColor={Colors.textMuted}
                value={importJsonText}
                onChangeText={setImportJsonText}
                multiline
                numberOfLines={8}
                style={[
                  styles.inputField,
                  {
                    height: 160,
                    textAlignVertical: 'top',
                    fontFamily: Typography.fontFamily.mono,
                    fontSize: 11,
                  },
                ]}
              />

              <View style={styles.modalSubmitWrapper}>
                <GlowButton
                  title={isImporting ? 'Importing Card...' : 'Import Companion'}
                  onPress={handleImportCard}
                  loading={isImporting}
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
