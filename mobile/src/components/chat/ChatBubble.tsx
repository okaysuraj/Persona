import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, BorderRadius, Spacing, Typography } from '../../constants/theme';
import { Message } from '../../store/companionStore';
import { getAvatarSource } from '../../utils/avatar';

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

  const toggleThought = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowThought(!showThought);
  };

  if (isUser) {
    return (
      <View style={styles.userEntry}>
        <Text style={styles.userSpeakerLabel}>YOU</Text>
        <View style={styles.userContentSurface}>
          <Text style={styles.userText}>{message.content}</Text>
        </View>
      </View>
    );
  }

  // AI Companion Dialogue: Editorial, spacious, warm typography
  return (
    <View style={styles.assistantEntry}>
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

      {/* Snapshot / Media if present */}
      {message.media_type === 'selfie' && message.media_url ? (
        <View style={styles.mediaContainer}>
          <Image
            source={getAvatarSource(message.media_url)}
            style={styles.mediaImage}
            resizeMode="cover"
          />
        </View>
      ) : null}

      {/* Main Editorial Text */}
      <View style={styles.dialogueContainer}>
        <Text style={styles.dialogueText}>{message.content}</Text>
      </View>
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
});
