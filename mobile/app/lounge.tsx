import { styles } from '../src/styles/lounge';
import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../src/constants/theme';
import { useCompanionStore } from '../src/store/companionStore';
import { api } from '../src/services/api';
import { getAvatarSource } from '../src/utils/avatar';

interface LoungeTurn {
  id: string;
  speaker_id: string;
  speaker_name: string;
  text: string;
  is_user?: boolean;
  interacted_with?: string;
}

const SALON_THEMES = [
  { id: 'fireside', name: 'Midnight Fireside', icon: 'coffee', mood: 'Intimate, warm, contemplative' },
  { id: 'salon', name: 'Philosophical Salon', icon: 'book', mood: 'Dialectical, exploratory, deep' },
  { id: 'writers', name: "Writer's Room", icon: 'edit-3', mood: 'Inventive, lyrical, collaborative' },
  { id: 'banter', name: 'After-Hours Banter', icon: 'smile', mood: 'Witty, relaxed, spontaneous' },
];

export default function MobileLoungeScreen() {
  const router = useRouter();
  const { personas, activePersona } = useCompanionStore();

  const [selectedPersonaIds, setSelectedPersonaIds] = useState<string[]>(() => {
    if (personas.length >= 2) return [personas[0].id, personas[1].id];
    if (activePersona) return [activePersona.id];
    return [];
  });

  const [currentTheme, setCurrentTheme] = useState(SALON_THEMES[0]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [harmony, setHarmony] = useState(0.92);

  const [turns, setTurns] = useState<LoungeTurn[]>([
    {
      id: 'init-1',
      speaker_id: 'maya',
      speaker_name: personas[0]?.name || 'Maya',
      text: 'Welcome to the lounge. A quiet hearth where several perspectives can converse together without rush.',
      interacted_with: 'user',
    },
    {
      id: 'init-2',
      speaker_id: 'julian',
      speaker_name: personas[1]?.name || 'Julian',
      text: 'Agreed. Having multiple minds in the room reveals nuances that single conversations often overlook.',
      interacted_with: personas[0]?.name || 'Maya',
    },
  ]);

  const togglePersona = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPersonaIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return prev; // keep at least 1
        return prev.filter((p) => p !== id);
      } else {
        if (prev.length >= 3) return [...prev.slice(1), id];
        return [...prev, id];
      }
    });
  };

  const handleSend = async (customPrompt?: string) => {
    const textToSend = (customPrompt || inputText).trim();
    if (!textToSend || isLoading) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setInputText('');

    const userTurn: LoungeTurn = {
      id: `user-${Date.now()}`,
      speaker_id: 'user',
      speaker_name: 'You',
      text: textToSend,
      is_user: true,
    };

    setTurns((prev) => [...prev, userTurn]);
    setIsLoading(true);

    try {
      const history = turns.slice(-6).map((t) => ({
        speaker_id: t.speaker_id,
        speaker_name: t.speaker_name,
        text: t.text,
      }));

      const res = await api.executeLoungeTurn(selectedPersonaIds, textToSend, history);

      if (res?.turns) {
        const newTurns: LoungeTurn[] = res.turns.map((t: any, i: number) => ({
          id: `companion-${Date.now()}-${i}`,
          speaker_id: t.speaker_id,
          speaker_name: t.speaker_name,
          text: t.text,
          interacted_with: t.interacted_with,
        }));
        setTurns((prev) => [...prev, ...newTurns]);
      }
      if (res?.group_harmony) {
        setHarmony(res.group_harmony);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (_) {
      // Fallback response
      const fallbackTurns: LoungeTurn[] = selectedPersonaIds.map((pid, idx) => {
        const p = personas.find((x) => x.id === pid);
        return {
          id: `fb-${Date.now()}-${idx}`,
          speaker_id: pid,
          speaker_name: p?.name || `Companion ${idx + 1}`,
          text: idx === 0
            ? `That is thought-provoking. It highlights how differently we react when given space to exhale.`
            : `I feel that resonant contrast as well. When we look closer, tension becomes an invitation to listen.`,
          interacted_with: idx === 0 ? 'user' : personas[0]?.name,
        };
      });
      setTurns((prev) => [...prev, ...fallbackTurns]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      style={styles.container}
    >
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Feather name="chevron-left" size={20} color={Colors.text} />
          <Text style={styles.backBtnText}>Exit Lounge</Text>
        </TouchableOpacity>

        <View style={styles.harmonyBadge}>
          <Feather name="zap" size={11} color="#F59E0B" />
          <Text style={styles.harmonyText}>Harmony {Math.round(harmony * 100)}%</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Editorial Title */}
        <View style={styles.heroSection}>
          <View style={styles.badgeRow}>
            <Feather name="coffee" size={12} color={Colors.terracotta} />
            <Text style={styles.badgeText}>MULTI-COMPANION PARLOR</Text>
          </View>
          <Text style={styles.heroTitle}>The Lounge</Text>
          <Text style={styles.heroSubtitle}>
            Bring 2 to 3 companions into one shared fireside discussion. They banter, cross-reference memories, and reflect together.
          </Text>
        </View>

        {/* Companions in Room Selector */}
        <Text style={styles.sectionLabel}>COMPANIONS IN ATTENDANCE</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.companionScroll}
          contentContainerStyle={{ gap: 8 }}
        >
          {personas.map((p) => {
            const isSelected = selectedPersonaIds.includes(p.id);
            return (
              <TouchableOpacity
                key={p.id}
                onPress={() => togglePersona(p.id)}
                activeOpacity={0.8}
                style={[
                  styles.companionChip,
                  isSelected && styles.companionChipActive,
                ]}
              >
                <Image
                  source={getAvatarSource(p.avatar_url)}
                  style={styles.companionAvatar}
                />
                <Text
                  style={[
                    styles.companionChipText,
                    isSelected && styles.companionChipTextActive,
                  ]}
                >
                  {p.name}
                </Text>
                {isSelected && (
                  <View style={styles.activeCheck}>
                    <Feather name="check" size={10} color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Salon Themes */}
        <Text style={styles.sectionLabel}>SALON ATMOSPHERE</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.themeScroll}
          contentContainerStyle={{ gap: 8 }}
        >
          {SALON_THEMES.map((th) => {
            const isSelected = currentTheme.id === th.id;
            return (
              <TouchableOpacity
                key={th.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setCurrentTheme(th);
                }}
                activeOpacity={0.8}
                style={[
                  styles.themeChip,
                  isSelected && styles.themeChipActive,
                ]}
              >
                <Feather
                  name={th.icon as any}
                  size={12}
                  color={isSelected ? Colors.terracotta : Colors.textMuted}
                />
                <Text
                  style={[
                    styles.themeChipText,
                    isSelected && styles.themeChipTextActive,
                  ]}
                >
                  {th.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Conversation Stream */}
        <View style={styles.turnsContainer}>
          {turns.map((turn) => (
            <View
              key={turn.id}
              style={[
                styles.turnCard,
                turn.is_user && styles.turnCardUser,
              ]}
            >
              <View style={styles.turnHeader}>
                <Text
                  style={[
                    styles.turnSpeaker,
                    turn.is_user ? { color: Colors.terracotta } : { color: '#E0DDD7' },
                  ]}
                >
                  {turn.speaker_name}
                </Text>
                {turn.interacted_with && (
                  <Text style={styles.turnInteracted}>
                    responding to {turn.interacted_with}
                  </Text>
                )}
              </View>
              <Text style={styles.turnText}>{turn.text}</Text>
            </View>
          ))}

          {isLoading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={Colors.terracotta} />
              <Text style={styles.loadingText}>Companions are reflecting together...</Text>
            </View>
          )}
        </View>

        {/* Discussion Sparks */}
        <Text style={[styles.sectionLabel, { marginTop: 14 }]}>IGNITE CONVERSATION</Text>
        <View style={styles.sparksContainer}>
          {[
            'How do memories change the way we experience tomorrow?',
            'What is a quiet observation you made today?',
            'If this evening had a distinct color, what would it be?',
          ].map((spark, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => handleSend(spark)}
              activeOpacity={0.7}
              style={styles.sparkChip}
            >
              <Text style={styles.sparkText}>"{spark}"</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <TextInput
          placeholder="Speak to the lounge..."
          placeholderTextColor={Colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={() => handleSend()}
          style={styles.input}
        />
        <TouchableOpacity
          onPress={() => handleSend()}
          disabled={!inputText.trim() || isLoading}
          style={[
            styles.sendBtn,
            (!inputText.trim() || isLoading) && styles.sendBtnDisabled,
          ]}
          activeOpacity={0.8}
        >
          <Feather name="arrow-up" size={16} color="#FFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
