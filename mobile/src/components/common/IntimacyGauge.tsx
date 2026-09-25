import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/theme';
import { Relationship } from '../../store/companionStore';

interface IntimacyGaugeProps {
  relationship?: Relationship | null;
  stageName?: string;
  intimacyLevel?: number;
  moodState?: Record<string, number>;
}

export const IntimacyGauge: React.FC<IntimacyGaugeProps> = ({
  relationship,
  stageName,
  intimacyLevel,
  moodState,
}) => {
  const stage =
    stageName ||
    relationship?.stage ||
    'Acquaintance';

  const level =
    intimacyLevel !== undefined
      ? intimacyLevel
      : relationship?.intimacy_level || 1;

  const mood = moodState || relationship?.mood_state || {};
  const rawAffection =
    typeof mood.affection === 'number'
      ? mood.affection
      : typeof mood.empathy === 'number'
      ? mood.empathy
      : 0.65;

  const affectionPct = Math.min(100, Math.max(5, Math.round(rawAffection * 100)));

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.stageTag}>
          <Text style={styles.stageText}>
            {stage} • Level {level}
          </Text>
        </View>

        <View style={styles.percentBadge}>
          <Text style={styles.percentText}>{affectionPct}% Affection</Text>
        </View>
      </View>

      {/* Progress Track */}
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${affectionPct}%` },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  stageTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stageText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D5CEC4',
    letterSpacing: 0.2,
  },
  percentBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(200, 90, 50, 0.12)',
  },
  percentText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.terracotta,
    fontVariant: ['tabular-nums'],
  },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.terracotta, // #C85A32
    borderRadius: 2,
  },
});
