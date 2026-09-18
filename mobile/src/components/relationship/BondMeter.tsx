import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, Spacing } from '../../constants/theme';
import { Relationship } from '../../store/companionStore';

interface BondMeterProps {
  relationship: Relationship | null;
}

const STAGE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  acquaintance: { label: 'Acquaintance', icon: '🌱', color: '#10B981' },
  friend: { label: 'Friend', icon: '☕', color: '#34D399' },
  close_friend: { label: 'Close Friend', icon: '🤝', color: '#059669' },
  confidant: { label: 'Confidant', icon: '✨', color: '#FB7185' },
  romantic: { label: 'Romantic Partner', icon: '💖', color: '#E11D48' },
};

export const BondMeter: React.FC<BondMeterProps> = ({ relationship }) => {
  if (!relationship) return null;

  const level = relationship.intimacy_level || 1;
  const xp = relationship.intimacy_xp || 0;
  const nextLevelXp = level * 100;
  const progressPercent = Math.min(100, Math.max(0, (xp / nextLevelXp) * 100));

  const stageInfo = STAGE_LABELS[relationship.stage] || STAGE_LABELS.acquaintance;
  const mood = relationship.mood_state || { joy: 0.8, empathy: 0.85, flirt: 0.3 };

  return (
    <View style={styles.container}>
      {/* Top row: Stage & Level */}
      <View style={styles.header}>
        <View style={styles.stageBadge}>
          <Text style={styles.stageIcon}>{stageInfo.icon}</Text>
          <Text style={[styles.stageText, { color: stageInfo.color }]}>
            {stageInfo.label}
          </Text>
        </View>

        <View style={styles.levelBadge}>
          <Text style={styles.levelLabel}>Level</Text>
          <Text style={styles.levelValue}>{level}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarBg}>
        <LinearGradient
          colors={Colors.primaryGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressFill, { width: `${progressPercent}%` }]}
        />
      </View>
      <View style={styles.xpRow}>
        <Text style={styles.xpText}>Intimacy Bond</Text>
        <Text style={styles.xpText}>
          {xp} / {nextLevelXp} XP
        </Text>
      </View>

      {/* Mood Squircles */}
      <View style={styles.moodContainer}>
        <View style={styles.moodPill}>
          <Text style={styles.moodPillText}>Joy {Math.round((mood.joy || 0.8) * 100)}%</Text>
        </View>
        <View style={styles.moodPill}>
          <Text style={styles.moodPillText}>Empathy {Math.round((mood.empathy || 0.85) * 100)}%</Text>
        </View>
        {mood.flirt !== undefined && (
          <View style={[styles.moodPill, styles.affectionPill]}>
            <Text style={[styles.moodPillText, { color: '#FDA4AF' }]}>
              Affection {Math.round((mood.flirt || 0.3) * 100)}%
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceGlass,
    borderRadius: BorderRadius.lg, // 22px Squircle
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderTopColor: 'rgba(255, 255, 255, 0.14)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  stageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm, // Squircle badge
  },
  stageIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  stageText: {
    fontSize: 14,
    fontWeight: '800',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: Colors.borderGlow,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm, // Squircle badge
  },
  levelLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginRight: 4,
    fontWeight: '600',
  },
  levelValue: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.primaryLight,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.xs,
    overflow: 'hidden',
    marginTop: Spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.xs,
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  xpText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  moodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: Spacing.sm,
  },
  moodPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: BorderRadius.sm, // Squircle mood tag
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  affectionPill: {
    backgroundColor: 'rgba(225, 29, 72, 0.1)',
    borderColor: 'rgba(225, 29, 72, 0.3)',
  },
  moodPillText: {
    fontSize: 12,
    color: Colors.primaryLight,
    fontWeight: '700',
  },
});
