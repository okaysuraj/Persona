import { styles } from '../../src/styles/tabs/memory';
import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing } from '../../src/constants/theme';
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
  const [temporalNodes, setTemporalNodes] = useState<any[]>([]);
  const [psychometrics, setPsychometrics] = useState<any | null>(null);
  const [isConsolidating, setIsConsolidating] = useState(false);

  const [activeTab, setActiveTab] = useState<'facts' | 'milestones' | 'graph' | 'psychometrics'>('facts');
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
      const [memData, graphData, psychData] = await Promise.all([
        api.getMemories(activePersona.id).catch(() => null),
        api.getTemporalGraph(activePersona.id).catch(() => []),
        api.getUserPsychometrics(activePersona.id).catch(() => null),
      ]);

      if (memData?.facts?.length) {
        setFacts(memData.facts);
      }
      if (memData?.episodic_memories?.length) {
        setEpisodicMemories(memData.episodic_memories);
      }
      if (graphData?.length) {
        setTemporalNodes(graphData);
      }
      if (psychData) {
        setPsychometrics(psychData);
      }
    } catch (_) {
      // Fallback kept intact
    } finally {
      setLoading(false);
    }
  };

  const handleSleepConsolidation = async () => {
    if (!activePersona) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsConsolidating(true);
    try {
      const res = await api.triggerSleepConsolidation(activePersona.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Sleep Consolidation Complete',
        `Cognitive Cycle Finished:\n• ${res.contradictions_resolved || 0} contradictions resolved\n• ${res.edges_formed || 0} temporal edges synthesized\n\n"${res.episodic_synthesis || 'Knowledge graph updated.'}"`
      );
      await loadMemories();
    } catch (err: any) {
      Alert.alert('Consolidation Error', err.message || 'Failed to trigger sleep consolidation');
    } finally {
      setIsConsolidating(false);
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

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={handleSleepConsolidation}
                disabled={isConsolidating}
                style={[
                  styles.addFactQuickBtn,
                  {
                    backgroundColor: 'rgba(99, 102, 241, 0.12)',
                    borderColor: 'rgba(99, 102, 241, 0.3)',
                  },
                ]}
              >
                <Feather name="moon" size={13} color="#818CF8" />
                <Text style={[styles.addFactQuickText, { color: '#818CF8' }]}>
                  {isConsolidating ? 'Consolidating...' : 'Sleep Cycle'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => setShowAddModal(true)}
                style={styles.addFactQuickBtn}
              >
                <Feather name="plus" size={13} color={Colors.text} />
                <Text style={styles.addFactQuickText}>Add Fact</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.headerTitle}>Memory Vault</Text>
          <Text style={styles.headerSubtitle}>
            Observations, preferences, and moments {activePersona?.name || 'your companion'} keeps close to heart.
          </Text>
        </View>

        {/* Tab Toggle: Remembered Facts vs Milestones vs Temporal Graph vs Psychometrics */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: Spacing.md }}
          contentContainerStyle={{ gap: 6 }}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveTab('facts');
            }}
            style={[styles.tabButtonPill, activeTab === 'facts' && styles.tabButtonPillActive]}
          >
            <Text style={[styles.tabButtonText, activeTab === 'facts' && styles.tabButtonTextActive]}>
              Facts ({facts.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveTab('milestones');
            }}
            style={[styles.tabButtonPill, activeTab === 'milestones' && styles.tabButtonPillActive]}
          >
            <Text style={[styles.tabButtonText, activeTab === 'milestones' && styles.tabButtonTextActive]}>
              Milestones ({episodicMemories.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveTab('graph');
            }}
            style={[styles.tabButtonPill, activeTab === 'graph' && styles.tabButtonPillActive]}
          >
            <Text style={[styles.tabButtonText, activeTab === 'graph' && styles.tabButtonTextActive]}>
              Temporal Graph ({temporalNodes.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveTab('psychometrics');
            }}
            style={[styles.tabButtonPill, activeTab === 'psychometrics' && styles.tabButtonPillActive]}
          >
            <Text style={[styles.tabButtonText, activeTab === 'psychometrics' && styles.tabButtonTextActive]}>
              Psychometrics
            </Text>
          </TouchableOpacity>
        </ScrollView>

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
        ) : activeTab === 'milestones' ? (
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
        ) : activeTab === 'graph' ? (
          <View style={styles.itemsList}>
            {temporalNodes.length === 0 ? (
              <View style={styles.emptyCard}>
                <Feather name="git-commit" size={24} color={Colors.textMuted} />
                <Text style={styles.emptyTitle}>No Temporal Graph Nodes</Text>
                <Text style={styles.emptySubtitle}>
                  Tap "Sleep Cycle" to run nocturnal memory consolidation and synthesize bi-temporal causal edges.
                </Text>
              </View>
            ) : (
              temporalNodes.map((node) => (
                <DoubleBezelCard
                  key={node.id}
                  style={styles.factCardOuter}
                  innerStyle={styles.factCardInner}
                >
                  <View style={styles.factTopRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <View
                        style={[
                          styles.factCategoryBadge,
                          {
                            backgroundColor: node.is_active
                              ? 'rgba(16, 185, 129, 0.12)'
                              : 'rgba(239, 68, 68, 0.12)',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.factCategoryText,
                            { color: node.is_active ? '#34D399' : '#F87171' },
                          ]}
                        >
                          {node.is_active ? 'ACTIVE TRUTH' : 'SUPERSEDED'}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 10, color: Colors.textMuted }}>
                        {Math.round(node.confidence * 100)}% Confidence
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.factValue}>{node.object_value}</Text>
                  <Text style={styles.factKey}>
                    {node.subject} ➔ {node.predicate}
                  </Text>

                  {node.valid_from && (
                    <Text style={{ fontSize: 11, color: Colors.textMuted, marginTop: 2 }}>
                      Valid: {new Date(node.valid_from).toLocaleDateString()}
                      {node.valid_to ? ` - ${new Date(node.valid_to).toLocaleDateString()}` : ' - Present'}
                    </Text>
                  )}

                  {node.causal_links && node.causal_links.length > 0 && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                      <Feather name="link" size={11} color={Colors.terracotta} />
                      <Text style={{ fontSize: 10, color: Colors.terracotta }}>
                        Causal Edges: {node.causal_links.join(', ')}
                      </Text>
                    </View>
                  )}
                </DoubleBezelCard>
              ))
            )}
          </View>
        ) : (
          <View style={styles.itemsList}>
            {psychometrics ? (
              <>
                <DoubleBezelCard style={styles.factCardOuter} innerStyle={styles.factCardInner}>
                  <View style={styles.factTopRow}>
                    <View style={[styles.factCategoryBadge, { backgroundColor: 'rgba(168, 85, 247, 0.15)' }]}>
                      <Text style={[styles.factCategoryText, { color: '#C084FC' }]}>
                        ATTACHMENT & BOND
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.factValue}>{psychometrics.attachment_style}</Text>
                  <Text style={styles.factKey}>
                    Love Language: {psychometrics.primary_love_language}
                  </Text>
                  <Text style={{ fontSize: 11, color: Colors.textMuted, marginTop: 4 }}>
                    Emotional Stability Index: {Math.round((psychometrics.emotional_stability_score || 0.8) * 100)}%
                  </Text>
                </DoubleBezelCard>

                {psychometrics.big_five && (
                  <DoubleBezelCard style={styles.factCardOuter} innerStyle={styles.factCardInner}>
                    <Text style={[styles.modalSuperTitle, { marginBottom: 8 }]}>BIG FIVE PERSONALITY ATTUNEMENT</Text>
                    {Object.entries(psychometrics.big_five).map(([trait, val]: [string, any]) => (
                      <View key={trait} style={{ marginBottom: 6 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                          <Text style={{ fontSize: 11, color: Colors.text, textTransform: 'capitalize' }}>
                            {trait}
                          </Text>
                          <Text style={{ fontSize: 11, color: Colors.terracotta, fontWeight: '600' }}>
                            {Math.round(val * 100)}%
                          </Text>
                        </View>
                        <View style={{ height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.08)' }}>
                          <View
                            style={{
                              height: 4,
                              borderRadius: 2,
                              backgroundColor: Colors.terracotta,
                              width: `${Math.round(val * 100)}%`,
                            }}
                          />
                        </View>
                      </View>
                    ))}
                  </DoubleBezelCard>
                )}

                {psychometrics.cognitive_distortions_noticed?.length > 0 && (
                  <DoubleBezelCard style={styles.factCardOuter} innerStyle={styles.factCardInner}>
                    <Text style={[styles.modalSuperTitle, { marginBottom: 6, color: '#F59E0B' }]}>
                      COGNITIVE BIASES OBSERVED
                    </Text>
                    {psychometrics.cognitive_distortions_noticed.map((dist: string, idx: number) => (
                      <Text key={idx} style={{ fontSize: 12, color: Colors.textSecondary, marginBottom: 2 }}>
                        • {dist}
                      </Text>
                    ))}
                  </DoubleBezelCard>
                )}

                {psychometrics.growth_recommendations?.length > 0 && (
                  <DoubleBezelCard style={styles.factCardOuter} innerStyle={styles.factCardInner}>
                    <Text style={[styles.modalSuperTitle, { marginBottom: 6, color: '#10B981' }]}>
                      GROWTH & FLOURISHING ADVICE
                    </Text>
                    {psychometrics.growth_recommendations.map((rec: string, idx: number) => (
                      <Text key={idx} style={{ fontSize: 12, color: Colors.textSecondary, marginBottom: 2 }}>
                        ✓ {rec}
                      </Text>
                    ))}
                  </DoubleBezelCard>
                )}
              </>
            ) : (
              <View style={styles.emptyCard}>
                <Feather name="activity" size={24} color={Colors.textMuted} />
                <Text style={styles.emptyTitle}>No Psychometrics Deduced</Text>
                <Text style={styles.emptySubtitle}>
                  Trigger a sleep consolidation cycle to analyze conversational sentiment and deduce attachment models.
                </Text>
              </View>
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
