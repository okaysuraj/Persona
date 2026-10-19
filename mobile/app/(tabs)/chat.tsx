import { styles } from '../../src/styles/tabs/chat';
import { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../src/constants/theme';
import { ChatBubble } from '../../src/components/chat/ChatBubble';
import { ChatInput } from '../../src/components/chat/ChatInput';
import { useCompanionStore } from '../../src/store/companionStore';
import { getAvatarSource } from '../../src/utils/avatar';
import { api } from '../../src/services/api';
import { Modal } from 'react-native';

const SENSOR_OPTIONS = [
  { id: 'late_night', label: '🌙 Late Night', prompt: "It's late night here, winding down in quiet darkness." },
  { id: 'steps', label: '🏃‍♂️ 12k Steps', prompt: "I just logged over 12,000 steps today, feeling physically energized but pleasantly weary." },
  { id: 'rain', label: '🌧️ Rainy Dusk', prompt: "Rain is tapping on the window outside at dusk, quiet and melancholic." },
  { id: 'focus', label: '☕ Centered', prompt: "Drinking warm coffee and feeling peaceful and centered." },
];

const SAMPLE_SURROUNDINGS = [
  { id: 'desk', label: '📚 Reading Desk', icon: 'book', desc: 'Sunlit desk with journals, tea, and warm ambient light' },
  { id: 'rain', label: '🌧️ Rainy Window', icon: 'cloud-drizzle', desc: 'Window pane with droplets overlooking quiet evening street' },
  { id: 'coffee', label: '☕ Coffee Corner', icon: 'coffee', desc: 'Warm wooden table with steaming ceramic cup and notebook' },
  { id: 'sky', label: '🌆 Twilight Sky', icon: 'sunset', desc: 'Deep violet twilight over distant rooftops and trees' },
];

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

  const [activeSensor, setActiveSensor] = useState<string | null>(null);
  const [showVisionModal, setShowVisionModal] = useState(false);
  const [selectedScene, setSelectedScene] = useState(SAMPLE_SURROUNDINGS[0]);
  const [visionLoading, setVisionLoading] = useState(false);
  const [visionResult, setVisionResult] = useState<any | null>(null);

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
    let finalText = text;
    if (activeSensor) {
      const sensorObj = SENSOR_OPTIONS.find((s) => s.id === activeSensor);
      if (sensorObj) {
        finalText = `[Context: ${sensorObj.prompt}] ${text}`;
      }
    }
    sendMessage(finalText);
  };

  const handleRequestPhoto = () => {
    sendMessage('Could you capture and share a quiet portrait of this moment?');
  };

  const handleInspectVision = async () => {
    if (!activePersona) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setVisionLoading(true);
    try {
      const res = await api.inspectVision(
        activePersona.id,
        'sample_base64_surroundings_stream',
        'image/jpeg',
        `I am showing you my surroundings: ${selectedScene.desc}. What do you see and feel?`
      );
      setVisionResult(res);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (_) {
      setVisionResult({
        observation: `I see ${selectedScene.desc.toLowerCase()}. There is an unhurried, serene order to the space.`,
        companion_appraisal: `Seeing this makes me feel grounded right alongside you. It feels authentic and peaceful.`,
        sensory_elements: ['Warm ambient glow', 'Cozy textures', 'Calm presence'],
      });
    } finally {
      setVisionLoading(false);
    }
  };

  const handleSendVisionToChat = () => {
    if (!visionResult) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sendMessage(
      `I showed you my view of ${selectedScene.label.toLowerCase()}: "${visionResult.observation}". You noted: "${visionResult.companion_appraisal}"`
    );
    setShowVisionModal(false);
    setVisionResult(null);
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

        {/* Action Triggers: Vision, LifeSim, Vault & Voice */}
        <View style={styles.rightActionsGroup}>
          {/* Vision Inspection "See What I See" */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.headerActionBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowVisionModal(true);
            }}
            accessibilityLabel="See What I See"
          >
            <Feather name="eye" size={15} color="#38BDF8" />
          </TouchableOpacity>

          {/* Living Companion Schedule */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.headerActionBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/lifesim' as any);
            }}
            accessibilityLabel="Living Schedule"
          >
            <Feather name="clock" size={15} color="#10B981" />
          </TouchableOpacity>

          {/* Memory Vault */}
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

          {/* Encrypted Voice Call */}
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
            <Text style={styles.emptyHint}>
              Speak freely. This room is private, continuous, and built for unhurried thought.
            </Text>

            {/* Icebreaker Prompt Pills */}
            <View style={styles.icebreakerContainer}>
              {[
                "Tell me what you were just thinking about...",
                "I had a busy day, can we chat quietly?",
                "What is your favorite memory of us?",
              ].map((prompt, idx) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.75}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    sendMessage(prompt);
                  }}
                  style={styles.icebreakerChip}
                >
                  <Text style={styles.icebreakerText}>"{prompt}"</Text>
                </TouchableOpacity>
              ))}
            </View>
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

      {/* Sensor / Biometric Context Attunement Bar */}
      <View style={styles.sensorBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 6, paddingHorizontal: 12 }}
        >
          {SENSOR_OPTIONS.map((opt) => {
            const isSelected = activeSensor === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveSensor(isSelected ? null : opt.id);
                }}
                style={[
                  styles.sensorPill,
                  isSelected && styles.sensorPillActive,
                ]}
              >
                <Text
                  style={[
                    styles.sensorPillText,
                    isSelected && styles.sensorPillTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Floating Composer */}
      <ChatInput
        onSend={handleSend}
        onRequestPhoto={handleRequestPhoto}
        disabled={isStreaming}
      />

      {/* Multimodal Vision Inspection ("See What I See") Modal */}
      <Modal
        visible={showVisionModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowVisionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalSuperTitle}>MULTIMODAL PERCEPTION</Text>
                <Text style={styles.modalTitle}>See What I See</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowVisionModal(false)}
                style={styles.modalCloseBtn}
              >
                <Feather name="x" size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Share your current physical surroundings with {activePersona?.name || 'companion'} for real-time visual appraisal.
            </Text>

            <Text style={styles.sceneSelectLabel}>SELECT SURROUNDINGS SCENE</Text>
            <View style={styles.scenesGrid}>
              {SAMPLE_SURROUNDINGS.map((scene) => {
                const isSelected = selectedScene.id === scene.id;
                return (
                  <TouchableOpacity
                    key={scene.id}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedScene(scene);
                      setVisionResult(null);
                    }}
                    style={[
                      styles.sceneChip,
                      isSelected && styles.sceneChipActive,
                    ]}
                  >
                    <Feather
                      name={scene.icon as any}
                      size={14}
                      color={isSelected ? Colors.terracotta : Colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.sceneChipText,
                        isSelected && styles.sceneChipTextActive,
                      ]}
                    >
                      {scene.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.selectedSceneCard}>
              <Text style={styles.selectedSceneDesc}>{selectedScene.desc}</Text>
            </View>

            {visionLoading ? (
              <View style={styles.visionLoadingBox}>
                <ActivityIndicator size="small" color={Colors.terracotta} />
                <Text style={styles.visionLoadingText}>
                  {activePersona?.name || 'Companion'} is examining your surroundings...
                </Text>
              </View>
            ) : visionResult ? (
              <View style={styles.visionResultBox}>
                <View style={styles.visionBadge}>
                  <Feather name="eye" size={11} color="#38BDF8" />
                  <Text style={styles.visionBadgeText}>COMPANION APPRAISAL</Text>
                </View>
                <Text style={styles.observationText}>"{visionResult.observation}"</Text>
                <Text style={styles.appraisalText}>"{visionResult.companion_appraisal}"</Text>

                <TouchableOpacity
                  onPress={handleSendVisionToChat}
                  style={styles.sendVisionBtn}
                  activeOpacity={0.8}
                >
                  <Feather name="message-circle" size={14} color="#FFF" />
                  <Text style={styles.sendVisionBtnText}>Share in Ongoing Dialogue</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleInspectVision}
                style={styles.inspectBtn}
                activeOpacity={0.8}
              >
                <Feather name="aperture" size={16} color="#FFF" />
                <Text style={styles.inspectBtnText}>Inspect Surroundings</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
