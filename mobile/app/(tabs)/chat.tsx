import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors, BorderRadius, Spacing, Typography } from '../../src/constants/theme';
import { ChatBubble } from '../../src/components/chat/ChatBubble';
import { ChatInput } from '../../src/components/chat/ChatInput';
import { useCompanionStore } from '../../src/store/companionStore';

export default function DialogueChamberScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const {
    activePersona,
    messages,
    sendMessage,
    isStreaming,
    activeStreamingThought,
    fetchMessages,
  } = useCompanionStore();

  useEffect(() => {
    if (activePersona) {
      fetchMessages(activePersona.id);
    }
  }, [activePersona?.id]);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages.length, isStreaming]);

  const handleSend = (text: string) => {
    sendMessage(text);
  };

  const handleRequestPhoto = () => {
    sendMessage('Could you capture and share a quiet portrait of this moment?');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      style={styles.container}
    >
      {/* Restrained Atmospheric Top Bar */}
      <View style={styles.topBar}>
        {activePersona && (
          <View style={styles.companionInfo}>
            <Image source={{ uri: activePersona.avatar_url }} style={styles.topAvatar} />
            <View>
              <Text style={styles.topName}>{activePersona.name}</Text>
              <Text style={styles.topStatus}>
                {isStreaming ? 'Reflecting...' : 'Present'}
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.voiceTrigger}
          onPress={() => {
            if (activePersona) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push(`/call/${activePersona.id}`);
            }
          }}
        >
          <Text style={styles.voiceTriggerText}>VOICE</Text>
        </TouchableOpacity>
      </View>

      {/* Spacious Literary Messages Area */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg}
            companionAvatar={activePersona?.avatar_url}
            companionName={activePersona?.name}
          />
        ))}

        {/* Quiet Reflection Status */}
        {isStreaming && (
          <View style={styles.quietThinkingRow}>
            <ActivityIndicator size="small" color={Colors.textMuted} />
            <Text style={styles.quietThinkingText}>
              {activeStreamingThought
                ? activeStreamingThought
                : `${activePersona?.name || 'Companion'} is reflecting...`}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Glass Composer */}
      <ChatInput
        onSend={handleSend}
        onRequestPhoto={handleRequestPhoto}
        disabled={isStreaming}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: 54,
    paddingBottom: Spacing.sm,
    backgroundColor: 'rgba(13, 16, 14, 0.94)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  companionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topAvatar: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  topName: {
    fontSize: 17,
    fontWeight: '500',
    color: Colors.text,
    letterSpacing: 0.3,
  },
  topStatus: {
    fontSize: 10,
    color: Colors.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 1,
  },
  voiceTrigger: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  voiceTriggerText: {
    fontSize: 10,
    color: Colors.textSecondary,
    letterSpacing: 1.8,
    fontWeight: '600',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  quietThinkingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  quietThinkingText: {
    marginLeft: 10,
    fontSize: 13,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
});
