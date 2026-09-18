import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, BorderRadius, Spacing, Typography } from '../../constants/theme';
import { Message } from '../../store/companionStore';

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

  // AI Dialogue: Editorial, literary presentation with spacious typography
  return (
    <View style={styles.assistantEntry}>
      {/* Speaker Header with Character Presence */}
      <View style={styles.speakerRow}>
        {companionAvatar ? (
          <Image source={{ uri: companionAvatar }} style={styles.speakerAvatar} />
        ) : null}
        <Text style={styles.speakerLabel}>{companionName.toUpperCase()}</Text>

        {message.thought_trace ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={toggleThought}
            style={styles.thoughtToggle}
          >
            <Text style={styles.thoughtToggleText}>
              {showThought ? 'Close reflection' : 'Reflection'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Inner Reflection (Quiet, non-intrusive) */}
      {showThought && message.thought_trace ? (
        <View style={styles.thoughtContainer}>
          <Text style={styles.thoughtText}>{message.thought_trace}</Text>
        </View>
      ) : null}

      {/* Snapshot / Media if present */}
      {message.media_type === 'selfie' && message.media_url ? (
        <View style={styles.mediaContainer}>
          <Image source={{ uri: message.media_url }} style={styles.mediaImage} resizeMode="cover" />
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
  // User dialogue: Visually quiet, indented, subtle
  userEntry: {
    alignSelf: 'flex-end',
    maxWidth: '82%',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  userSpeakerLabel: {
    fontSize: Typography.metadata,
    letterSpacing: 1.8,
    color: Colors.textMuted,
    fontWeight: '500',
    textAlign: 'right',
    marginBottom: 6,
  },
  userContentSurface: {
    backgroundColor: 'rgba(255, 255, 255, 0.035)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userText: {
    fontSize: Typography.userResponse, // 16px
    lineHeight: Typography.lineHeight.userResponse, // 24px
    color: Colors.textSecondary,
    letterSpacing: 0.2,
  },

  // Assistant dialogue: Editorial, spacious, character-first
  assistantEntry: {
    alignSelf: 'flex-start',
    width: '100%',
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  speakerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  speakerAvatar: {
    width: 26,
    height: 26,
    borderRadius: BorderRadius.sm,
    marginRight: 10,
    opacity: 0.88,
  },
  speakerLabel: {
    fontSize: Typography.metadata, // 12px
    letterSpacing: 2.0,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  thoughtToggle: {
    marginLeft: 'auto',
    paddingVertical: 2,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  thoughtToggleText: {
    fontSize: 11,
    color: Colors.textMuted,
    letterSpacing: 0.8,
  },
  thoughtContainer: {
    marginBottom: Spacing.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderLeftWidth: 1.5,
    borderLeftColor: Colors.textMuted,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: BorderRadius.xs,
  },
  thoughtText: {
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
    color: Colors.textMuted,
  },
  dialogueContainer: {
    paddingLeft: 2,
    paddingRight: Spacing.md,
  },
  dialogueText: {
    fontSize: Typography.aiResponse, // 18px
    lineHeight: Typography.lineHeight.aiResponse, // 28px
    color: Colors.text, // Warm primary #F0EDE4
    letterSpacing: 0.3,
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
