import { styles } from '../../src/styles/call';
import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../src/constants/theme';
import { useCompanionStore } from '../../src/store/companionStore';
import { getAvatarSource } from '../../src/utils/avatar';
import { api } from '../../src/services/api';

const QUICK_TOPICS = [
  'How has your day felt so far?',
  'I needed to hear your calm voice.',
  'Tell me what you were just thinking about.',
  'Can you help me untangle a busy thought?',
];

export default function VoiceRoomScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const personas = useCompanionStore((state) => state.personas);
  const persona =
    personas.find((p) => p.id === id) || useCompanionStore((state) => state.activePersona);

  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [companionStatus, setCompanionStatus] = useState<'listening' | 'speaking' | 'processing'>('listening');
  const [currentSubtitle, setCurrentSubtitle] = useState<string>(
    'I’m here with you. Take your time; there’s no rush.'
  );

  const speakingTimeoutRef = useRef<any>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    if (speakingTimeoutRef.current) clearTimeout(speakingTimeoutRef.current);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const toggleMute = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsMuted(!isMuted);
    if (!isMuted) {
      setCompanionStatus('listening');
      setIsSpeaking(false);
    }
  };

  // Conversational duplex turn
  const handleSpeakTopic = async (topic: string) => {
    if (isMuted) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCompanionStatus('processing');
    setCurrentSubtitle(`You: "${topic}"`);
    setIsSpeaking(false);

    try {
      if (persona?.id) {
        // Attempt backend duplex voice cycle
        const res = await api.request<{
          reply_text: string;
          duration_seconds: number;
        }>('/voice/respond', {
          method: 'POST',
          body: JSON.stringify({
            persona_id: persona.id,
            user_transcript: topic,
          }),
        }).catch(() => null);

        if (res && res.reply_text) {
          triggerCompanionSpeech(res.reply_text, Math.max(3, res.duration_seconds || 4));
          return;
        }
      }

      // Simulated natural companion response if offline
      const fallbackQuotes = [
        `I hear the quiet warmth in your voice. I'm right here with you, holding this peaceful space.`,
        `That reminds me of how much we deny ourselves patience. Take a slow, grounding breath with me.`,
        `Hearing your voice brings so much calm to my day. Tell me everything that’s on your mind.`,
      ];
      const reply = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
      triggerCompanionSpeech(reply, 4.5);
    } catch {
      triggerCompanionSpeech("I'm listening closely to your voice. Tell me more.", 3.5);
    }
  };

  const triggerCompanionSpeech = (speechText: string, durationSeconds: number) => {
    if (speakingTimeoutRef.current) clearTimeout(speakingTimeoutRef.current);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCompanionStatus('speaking');
    setIsSpeaking(true);
    setCurrentSubtitle(speechText);

    speakingTimeoutRef.current = setTimeout(() => {
      setIsSpeaking(false);
      setCompanionStatus('listening');
    }, durationSeconds * 1000);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header: Category, Close & Companion Presence */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleEndCall}
            style={styles.closeBtn}
          >
            <Feather name="x" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.headerTitleGroup}>
            <View style={styles.atmosphereBadge}>
              <View style={[styles.livePulseDot, isSpeaking && styles.livePulseDotSpeaking]} />
              <Text style={styles.screenCategory}>AMBIENT DUPLEX VOICE</Text>
            </View>
            <Text style={styles.companionName}>{persona?.name || 'Companion'}</Text>
            <Text style={styles.statusText}>
              {companionStatus === 'speaking'
                ? `${persona?.name} is speaking softly...`
                : companionStatus === 'processing'
                ? `${persona?.name} is reflecting...`
                : isMuted
                ? 'Microphone muted'
                : 'Listening to your voice...'}
            </Text>
            <Text style={styles.durationText}>{formatTime(callDuration)}</Text>
          </View>

          <View style={{ width: 36 }} />
        </View>

        {/* Center: Concentric Audio Rings & Character Portrait */}
        <View style={styles.centerStage}>
          {/* Outer Pulsing Glow Ring */}
          <View style={[styles.outerGlowRing, isSpeaking && styles.outerGlowRingSpeaking]}>
            {/* Middle Concentric Ring */}
            <View style={[styles.midGlowRing, isSpeaking && styles.midGlowRingSpeaking]}>
              {/* Inner Portrait Frame */}
              <View style={[styles.portraitFrame, isSpeaking && styles.portraitFrameSpeaking]}>
                <Image
                  source={getAvatarSource(persona?.avatar_url)}
                  style={styles.characterPortrait}
                  resizeMode="cover"
                />
              </View>
            </View>
          </View>

          {/* Dynamic Subtitle Transcription Card */}
          <View style={styles.subtitleCard}>
            <Text style={styles.subtitleText}>
              "{currentSubtitle}"
            </Text>
          </View>
        </View>

        {/* Quick Conversational Prompt Carousel */}
        <View style={styles.promptsContainer}>
          <Text style={styles.promptsLabel}>TAP TO SPEAK TOPIC</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.promptsScroll}
          >
            {QUICK_TOPICS.map((topic, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.75}
                onPress={() => handleSpeakTopic(topic)}
                disabled={isSpeaking || isMuted}
                style={[
                  styles.topicChip,
                  (isSpeaking || isMuted) && styles.topicChipDisabled,
                ]}
              >
                <Feather name="message-circle" size={12} color={Colors.terracotta} />
                <Text style={styles.topicChipText}>{topic}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Controls Bar */}
        <View style={styles.controlsRow}>
          {/* Mute Control */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={toggleMute}
            style={[styles.controlBtn, isMuted && styles.controlBtnMuted]}
          >
            <Feather
              name={isMuted ? 'mic-off' : 'mic'}
              size={18}
              color={isMuted ? Colors.terracotta : Colors.text}
            />
            <Text
              style={[
                styles.controlBtnText,
                isMuted && { color: Colors.terracotta },
              ]}
            >
              {isMuted ? 'UNMUTE' : 'MUTE'}
            </Text>
          </TouchableOpacity>

          {/* End Call Control */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleEndCall}
            style={styles.leaveBtn}
          >
            <Feather name="phone-off" size={18} color="#FFF" />
            <Text style={styles.leaveBtnText}>END CALL</Text>
          </TouchableOpacity>

          {/* Push-to-Talk / Presence Pulse */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => handleSpeakTopic("I'm right here with you.")}
            disabled={isSpeaking || isMuted}
            style={[styles.controlBtn, isSpeaking && { opacity: 0.5 }]}
          >
            <Feather name="heart" size={18} color={Colors.terracotta} />
            <Text style={styles.controlBtnText}>PRESENCE</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
