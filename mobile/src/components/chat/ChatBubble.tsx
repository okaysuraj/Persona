import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking, Modal, SafeAreaView, Dimensions, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, BorderRadius, Spacing } from '../../constants/theme';
import type { Message } from '../../types';
import { getAvatarSource } from '../../utils/avatar';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ChatBubbleProps {
  message: Message;
  companionAvatar?: string;
  companionName?: string;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  companionAvatar,
  companionName = 'Companion',
}) => {
  const isUser = message.sender_type === 'user';
  const [showThought, setShowThought] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const isCrisis = message.media_type === 'crisis_resources' || message.content.includes('988');
  const isVoiceNote = message.media_type === 'voice_note' || message.content.includes('(Voice Note)');

  const toggleThought = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowThought(!showThought);
  };

  const handleCallCrisis = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Linking.openURL('tel:988');
  };

  if (isUser) {
    return (
      <View style={styles.userEntry}>
        <Text style={styles.userSpeakerLabel}>YOU</Text>
        <View style={styles.userContentSurface}>
          {isVoiceNote ? (
            <View style={styles.voiceNoteRow}>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setIsPlayingAudio(!isPlayingAudio);
                }}
                style={styles.voicePlayBtn}
              >
                <Feather name={isPlayingAudio ? 'pause' : 'play'} size={14} color="#FFF" />
              </TouchableOpacity>
              <View style={styles.waveformBars}>
                {[10, 18, 24, 14, 20, 26, 16, 22, 12, 18].map((h, i) => (
                  <View
                    key={i}
                    style={[
                      styles.waveBar,
                      {
                        height: isPlayingAudio ? Math.max(6, h * (i % 2 === 0 ? 1.2 : 0.8)) : h,
                        backgroundColor: isPlayingAudio ? Colors.terracotta : 'rgba(255, 255, 255, 0.4)',
                      },
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.voiceDuration}>{isPlayingAudio ? '0:03' : '0:12'}</Text>
            </View>
          ) : (
            <Text style={styles.userText}>{message.content}</Text>
          )}
        </View>
      </View>
    );
  }

  // AI Companion Dialogue: Editorial, spacious, warm typography
  return (
    <View style={styles.assistantEntry}>
      {/* Crisis Emergency Support Banner (Apple 1.2 Compliance) */}
      {isCrisis && (
        <View style={styles.crisisBanner}>
          <View style={styles.crisisHeaderRow}>
            <Feather name="alert-circle" size={16} color="#F43F5E" />
            <Text style={styles.crisisTitle}>Emergency Crisis Support (988)</Text>
          </View>
          <Text style={styles.crisisSubtitle}>
            Free, confidential, 24/7 support is available right now. You are never alone.
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleCallCrisis}
            style={styles.crisisCallBtn}
          >
            <Feather name="phone-call" size={14} color="#FFFFFF" />
            <Text style={styles.crisisCallBtnText}>Call or Text 988 Lifeline</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Speaker Header with Character Avatar & Name */}
      <View style={styles.speakerRow}>
        <View style={styles.avatarContainer}>
          <Image
            source={getAvatarSource(companionAvatar)}
            style={styles.speakerAvatar}
          />
          <View style={styles.onlineDot} />
        </View>

        <Text style={styles.speakerLabel}>{companionName.toUpperCase()}</Text>

        {message.thought_trace ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={toggleThought}
            style={[styles.thoughtToggle, showThought && styles.thoughtToggleActive]}
          >
            <Feather
              name={showThought ? 'eye-off' : 'cpu'}
              size={11}
              color={showThought ? Colors.terracotta : Colors.textMuted}
            />
            <Text
              style={[
                styles.thoughtToggleText,
                showThought && { color: Colors.terracotta },
              ]}
            >
              {showThought ? 'Close inner monologue' : 'Inner monologue'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Cognitive Inner Monologue Box */}
      {showThought && message.thought_trace ? (
        <View style={styles.thoughtContainer}>
          <View style={styles.thoughtHeader}>
            <Text style={styles.thoughtSuperLabel}>COGNITIVE APPRAISAL</Text>
          </View>
          <Text style={styles.thoughtText}>{message.thought_trace}</Text>
        </View>
      ) : null}

      {/* Voice Note Audio Waveform Player */}
      {isVoiceNote && (
        <View style={styles.assistantVoiceCard}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setIsPlayingAudio(!isPlayingAudio);
            }}
            style={styles.assistantVoicePlayBtn}
          >
            <Feather name={isPlayingAudio ? 'pause' : 'play'} size={15} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.assistantWaveformBars}>
            {[14, 22, 28, 16, 24, 30, 20, 26, 15, 24, 18, 12].map((h, i) => (
              <View
                key={i}
                style={[
                  styles.assistantWaveBar,
                  {
                    height: isPlayingAudio ? Math.max(6, h * (i % 2 === 0 ? 1.25 : 0.75)) : h,
                    backgroundColor: isPlayingAudio ? Colors.terracotta : 'rgba(255, 255, 255, 0.25)',
                  },
                ]}
              />
            ))}
          </View>
          <Text style={styles.assistantVoiceDuration}>{isPlayingAudio ? '0:04' : '0:18'}</Text>
        </View>
      )}

      {/* Snapshot / Selfie Media with Lightbox Trigger */}
      {message.media_type === 'selfie' && message.media_url ? (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowLightbox(true);
          }}
          style={styles.mediaContainer}
        >
          <Image
            source={getAvatarSource(message.media_url)}
            style={styles.mediaImage}
            resizeMode="cover"
          />
          <View style={styles.zoomOverlay}>
            <Feather name="maximize-2" size={12} color="#FFF" />
            <Text style={styles.zoomText}>Tap to view</Text>
          </View>
        </TouchableOpacity>
      ) : null}

      {/* Main Editorial Text */}
      <View style={[styles.dialogueContainer, isCrisis && styles.crisisDialogueContainer]}>
        <Text style={styles.dialogueText}>{message.content}</Text>
      </View>

      {/* Fullscreen Photo Lightbox Modal */}
      {showLightbox && message.media_url && (
        <Modal
          visible={showLightbox}
          transparent
          animationType="fade"
          onRequestClose={() => setShowLightbox(false)}
        >
          <SafeAreaView style={styles.lightboxBackdrop}>
            <View style={styles.lightboxTopBar}>
              <Text style={styles.lightboxHeaderTitle}>PORTRAIT FROM {companionName.toUpperCase()}</Text>
              <TouchableOpacity
                onPress={() => setShowLightbox(false)}
                style={styles.lightboxCloseBtn}
              >
                <Feather name="x" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.lightboxImageWrap}>
              <Image
                source={getAvatarSource(message.media_url)}
                style={styles.lightboxFullImage}
                resizeMode="contain"
              />
            </View>

            <View style={styles.lightboxBottomBar}>
              <Text style={styles.lightboxCaptionText}>"{message.content}"</Text>
            </View>
          </SafeAreaView>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // User dialogue: Clean, right-aligned, elevated surface
  userEntry: {
    alignSelf: 'flex-end',
    maxWidth: '85%',
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  userSpeakerLabel: {
    fontSize: 10,
    letterSpacing: 1.6,
    color: Colors.textMuted,
    fontWeight: '600',
    textAlign: 'right',
    marginBottom: 5,
  },
  userContentSurface: {
    backgroundColor: '#1E1D1B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#F5F2EC',
    letterSpacing: 0.1,
  },

  // Assistant dialogue: Editorial, spacious, character-first
  assistantEntry: {
    alignSelf: 'flex-start',
    width: '100%',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  speakerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 8,
  },
  speakerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  onlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.online,
    borderWidth: 1.5,
    borderColor: '#121211',
  },
  speakerLabel: {
    fontSize: 11,
    letterSpacing: 1.6,
    color: Colors.textMuted,
    fontWeight: '700',
  },
  thoughtToggle: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },
  thoughtToggleActive: {
    backgroundColor: 'rgba(200, 90, 50, 0.12)',
    borderColor: 'rgba(200, 90, 50, 0.3)',
  },
  thoughtToggleText: {
    fontSize: 10,
    color: Colors.textMuted,
    letterSpacing: 0.6,
    fontWeight: '600',
  },
  thoughtContainer: {
    marginBottom: Spacing.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderLeftWidth: 2,
    borderLeftColor: Colors.terracotta,
    backgroundColor: 'rgba(200, 90, 50, 0.05)',
    borderRadius: BorderRadius.xs,
  },
  thoughtHeader: {
    marginBottom: 4,
  },
  thoughtSuperLabel: {
    fontSize: 9,
    letterSpacing: 1.4,
    color: Colors.terracotta,
    fontWeight: '700',
  },
  thoughtText: {
    fontSize: 12,
    lineHeight: 18,
    fontStyle: 'italic',
    color: Colors.textSecondary,
  },
  dialogueContainer: {
    paddingLeft: 2,
    paddingRight: Spacing.md,
  },
  dialogueText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#F5F2EC',
    letterSpacing: 0.1,
  },
  mediaContainer: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginTop: 6,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    width: 250,
    height: 310,
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  // Crisis Support Card
  crisisBanner: {
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(244, 63, 94, 0.35)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    width: '100%',
  },
  crisisHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  crisisTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FDA4AF',
    letterSpacing: 0.2,
  },
  crisisSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    color: '#E2E8F0',
    marginBottom: 10,
  },
  crisisCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E11D48',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.sm,
    shadowColor: '#E11D48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  crisisCallBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  crisisDialogueContainer: {
    backgroundColor: 'rgba(244, 63, 94, 0.04)',
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
  },
  // User Voice Note styles
  voiceNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  voicePlayBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.terracotta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveformBars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 30,
  },
  waveBar: {
    width: 3,
    borderRadius: 2,
  },
  voiceDuration: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#A8A298',
  },
  // Assistant Voice Note Card
  assistantVoiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#1E1D1B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.md,
    marginTop: 6,
    marginBottom: 10,
    width: 270,
  },
  assistantVoicePlayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.terracotta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assistantWaveformBars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 34,
  },
  assistantWaveBar: {
    width: 3,
    borderRadius: 2,
  },
  assistantVoiceDuration: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: Colors.terracotta,
    fontWeight: '600',
  },
  // Media Zoom Indicator
  zoomOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  zoomText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '500',
  },
  // Lightbox Modal
  lightboxBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'space-between',
  },
  lightboxTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  lightboxHeaderTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.terracotta,
    letterSpacing: 1.5,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  lightboxCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightboxImageWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  lightboxFullImage: {
    width: SCREEN_WIDTH - 20,
    height: SCREEN_HEIGHT * 0.6,
  },
  lightboxBottomBar: {
    padding: 20,
    backgroundColor: '#181716',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  lightboxCaptionText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#FAF8F5',
    lineHeight: 20,
    textAlign: 'center',
  },
});
