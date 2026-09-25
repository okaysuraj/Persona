import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, BorderRadius, Spacing } from '../../constants/theme';

interface ChatInputProps {
  onSend: (text: string) => void;
  onRequestPhoto?: () => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  onRequestPhoto,
  disabled = false,
}) => {
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

  const canSend = Boolean(text.trim()) && !disabled;

  return (
    <View style={styles.floatingWrapper}>
      {/* Floating Card Surface */}
      <View style={styles.composerCard}>
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
          <View style={styles.leftTools}>
            {/* Mic / Voice Note Trigger */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleVoiceToggle}
              style={[styles.smallIconBtn, isRecording && styles.smallIconBtnActive]}
            >
              <Feather
                name={isRecording ? 'radio' : 'mic'}
                size={14}
                color={isRecording ? Colors.terracotta : Colors.textMuted}
              />
              <Text
                style={[
                  styles.controlGlyph,
                  isRecording && { color: Colors.terracotta },
                ]}
              >
                {isRecording ? 'REC' : 'VOICE'}
              </Text>
            </TouchableOpacity>

            {/* Optional Photo / Portrait Prompt */}
            {onRequestPhoto ? (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onRequestPhoto();
                }}
                style={styles.smallIconBtn}
              >
                <Feather name="camera" size={13} color={Colors.textMuted} />
                <Text style={styles.controlGlyph}>PORTRAIT</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Send Action Button */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handleSend}
            disabled={!canSend}
            style={[
              styles.sendAction,
              canSend ? styles.sendActionActive : styles.sendActionDisabled,
            ]}
          >
            <Feather
              name="arrow-up"
              size={15}
              color={canSend ? '#FFFFFF' : Colors.textMuted}
            />
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
  composerCard: {
    backgroundColor: '#191817',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingTop: 12,
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  textInput: {
    color: '#F5F2EC',
    fontSize: 15,
    lineHeight: 22,
    minHeight: 36,
    maxHeight: 110,
    textAlignVertical: 'top',
  },
  bottomControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  leftTools: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  smallIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  smallIconBtnActive: {
    backgroundColor: 'rgba(200, 90, 50, 0.14)',
    borderColor: 'rgba(200, 90, 50, 0.35)',
  },
  controlGlyph: {
    fontSize: 10,
    letterSpacing: 1.0,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  sendAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendActionActive: {
    backgroundColor: Colors.terracotta,
  },
  sendActionDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
});
