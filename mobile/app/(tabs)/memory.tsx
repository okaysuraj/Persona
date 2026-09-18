import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, BorderRadius, Spacing, Typography } from '../../src/constants/theme';
import { api } from '../../src/services/api';
import { useCompanionStore } from '../../src/store/companionStore';

export default function MemoryVaultScreen() {
  const activePersona = useCompanionStore((state) => state.activePersona);
  const [loading, setLoading] = useState(false);
  const [facts, setFacts] = useState<any[]>([]);
  const [episodicMemories, setEpisodicMemories] = useState<any[]>([]);

  const loadMemories = async () => {
    if (!activePersona) return;
    setLoading(true);
    try {
      const data = await api.getMemories(activePersona.id);
      setFacts(data.facts || []);
      setEpisodicMemories(data.episodic_memories || []);
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMemories();
  }, [activePersona?.id]);

  const handleDeleteFact = (factId: string, factKey: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      'Forget Detail',
      `Allow ${activePersona?.name || 'companion'} to release the memory of "${factKey}"?`,
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Release',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteFact(factId);
              setFacts((prev) => prev.filter((f) => f.id !== factId));
            } catch (_) {}
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={loadMemories}
          tintColor={Colors.textMuted}
        />
      }
    >
      {/* Journal Header */}
      <View style={styles.header}>
        <Text style={styles.headerSuperTitle}>SHARED ARCHIVE</Text>
        <Text style={styles.headerTitle}>Memory & Journal</Text>
        <Text style={styles.headerSubtitle}>
          Observations and moments {activePersona?.name || 'your companion'} keeps close to heart.
        </Text>
      </View>

      {/* Remembered Personal Facts Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionSuperLabel}>REMEMBERED DETAILS</Text>
          <Text style={styles.countText}>{facts.length}</Text>
        </View>

        {facts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              No specific details recorded yet. As you converse, moments and preferences naturally take root here.
            </Text>
          </View>
        ) : (
          facts.map((fact) => (
            <View key={fact.id} style={styles.factItem}>
              <View style={styles.factMain}>
                <Text style={styles.factCategory}>{fact.category.toUpperCase()}</Text>
                <Text style={styles.factValue}>{fact.value}</Text>
                <Text style={styles.factKey}>{fact.key}</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.6}
                onPress={() => handleDeleteFact(fact.id, fact.key)}
                style={styles.forgetBtn}
              >
                <Text style={styles.forgetBtnText}>RELEASE</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {/* Shared Emotional Milestones Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionSuperLabel}>SHARED MILESTONES</Text>
          <Text style={styles.countText}>{episodicMemories.length}</Text>
        </View>

        {episodicMemories.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Milestones take shape when moments of intimacy, vulnerability, or joy are exchanged.
            </Text>
          </View>
        ) : (
          episodicMemories.map((mem) => (
            <View key={mem.id} style={styles.milestoneItem}>
              <Text style={styles.milestoneDepth}>
                DEPTH {mem.emotional_significance}/10
              </Text>
              <Text style={styles.milestoneSummary}>{mem.summary}</Text>
            </View>
          ))
        )}
      </View>
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
  header: {
    marginBottom: Spacing.xl,
  },
  headerSuperTitle: {
    fontSize: Typography.metadata,
    letterSpacing: 2.2,
    color: Colors.textMuted,
    fontWeight: '600',
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: Typography.screenTitle, // 36px
    lineHeight: Typography.lineHeight.screenTitle,
    fontWeight: '400',
    color: Colors.text,
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 8,
    lineHeight: 22,
  },
  section: {
    marginBottom: Spacing.xl,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionSuperLabel: {
    fontSize: Typography.metadata,
    letterSpacing: 2.0,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  countText: {
    fontSize: 12,
    color: Colors.textMuted,
    letterSpacing: 1.0,
  },
  emptyState: {
    paddingVertical: Spacing.lg,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  factItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  factMain: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  factCategory: {
    fontSize: 10,
    letterSpacing: 1.6,
    color: Colors.textMuted,
    fontWeight: '600',
    marginBottom: 4,
  },
  factValue: {
    fontSize: 17,
    fontWeight: '400',
    color: Colors.text, // Warm text
    lineHeight: 24,
  },
  factKey: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  forgetBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  forgetBtnText: {
    fontSize: 10,
    letterSpacing: 1.4,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  milestoneItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  milestoneDepth: {
    fontSize: 10,
    letterSpacing: 1.8,
    color: Colors.ochre,
    fontWeight: '700',
    marginBottom: 4,
  },
  milestoneSummary: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
});
