import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, BorderRadius, Spacing } from '../../src/constants/theme';
import { DoubleBezelCard } from '../../src/components/common/DoubleBezelCard';
import { GlowButton } from '../../src/components/common/GlowButton';
import { api } from '../../src/services/api';
import { useCompanionStore } from '../../src/store/companionStore';

const CATEGORIES = ['all', 'preferences', 'personal', 'philosophy', 'habit', 'secret'];

const DEFAULT_SEED_FACTS = [
  {
    id: 'f-1',
    category: 'preferences',
    key: 'Favorite Tea',
    value: 'Roasted barley and sencha with fresh mint',
  },
  {
    id: 'f-2',
    category: 'philosophy',
    key: 'Core View on Solitude',
    value: 'Quiet solitude is necessary to hear genuine internal convictions',
  },
  {
    id: 'f-3',
    category: 'personal',
    key: 'Writing Ritual',
    value: 'Writes before dawn while the kettle is on',
  },
];

const DEFAULT_SEED_MILESTONES = [
  {
    id: 'm-1',
    emotional_significance: 8,
    summary: 'Exchanged reflections on navigating fatigue and allowing quiet presence without performance pressure.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 'm-2',
    emotional_significance: 7,
    summary: 'Discussed architectural voids and how spatial breathing mirrors emotional honesty in conversation.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
  },
];

