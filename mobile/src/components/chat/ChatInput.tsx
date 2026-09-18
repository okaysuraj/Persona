import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, BorderRadius, Spacing, Typography } from '../../constants/theme';

interface ChatInputProps {
  onSend: (text: string) => void;
  onRequestPhoto?: () => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, onRequestPhoto, disabled = false }) => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSend(text.trim());
    setText('');
  };

  const handleVoiceToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        onSend("I was thinking of you... just wanted to check in. (Voice Note)");
      }, 2500);
    }
  };

  return (
    <View style={styles.floatingWrapper}>
      {/* Floating Translucent Glass Surface */}
      <View style={styles.composerGlass}>
        <TextInput
          placeholder="Speak or write your thoughts..."
          placeholderTextColor={Colors.textMuted}
          value={text}
          onChangeText={setText}
          style={styles.textInput}
          multiline
          maxLength={1000}
          editable={!disabled}
        />

        <View style={styles.bottomControlsRow}>
          {/* Subtle Mic / Voice Trigger */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleVoiceToggle}
            style={[styles.smallIconBtn, isRecording && styles.smallIconBtnActive]}
          >
            <Text style={[styles.controlGlyph, isRecording && { color: Colors.burgundy }]}>
              {isRecording ? 'REC' : 'MIC'}
            </Text>
          </TouchableOpacity>

          {/* Optional Photo Prompt Trigger */}
          {onRequestPhoto ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onRequestPhoto();
              }}
              style={styles.smallIconBtn}
            >
              <Text style={styles.controlGlyph}>PORTRAIT</Text>
            </TouchableOpacity>
          ) : null}

          {/* Send Trigger */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handleSend}
            disabled={!text.trim() || disabled}
            style={[
              styles.sendAction,
              text.trim() ? styles.sendActionActive : styles.sendActionDisabled,
            ]}
          >
            <Text
              style={[
                styles.sendActionText,
                text.trim() ? { color: Colors.text } : { color: Colors.textMuted },
              ]}
            >
              SEND
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingWrapper: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    paddingTop: Spacing.xs,
    backgroundColor: 'transparent',
  },
  composerGlass: {
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingTop: 12,
    paddingBottom: 10,
  },
  textInput: {
    color: Colors.text,
    fontSize: Typography.userResponse, // 16px
    lineHeight: 22,
    minHeight: 36,
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  bottomControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 8,
  },
  smallIconBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  smallIconBtnActive: {
    backgroundColor: 'rgba(90, 44, 42, 0.25)',
    borderColor: Colors.burgundy,
  },
  controlGlyph: {
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  sendAction: {
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
  },
  sendActionActive: {
    backgroundColor: Colors.forestGreen,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  sendActionDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderColor: 'transparent',
  },
  sendActionText: {
    fontSize: 11,
    letterSpacing: 1.8,
    fontWeight: '700',
  },
});
