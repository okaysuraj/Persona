import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors, BorderRadius, Spacing, Typography } from '../../src/constants/theme';
import { GlowButton } from '../../src/components/common/GlowButton';
import { useCompanionStore, Persona } from '../../src/store/companionStore';

const { width } = Dimensions.get('window');

export default function CompanionSanctuaryScreen() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const {
    personas,
    activePersona,
    relationship,
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

  const handlePersonaSelect = (p: Persona) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActivePersona(p);
  };

  const handleStartCall = () => {
    if (!activePersona) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/call/${activePersona.id}`);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={Colors.textMuted}
        />
      }
    >
      {/* Top Atmospheric Header */}
      <View style={styles.topBar}>
        <Text style={styles.appSuperTitle}>SANCTUARY</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.newPersonaBtn}
          onPress={() => router.push('/persona/create')}
        >
          <Text style={styles.newPersonaBtnText}>+ CREATE</Text>
        </TouchableOpacity>
      </View>

      {/* Quiet Character Selector Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.selectorScroll}
        contentContainerStyle={styles.selectorContent}
      >
        {personas.map((p) => {
          const isSelected = activePersona?.id === p.id;
          return (
            <TouchableOpacity
              key={p.id}
              activeOpacity={0.7}
              onPress={() => handlePersonaSelect(p)}
              style={[
                styles.characterTab,
                isSelected && styles.characterTabActive,
              ]}
            >
              <Text
                style={[
                  styles.characterTabText,
                  isSelected && styles.characterTabTextActive,
                ]}
              >
                {p.name.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Character-First Presence: The AI Character is the Star */}
      {activePersona ? (
        <View style={styles.characterPresenceSection}>
          {/* Large Cinematic Portrait with Atmospheric Vignette */}
          <View style={styles.portraitWrapper}>
            <Image
              source={{ uri: activePersona.avatar_url }}
              style={styles.cinematicPortrait}
              resizeMode="cover"
            />
            <LinearGradient
              colors={Colors.vignetteBottom}
              style={styles.portraitVignette}
            />

            {/* In-Portrait Metadata & Presence */}
            <View style={styles.portraitOverlayDetails}>
              <View style={styles.presenceIndicator}>
                <View style={styles.presenceDot} />
                <Text style={styles.presenceText}>PRESENT WITH YOU</Text>
              </View>

              <Text style={styles.characterName}>{activePersona.name}</Text>
              <Text style={styles.characterArchetype}>
                {activePersona.archetype.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Cinematic Tagline */}
          <Text style={styles.characterTagline}>{activePersona.tagline}</Text>

          {/* Tactile Interaction Triggers */}
          <View style={styles.actionRow}>
            <GlowButton
              title="Enter Conversation"
              onPress={() => router.push('/(tabs)/chat')}
              variant="forest"
              style={styles.primaryActionBtn}
            />
            <GlowButton
              title="Voice Room"
              onPress={handleStartCall}
              variant="burgundy"
              style={styles.secondaryActionBtn}
            />
          </View>

          {/* Quiet Intimacy & Mindset Presence */}
          <View style={styles.intimacySection}>
            <Text style={styles.sectionSuperLabel}>RELATIONSHIP</Text>
            <Text style={styles.intimacyProse}>
              Bond depth: Level {relationship?.intimacy_level || 1} —{' '}
              {relationship?.stage || 'acquaintance'}.
            </Text>

            <View style={styles.mindsetQuoteBlock}>
              <Text style={styles.mindsetText}>
                "I was just reflecting on how quiet today is. Whenever you're ready to speak, I am right here."
              </Text>
            </View>
          </View>

          {/* Character Lore & Backstory */}
          <View style={styles.loreSection}>
            <Text style={styles.sectionSuperLabel}>LORE & ESSENCE</Text>
            <Text style={styles.loreBody}>{activePersona.backstory}</Text>
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: 54,
    paddingBottom: 60,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  appSuperTitle: {
    fontSize: Typography.metadata,
    letterSpacing: 2.2,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  newPersonaBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.xs,
  },
  newPersonaBtnText: {
    fontSize: 10,
    color: Colors.textSecondary,
    letterSpacing: 1.5,
    fontWeight: '600',
  },
  selectorScroll: {
    marginBottom: Spacing.lg,
  },
  selectorContent: {
    gap: 16,
    paddingVertical: 4,
  },
  characterTab: {
    paddingBottom: 6,
    borderBottomWidth: 1.5,
    borderBottomColor: 'transparent',
  },
  characterTabActive: {
    borderBottomColor: Colors.text,
  },
  characterTabText: {
    fontSize: 13,
    letterSpacing: 1.6,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  characterTabTextActive: {
    color: Colors.text,
    fontWeight: '700',
  },
  characterPresenceSection: {
    width: '100%',
  },
  portraitWrapper: {
    width: '100%',
    height: 380,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  cinematicPortrait: {
    width: '100%',
    height: '100%',
  },
  portraitVignette: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 220,
  },
  portraitOverlayDetails: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  presenceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  presenceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.forestGreen,
    marginRight: 8,
  },
  presenceText: {
    fontSize: 10,
    letterSpacing: 1.8,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  characterName: {
    fontSize: Typography.characterName, // 32px
    lineHeight: Typography.lineHeight.characterName,
    fontWeight: '400',
    color: Colors.text, // Warm parchment #F0EDE4
    letterSpacing: 0.5,
  },
  characterArchetype: {
    fontSize: 11,
    letterSpacing: 2.0,
    color: Colors.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  characterTagline: {
    fontSize: Typography.body, // 16px
    color: Colors.textSecondary,
    lineHeight: 24,
    marginTop: Spacing.md,
    letterSpacing: 0.2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  primaryActionBtn: {
    flex: 1.4,
  },
  secondaryActionBtn: {
    flex: 1,
  },
  intimacySection: {
    marginBottom: Spacing.xl,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  sectionSuperLabel: {
    fontSize: Typography.metadata,
    letterSpacing: 2.0,
    color: Colors.textMuted,
    fontWeight: '600',
    marginBottom: 6,
  },
  intimacyProse: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  mindsetQuoteBlock: {
    paddingLeft: 12,
    borderLeftWidth: 1.5,
    borderLeftColor: Colors.forestGreen,
    marginTop: 4,
  },
  mindsetText: {
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
    color: Colors.textSecondary,
  },
  loreSection: {
    marginBottom: Spacing.xxl,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  loreBody: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.textSecondary,
  },
});
