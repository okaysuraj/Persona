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
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, BorderRadius, Spacing } from '../../src/constants/theme';
import { ChatBubble } from '../../src/components/chat/ChatBubble';
import { ChatInput } from '../../src/components/chat/ChatInput';
import { useCompanionStore } from '../../src/store/companionStore';
import { getAvatarSource } from '../../src/utils/avatar';

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
      {/* Top Navigation Bar Matching Web App Companion Bar */}
      <View style={styles.topBar}>
        <View style={styles.leftNavGroup}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(tabs)')}
            style={styles.backButton}
          >
            <Feather name="chevron-left" size={18} color={Colors.text} />
            <Text style={styles.backButtonText}>Companions</Text>
          </TouchableOpacity>

          {activePersona && (
            <View style={styles.companionIdentity}>
              <View style={styles.avatarWrapper}>
                <Image
                  source={getAvatarSource(activePersona.avatar_url)}
                  style={styles.topAvatar}
                />
                <View style={styles.onlineDot} />
              </View>
              <View>
                <Text style={styles.topName}>{activePersona.name}</Text>
                <Text style={styles.topStatus}>
                  {isStreaming ? 'Reflecting...' : 'Present'}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Action Triggers: Vault & Voice */}
        <View style={styles.rightActionsGroup}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.headerActionBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(tabs)/memory');
            }}
          >
            <Feather name="book-open" size={15} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.headerActionBtn, styles.voiceActionBtn]}
            onPress={() => {
              if (activePersona) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push(`/call/${activePersona.id}`);
              }
            }}
          >
            <Feather name="phone-call" size={14} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Spacious Literary Messages Area */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 && activePersona && (
          <View style={styles.emptyDialogue}>
            <Image
              source={getAvatarSource(activePersona.avatar_url)}
              style={styles.emptyAvatar}
            />
            <Text style={styles.emptyName}>{activePersona.name}</Text>
            <Text style={styles.emptyTagline}>{activePersona.tagline}</Text>
            <Text style={styles.emptyHint}>
              Speak freely. This room is private, continuous, and built for unhurried thought.
            </Text>
          </View>
        )}

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
            <ActivityIndicator size="small" color={Colors.terracotta} />
            <Text style={styles.quietThinkingText}>
              {activeStreamingThought
                ? activeStreamingThought
                : `${activePersona?.name || 'Companion'} is reflecting...`}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Composer */}
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
    backgroundColor: Colors.background, // #121211
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: 52,
    paddingBottom: 10,
    backgroundColor: '#161514',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  leftNavGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingRight: 6,
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 2,
  },
  companionIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarWrapper: {
    position: 'relative',
  },
  topAvatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
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
    borderColor: '#161514',
  },
  topName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  topStatus: {
    fontSize: 10,
    color: Colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  rightActionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerActionBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceActionBtn: {
    backgroundColor: Colors.terracotta,
    borderColor: Colors.terracotta,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  emptyDialogue: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyAvatar: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  emptyName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  emptyTagline: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyHint: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 18,
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
