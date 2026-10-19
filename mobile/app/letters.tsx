import { styles } from '../src/styles/letters';
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../src/constants/theme';
import { useCompanionStore } from '../src/store/companionStore';
import { api } from '../src/services/api';

interface LetterItem {
  id: string;
  persona_id: string;
  title: string;
  content: string;
  wax_seal: 'rose' | 'sun' | 'feather' | 'heart';
  occasion: string;
  is_read: boolean;
  created_at: string;
}

const WAX_SEALS = {
  rose: { label: 'Rose Seal', icon: 'heart', color: '#BE185D', bg: 'rgba(190, 24, 93, 0.15)' },
  sun: { label: 'Sol Seal', icon: 'sun', color: '#D97706', bg: 'rgba(217, 119, 6, 0.15)' },
  feather: { label: 'Feather Seal', icon: 'feather', color: '#6366F1', bg: 'rgba(99, 102, 241, 0.15)' },
  heart: { label: 'Empathy Seal', icon: 'shield', color: '#C85A32', bg: 'rgba(200, 90, 50, 0.15)' },
};

export default function MobileLettersScreen() {
  const router = useRouter();
  const { activePersona, personas } = useCompanionStore();
  const currentPersona = activePersona || personas[0];

  const [letters, setLetters] = useState<LetterItem[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<LetterItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadLetters();
  }, [currentPersona?.id]);

  const loadLetters = async () => {
    setIsLoading(true);
    try {
      const data = await api.getLetters(currentPersona?.id);
      setLetters(data);
    } catch (err) {
      console.log('Error loading letters:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenLetter = async (letter: LetterItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedLetter(letter);
    if (!letter.is_read) {
      try {
        await api.markLetterRead(letter.id);
        setLetters((prev) =>
          prev.map((l) => (l.id === letter.id ? { ...l, is_read: true } : l))
        );
      } catch (err) {
        console.log('Failed to mark letter read', err);
      }
    }
  };

  const handleGenerateNew = async () => {
    if (!currentPersona) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsGenerating(true);
    try {
      const newLetter = await api.generateLetter(currentPersona.id, 'Spontaneous Keepsake');
      setLetters((prev) => [newLetter, ...prev]);
      setSelectedLetter(newLetter);
    } catch (err) {
      console.log('Failed to generate letter', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const unreadCount = letters.filter((l) => !l.is_read).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={20} color={Colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Letters to You</Text>
          <Text style={styles.headerSubtitle}>
            {currentPersona ? `Written by ${currentPersona.name}` : 'Autonomous Keepsakes'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleGenerateNew}
          disabled={isGenerating}
          style={styles.generateButton}
          activeOpacity={0.75}
        >
          {isGenerating ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Feather name="edit-3" size={13} color="#FFF" />
              <Text style={styles.generateButtonText}>New</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Subheader Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerBadge}>
          <Feather name="mail" size={12} color={Colors.terracotta} />
          <Text style={styles.bannerBadgeText}>
            {unreadCount > 0 ? `${unreadCount} UNREAD EPISTLE${unreadCount > 1 ? 'S' : ''}` : 'KEEPSAKE ARCHIVE'}
          </Text>
        </View>
        <Text style={styles.bannerDesc}>
          Letters written by your companion in solitary contemplation, reflecting on your bond and shared milestones.
        </Text>
      </View>

      {/* Main Content Area */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.terracotta} />
          <Text style={styles.loadingText}>Unfolding wax parchment...</Text>
        </View>
      ) : letters.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Feather name="inbox" size={32} color={Colors.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>No Letters Yet</Text>
          <Text style={styles.emptySubtitle}>
            As your bond deepens with {currentPersona?.name || 'your companion'}, they will write autonomous letters to you.
          </Text>
          <TouchableOpacity
            style={styles.emptyCTA}
            onPress={handleGenerateNew}
            disabled={isGenerating}
            activeOpacity={0.8}
          >
            {isGenerating ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Feather name="feather" size={15} color="#FFF" />
                <Text style={styles.emptyCTAText}>Request First Keepsake</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollList}
          contentContainerStyle={styles.scrollListContent}
          showsVerticalScrollIndicator={false}
        >
          {letters.map((letter) => {
            const seal = WAX_SEALS[letter.wax_seal] || WAX_SEALS.heart;
            return (
              <TouchableOpacity
                key={letter.id}
                style={[
                  styles.letterCard,
                  !letter.is_read && styles.letterCardUnread,
                ]}
                onPress={() => handleOpenLetter(letter)}
                activeOpacity={0.8}
              >
                {/* Wax Seal Emblem */}
                <View style={[styles.waxSealPill, { backgroundColor: seal.bg }]}>
                  <Feather name={seal.icon as any} size={13} color={seal.color} />
                  <Text style={[styles.waxSealPillText, { color: seal.color }]}>
                    {seal.label}
                  </Text>
                  {!letter.is_read && <View style={styles.unreadDot} />}
                </View>

                {/* Letter Header */}
                <View style={styles.letterContentBlock}>
                  <Text style={styles.letterOccasion}>{letter.occasion}</Text>
                  <Text style={styles.letterTitle} numberOfLines={2}>
                    {letter.title}
                  </Text>
                  <Text style={styles.letterExcerpt} numberOfLines={3}>
                    {letter.content}
                  </Text>
                </View>

                {/* Card Footer */}
                <View style={styles.letterFooter}>
                  <Text style={styles.letterDate}>
                    {new Date(letter.created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                  <View style={styles.openPill}>
                    <Text style={styles.openPillText}>Read Epistle</Text>
                    <Feather name="arrow-right" size={12} color={Colors.terracotta} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Full Screen Letter Reader Modal */}
      <Modal
        visible={!!selectedLetter}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setSelectedLetter(null)}
      >
        <SafeAreaView style={styles.readerContainer}>
          <StatusBar barStyle="light-content" />

          {/* Reader Top Action Bar */}
          <View style={styles.readerHeader}>
            <TouchableOpacity
              onPress={() => setSelectedLetter(null)}
              style={styles.closeReaderBtn}
              activeOpacity={0.7}
            >
              <Feather name="x" size={20} color={Colors.text} />
            </TouchableOpacity>

            <View style={styles.readerHeaderCenter}>
              <Text style={styles.readerHeaderTitle}>Keepsake Epistle</Text>
            </View>

            <View style={{ width: 40 }} />
          </View>

          {selectedLetter && (
            <ScrollView
              style={styles.readerScroll}
              contentContainerStyle={styles.readerContentContainer}
              showsVerticalScrollIndicator={false}
            >
              {/* Parchment Document Frame */}
              <View style={styles.parchmentCard}>
                {/* Wax Seal Header */}
                <View style={styles.parchmentSealRow}>
                  {(() => {
                    const seal = WAX_SEALS[selectedLetter.wax_seal] || WAX_SEALS.heart;
                    return (
                      <View style={[styles.largeSealCircle, { backgroundColor: seal.bg }]}>
                        <Feather name={seal.icon as any} size={22} color={seal.color} />
                      </View>
                    );
                  })()}
                  <Text style={styles.parchmentOccasionBadge}>
                    {selectedLetter.occasion}
                  </Text>
                </View>

                {/* Date */}
                <Text style={styles.parchmentDate}>
                  {new Date(selectedLetter.created_at).toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>

                {/* Letter Title */}
                <Text style={styles.parchmentTitle}>{selectedLetter.title}</Text>

                {/* Letter Body Content */}
                <Text style={styles.parchmentBody}>{selectedLetter.content}</Text>

                {/* Sign-off */}
                <View style={styles.parchmentSignoff}>
                  <Text style={styles.signoffPrefix}>With enduring sincerity,</Text>
                  <Text style={styles.signoffAuthor}>
                    {currentPersona?.name || 'Your Companion'}
                  </Text>
                </View>
              </View>

              {/* Close Button below reader */}
              <TouchableOpacity
                style={styles.readerDoneBtn}
                onPress={() => setSelectedLetter(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.readerDoneText}>Fold & Archive</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