export default function MemoryVaultScreen() {
  const activePersona = useCompanionStore((state) => state.activePersona);
  const [loading, setLoading] = useState(false);
  const [facts, setFacts] = useState<any[]>(DEFAULT_SEED_FACTS);
  const [episodicMemories, setEpisodicMemories] = useState<any[]>(DEFAULT_SEED_MILESTONES);

  const [activeTab, setActiveTab] = useState<'facts' | 'milestones'>('facts');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Add Fact Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newCategory, setNewCategory] = useState('preferences');

  const loadMemories = async () => {
    if (!activePersona) return;
    setLoading(true);
    try {
      const data = await api.getMemories(activePersona.id);
      if (data && data.facts && data.facts.length > 0) {
        setFacts(data.facts);
      }
      if (data && data.episodic_memories && data.episodic_memories.length > 0) {
        setEpisodicMemories(data.episodic_memories);
      }
    } catch (_) {
      // Fallback kept intact
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
            } catch (_) {}
            setFacts((prev) => prev.filter((f) => f.id !== factId));
          },
        },
      ]
    );
  };

  const handleAddFact = () => {
    if (!newKey.trim() || !newValue.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const newFact = {
      id: `fact-${Date.now()}`,
      category: newCategory,
      key: newKey.trim(),
      value: newValue.trim(),
    };

    setFacts((prev) => [newFact, ...prev]);
    setNewKey('');
    setNewValue('');
    setShowAddModal(false);
  };

  const filteredFacts =
    selectedCategory === 'all'
      ? facts
      : facts.filter((f) => f.category === selectedCategory);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadMemories}
            tintColor={Colors.terracotta}
          />
        }
      >
        {/* Editorial Vault Header */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerBadge}>
              <Feather name="shield" size={11} color={Colors.terracotta} />
              <Text style={styles.headerBadgeText}>
                CONFIDENTIAL & PERMANENT
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => setShowAddModal(true)}
              style={styles.addFactQuickBtn}
            >
              <Feather name="plus" size={13} color={Colors.text} />
              <Text style={styles.addFactQuickText}>Add Fact</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.headerTitle}>Memory Vault</Text>
          <Text style={styles.headerSubtitle}>
            Observations, preferences, and moments {activePersona?.name || 'your companion'} keeps close to heart.
          </Text>
        </View>

        {/* Tab Toggle: Remembered Facts vs Milestones */}
        <View style={styles.tabToggleRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveTab('facts');
            }}
            style={[styles.tabButton, activeTab === 'facts' && styles.tabButtonActive]}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'facts' && styles.tabButtonTextActive,
              ]}
            >
              Remembered Facts ({facts.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveTab('milestones');
            }}
            style={[
              styles.tabButton,
              activeTab === 'milestones' && styles.tabButtonActive,
            ]}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'milestones' && styles.tabButtonTextActive,
              ]}
            >
              Milestones ({episodicMemories.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Category Filter Chips for Facts */}
        {activeTab === 'facts' && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
            contentContainerStyle={styles.categoryContent}
          >
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  activeOpacity={0.7}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedCategory(cat);
                  }}
                  style={[
                    styles.categoryChip,
                    isSelected && styles.categoryChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      isSelected && styles.categoryChipTextActive,
                    ]}
                  >
                    {cat.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Tab Content */}
        {activeTab === 'facts' ? (
          <View style={styles.itemsList}>
            {filteredFacts.length === 0 ? (
              <View style={styles.emptyCard}>
                <Feather name="book-open" size={24} color={Colors.textMuted} />
                <Text style={styles.emptyTitle}>No Recorded Facts</Text>
                <Text style={styles.emptySubtitle}>
                  Conversations naturally record details here, or tap "+ Add Fact" to teach {activePersona?.name || 'your companion'} directly.
                </Text>
              </View>
            ) : (
              filteredFacts.map((fact) => (
                <DoubleBezelCard
                  key={fact.id}
                  style={styles.factCardOuter}
                  innerStyle={styles.factCardInner}
                >
                  <View style={styles.factTopRow}>
                    <View style={styles.factCategoryBadge}>
                      <Text style={styles.factCategoryText}>
                        {fact.category.toUpperCase()}
                      </Text>
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.6}
                      onPress={() => handleDeleteFact(fact.id, fact.key)}
                      style={styles.deleteBtn}
                    >
                      <Feather name="trash-2" size={13} color={Colors.textMuted} />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.factValue}>{fact.value}</Text>
                  <Text style={styles.factKey}>Detail Key: {fact.key}</Text>
                </DoubleBezelCard>
              ))
            )}
          </View>
        ) : (
          <View style={styles.itemsList}>
            {episodicMemories.length === 0 ? (
              <View style={styles.emptyCard}>
                <Feather name="bookmark" size={24} color={Colors.textMuted} />
                <Text style={styles.emptyTitle}>No Milestones Yet</Text>
                <Text style={styles.emptySubtitle}>
                  Milestones take shape when moments of intimacy, vulnerability, or joy are shared in dialogue.
                </Text>
              </View>
            ) : (
              episodicMemories.map((mem) => (
                <DoubleBezelCard
                  key={mem.id}
                  style={styles.factCardOuter}
                  innerStyle={styles.factCardInner}
                >
                  <View style={styles.milestoneDepthRow}>
                    <View style={styles.depthTag}>
                      <Feather name="heart" size={11} color={Colors.terracotta} />
                      <Text style={styles.depthText}>
                        EMOTIONAL DEPTH {mem.emotional_significance}/10
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.milestoneSummary}>{mem.summary}</Text>
                </DoubleBezelCard>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Add Fact Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalSuperTitle}>TEACH COMPANION</Text>
                <Text style={styles.modalTitle}>Record New Fact</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowAddModal(false)}
                style={styles.modalCloseBtn}
              >
                <Feather name="x" size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.inputLabel}>CATEGORY</Text>
              <View style={styles.archetypeChipsRow}>
                {CATEGORIES.filter((c) => c !== 'all').map((item) => {
                  const isSelected = newCategory === item;
                  return (
                    <TouchableOpacity
                      key={item}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setNewCategory(item);
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

              <Text style={styles.inputLabel}>DETAIL KEY / TOPIC</Text>
              <TextInput
                placeholder="e.g. Favorite Music, Working Hours, Coffee Order"
                placeholderTextColor={Colors.textMuted}
                value={newKey}
                onChangeText={setNewKey}
                style={styles.inputField}
              />

              <Text style={styles.inputLabel}>REMEMBERED VALUE / TRUTH</Text>
              <TextInput
                placeholder="e.g. Prefers lo-fi instrumentals while drafting poetry"
                placeholderTextColor={Colors.textMuted}
                value={newValue}
                onChangeText={setNewValue}
                multiline
                numberOfLines={3}
                style={[styles.inputField, { height: 75, textAlignVertical: 'top' }]}
              />

              <View style={styles.modalSubmitWrapper}>
                <GlowButton
                  title="Preserve in Vault"
                  onPress={handleAddFact}
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
    paddingTop: 52,
    paddingBottom: 70,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 9999,
    backgroundColor: Colors.terracottaBg,
  },
  headerBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.terracotta,
    letterSpacing: 1.2,
  },
  addFactQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
  },
  addFactQuickText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  },
  tabToggleRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: BorderRadius.sm,
    padding: 3,
    marginBottom: Spacing.md,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: BorderRadius.xs,
  },
  tabButtonActive: {
    backgroundColor: '#1E1D1B',
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  tabButtonTextActive: {
    color: Colors.text,
  },
  categoryScroll: {
    marginBottom: Spacing.md,
  },
  categoryContent: {
    gap: 8,
  },
  categoryChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.035)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  categoryChipActive: {
    backgroundColor: Colors.terracottaBg,
    borderColor: Colors.terracottaBorder,
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 0.8,
  },
  categoryChipTextActive: {
    color: Colors.terracotta,
  },
  itemsList: {
    gap: 12,
  },
  factCardOuter: {
    width: '100%',
  },
  factCardInner: {
    padding: 14,
    gap: 6,
  },
  factTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  factCategoryBadge: {
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  factCategoryText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#D5CEC4',
    letterSpacing: 1.0,
  },
  deleteBtn: {
    padding: 4,
  },
  factValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#F5F2EC',
    lineHeight: 22,
  },
  factKey: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  milestoneDepthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  depthTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: Colors.terracottaBg,
  },
  depthText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.terracotta,
    letterSpacing: 1.0,
  },
  milestoneSummary: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  emptyCard: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#191817',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },

  // Modal styles
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
    letterSpacing: 1.6,
  },
  modalTitle: {
    fontSize: 20,
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
    maxHeight: 400,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 1.2,
    marginTop: 12,
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
    paddingHorizontal: 10,
    paddingVertical: 6,
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
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
  },
  archetypeChipTextActive: {
    color: '#FFF',
  },
  modalSubmitWrapper: {
    marginTop: 20,
    marginBottom: 10,
  },
  modalSubmitBtn: {
    width: '100%',
  },
});
