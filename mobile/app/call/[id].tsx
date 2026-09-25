import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, BorderRadius, Spacing } from '../../src/constants/theme';
import { useCompanionStore } from '../../src/store/companionStore';
import { getAvatarSource } from '../../src/utils/avatar';

export default function VoiceRoomScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const personas = useCompanionStore((state) => state.personas);
  const persona =
    personas.find((p) => p.id === id) || useCompanionStore((state) => state.activePersona);

  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [companionStatus, setCompanionStatus] = useState<'listening' | 'speaking' | 'connected'>(
    'connected'
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const speakingCycle = setInterval(() => {
      setIsSpeaking((prev) => !prev);
      setCompanionStatus((prev) => (prev === 'listening' ? 'speaking' : 'listening'));
    }, 4500);
    return () => clearInterval(speakingCycle);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const toggleMute = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsMuted(!isMuted);
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
              <View style={styles.livePulseDot} />
              <Text style={styles.screenCategory}>AMBIENT DUPLEX VOICE</Text>
            </View>
            <Text style={styles.companionName}>{persona?.name || 'Companion'}</Text>
            <Text style={styles.statusText}>
              {companionStatus === 'speaking'
                ? `${persona?.name} is speaking...`
                : companionStatus === 'listening'
                ? 'Listening to your voice...'
                : 'Connected in quiet presence'}
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

          <Text style={styles.subText}>
            {isSpeaking
              ? 'Speaking naturally...'
              : isMuted
              ? 'Microphone muted'
              : 'Listening attentively...'}
          </Text>
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

          {/* Speaker Control */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            style={styles.controlBtn}
          >
            <Feather name="volume-2" size={18} color={Colors.text} />
            <Text style={styles.controlBtnText}>SPEAKER</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background, // #121211
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleGroup: {
    alignItems: 'center',
    flex: 1,
  },
  atmosphereBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    backgroundColor: Colors.terracottaBg,
    marginBottom: 6,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.terracotta,
  },
  screenCategory: {
    fontSize: 9,
    letterSpacing: 1.6,
    color: Colors.terracotta,
    fontWeight: '700',
  },
  companionName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  statusText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  durationText: {
    color: Colors.textMuted,
    fontSize: 13,
    letterSpacing: 1.5,
    marginTop: 8,
    fontVariant: ['tabular-nums'],
  },
  centerStage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerGlowRing: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerGlowRingSpeaking: {
    borderColor: 'rgba(200, 90, 50, 0.25)',
    backgroundColor: 'rgba(200, 90, 50, 0.03)',
  },
  midGlowRing: {
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  midGlowRingSpeaking: {
    borderColor: 'rgba(200, 90, 50, 0.4)',
    backgroundColor: 'rgba(200, 90, 50, 0.06)',
  },
  portraitFrame: {
    width: 170,
    height: 170,
    borderRadius: 85,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: Colors.surface,
  },
  portraitFrameSpeaking: {
    borderColor: Colors.terracotta,
  },
  characterPortrait: {
    width: '100%',
    height: '100%',
  },
  subText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 20,
    letterSpacing: 0.3,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  controlBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#191817',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  controlBtnMuted: {
    backgroundColor: 'rgba(200, 90, 50, 0.15)',
    borderColor: Colors.terracotta,
  },
  controlBtnText: {
    fontSize: 10,
    letterSpacing: 1.4,
    color: Colors.text,
    fontWeight: '700',
  },
  leaveBtn: {
    flex: 1.2,
    paddingVertical: 12,
    backgroundColor: Colors.terracotta,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  leaveBtnText: {
    fontSize: 10,
    letterSpacing: 1.4,
    color: '#FFF',
    fontWeight: '700',
  },
});
