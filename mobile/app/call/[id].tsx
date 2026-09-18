import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors, BorderRadius, Spacing, Typography } from '../../src/constants/theme';
import { useCompanionStore } from '../../src/store/companionStore';

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
    }, 5000);
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
        {/* Top Header: Character Presence & Timer */}
        <View style={styles.header}>
          <Text style={styles.screenCategory}>VOICE ATMOSPHERE</Text>
          <Text style={styles.companionName}>{persona?.name || 'Companion'}</Text>
          <Text style={styles.statusText}>
            {companionStatus === 'speaking'
              ? `${persona?.name} is speaking...`
              : companionStatus === 'listening'
              ? 'Listening to you...'
              : 'Connected in quiet presence'}
          </Text>
          <Text style={styles.durationText}>{formatTime(callDuration)}</Text>
        </View>

        {/* Center: Character Portrait as the Visual Star */}
        <View style={styles.centerStage}>
          <View style={[styles.portraitFrame, isSpeaking && styles.portraitFrameSpeaking]}>
            {persona?.avatar_url ? (
              <Image
                source={{ uri: persona.avatar_url }}
                style={styles.characterPortrait}
                resizeMode="cover"
              />
            ) : null}
          </View>
          <Text style={styles.subText}>
            {isSpeaking
              ? 'Speaking naturally...'
              : isMuted
              ? 'Microphone muted'
              : 'Listening attentively...'}
          </Text>
        </View>

        {/* Understated Tactile Controls */}
        <View style={styles.controlsRow}>
          {/* Mute Control */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={toggleMute}
            style={[styles.controlBtn, isMuted && styles.controlBtnMuted]}
          >
            <Text style={styles.controlBtnText}>{isMuted ? 'UNMUTE' : 'MUTE'}</Text>
          </TouchableOpacity>

          {/* End / Leave Control */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleEndCall}
            style={styles.leaveBtn}
          >
            <Text style={styles.leaveBtnText}>LEAVE</Text>
          </TouchableOpacity>

          {/* Speaker Control */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            style={styles.controlBtn}
          >
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
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: 24,
  },
  screenCategory: {
    fontSize: Typography.metadata,
    letterSpacing: 2.2,
    color: Colors.textMuted,
    fontWeight: '600',
    marginBottom: 6,
  },
  companionName: {
    fontSize: Typography.characterName, // 32px
    fontWeight: '400',
    color: Colors.text,
    letterSpacing: 0.5,
  },
  statusText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  durationText: {
    color: Colors.textMuted,
    fontSize: 13,
    letterSpacing: 1.5,
    marginTop: 12,
    fontVariant: ['tabular-nums'],
  },
  centerStage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  portraitFrame: {
    width: 210,
    height: 210,
    borderRadius: 105,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    backgroundColor: Colors.surface,
  },
  portraitFrameSpeaking: {
    borderColor: Colors.forestGreen,
  },
  characterPortrait: {
    width: '100%',
    height: '100%',
  },
  subText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 24,
    letterSpacing: 0.3,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  controlBtn: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlBtnMuted: {
    backgroundColor: 'rgba(90, 44, 42, 0.25)',
    borderColor: Colors.burgundy,
  },
  controlBtnText: {
    fontSize: 11,
    letterSpacing: 1.8,
    color: Colors.text,
    fontWeight: '600',
  },
  leaveBtn: {
    flex: 1.2,
    paddingVertical: 14,
    backgroundColor: Colors.burgundy,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaveBtnText: {
    fontSize: 11,
    letterSpacing: 1.8,
    color: Colors.text,
    fontWeight: '700',
  },
});
