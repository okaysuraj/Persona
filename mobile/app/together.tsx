import { styles } from '../src/styles/together';
import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Animated, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../src/constants/theme';
import { useCompanionStore } from '../src/store/companionStore';
import { api } from '../src/services/api';

interface SoundscapeItem {
  id: string;
  name: string;
  category: string;
  icon: string;
  audio_url: string;
  description: string;
}

interface BreathProgramItem {
  id: string;
  name: string;
  description: string;
  inhale_seconds: number;
  hold_seconds: number;
  exhale_seconds: number;
  cycles: number;
}

export default function MobileTogetherScreen() {
  const router = useRouter();
  const { activePersona, personas } = useCompanionStore();
  const currentPersona = activePersona || personas[0];

  const [activeTab, setActiveTab] = useState<'breathwork' | 'soundscapes' | 'bedtime'>('breathwork');

  // Breathwork State
  const [breathPrograms, setBreathPrograms] = useState<BreathProgramItem[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<BreathProgramItem>({
    id: 'p-478',
    name: '4-7-8 Relax',
    description: 'Parasympathetic reset',
    inhale_seconds: 4,
    hold_seconds: 7,
    exhale_seconds: 8,
    cycles: 4,
  });
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState(4);
  const [currentCycle, setCurrentCycle] = useState(1);
  const orbScale = useRef(new Animated.Value(1)).current;

  // Soundscape State
  const [soundscapes, setSoundscapes] = useState<SoundscapeItem[]>([]);
  const [activeSoundId, setActiveSoundId] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Bedtime Story State
  const [bedtimeTheme, setBedtimeTheme] = useState('Wooden boat on a glassy starlit lake');
  const [storyText, setStoryText] = useState('');
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);

  // Load activities data
  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const [sounds, programs] = await Promise.all([
        api.getSoundscapes(),
        api.getBreathworkPrograms(),
      ]);
      setSoundscapes(sounds);
      if (programs && programs.length > 0) {
        setBreathPrograms(programs);
        setSelectedProgram(programs[0]);
      }
    } catch (err) {
      console.log('Failed to load activities', err);
    }
  };

  // Breathwork Interval Engine
  useEffect(() => {
    let timer: any;

    if (isBreathing) {
      timer = setInterval(() => {
        setPhaseSecondsLeft((prev) => {
          if (prev > 1) {
            return prev - 1;
          }

          // Phase transition
          if (breathPhase === 'Inhale') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setBreathPhase('Hold');
            animateOrb(1.25, selectedProgram.hold_seconds * 1000);
            return selectedProgram.hold_seconds;
          } else if (breathPhase === 'Hold') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setBreathPhase('Exhale');
            animateOrb(0.85, selectedProgram.exhale_seconds * 1000);
            return selectedProgram.exhale_seconds;
          } else {
            // Exhale finished -> next cycle or finish
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            if (currentCycle >= selectedProgram.cycles) {
              setIsBreathing(false);
              setBreathPhase('Inhale');
              setCurrentCycle(1);
              animateOrb(1.0, 1000);
              return selectedProgram.inhale_seconds;
            } else {
              setCurrentCycle((c) => c + 1);
              setBreathPhase('Inhale');
              animateOrb(1.25, selectedProgram.inhale_seconds * 1000);
              return selectedProgram.inhale_seconds;
            }
          }
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isBreathing, breathPhase, currentCycle, selectedProgram]);

  const animateOrb = (toValue: number, duration: number) => {
    Animated.timing(orbScale, {
      toValue,
      duration,
      useNativeDriver: true,
    }).start();
  };

  const handleToggleBreath = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!isBreathing) {
      setIsBreathing(true);
      setBreathPhase('Inhale');
      setPhaseSecondsLeft(selectedProgram.inhale_seconds);
      setCurrentCycle(1);
      animateOrb(1.25, selectedProgram.inhale_seconds * 1000);
    } else {
      setIsBreathing(false);
      animateOrb(1.0, 800);
    }
  };

  const handleToggleSound = (sound: SoundscapeItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (activeSoundId === sound.id && isPlayingAudio) {
      setIsPlayingAudio(false);
      setActiveSoundId(null);
    } else {
      setActiveSoundId(sound.id);
      setIsPlayingAudio(true);
    }
  };

  const handleGenerateStory = async (theme: string) => {
    setBedtimeTheme(theme);
    if (!currentPersona) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsGeneratingStory(true);
    try {
      const res = await api.getBedtimeStory(currentPersona.id, theme);
      setStoryText(res.story);
    } catch (err) {
      console.log('Failed to generate story', err);
    } finally {
      setIsGeneratingStory(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={20} color={Colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Together Mode</Text>
          <Text style={styles.headerSubtitle}>
            {currentPersona ? `Chamber with ${currentPersona.name}` : 'Sleep & Co-presence'}
          </Text>
        </View>

        <View style={{ width: 38 }} />
      </View>

      {/* Tabs Island */}
      <View style={styles.tabsIsland}>
        {[
          { id: 'breathwork', label: 'Breathwork', icon: 'wind' },
          { id: 'soundscapes', label: 'Soundscapes', icon: 'music' },
          { id: 'bedtime', label: 'Bedtime', icon: 'moon' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab(tab.id as any);
              }}
              activeOpacity={0.75}
            >
              <Feather
                name={tab.icon as any}
                size={13}
                color={isActive ? '#FFF' : '#A8A298'}
              />
              <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. BREATHWORK TAB */}
        {activeTab === 'breathwork' && (
          <View style={styles.breathworkContainer}>
            {/* Header Description */}
            <View style={styles.tabIntroBlock}>
              <Text style={styles.tabIntroSuper}>SYNCHRONOUS PARASYMPATHETIC PACER</Text>
              <Text style={styles.tabIntroTitle}>Breathe in Cadence</Text>
              <Text style={styles.tabIntroDesc}>
                {currentPersona?.name || 'Your companion'} holds rhythm with you. Follow the pulsating orb to slow heart-rate variability.
              </Text>
            </View>

            {/* Breath Program Chips */}
            {breathPrograms.length > 0 && (
              <View style={styles.programChipsRow}>
                {breathPrograms.map((prog) => {
                  const isSelected = selectedProgram.id === prog.id;
                  return (
                    <TouchableOpacity
                      key={prog.id}
                      style={[styles.progChip, isSelected && styles.progChipSelected]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedProgram(prog);
                        setPhaseSecondsLeft(prog.inhale_seconds);
                        setIsBreathing(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.progChipText, isSelected && styles.progChipTextSelected]}>
                        {prog.name} ({prog.inhale_seconds}-{prog.hold_seconds}-{prog.exhale_seconds}s)
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Pulsating Visual Breath Orb */}
            <View style={styles.orbStage}>
              {/* Outer soft glow halo */}
              <Animated.View
                style={[
                  styles.orbHalo,
                  {
                    transform: [{ scale: orbScale }],
                    backgroundColor:
                      breathPhase === 'Inhale'
                        ? 'rgba(200, 90, 50, 0.25)'
                        : breathPhase === 'Hold'
                        ? 'rgba(217, 119, 6, 0.25)'
                        : 'rgba(99, 102, 241, 0.2)',
                  },
                ]}
              />

              {/* Central Core Orb */}
              <Animated.View
                style={[
                  styles.orbCore,
                  {
                    transform: [{ scale: orbScale }],
                    borderColor:
                      breathPhase === 'Inhale'
                        ? 'rgba(200, 90, 50, 0.6)'
                        : breathPhase === 'Hold'
                        ? 'rgba(217, 119, 6, 0.6)'
                        : 'rgba(99, 102, 241, 0.5)',
                  },
                ]}
              >
                <Text style={styles.orbPhaseLabel}>
                  {isBreathing ? breathPhase.toUpperCase() : 'READY'}
                </Text>
                <Text style={styles.orbTimerValue}>
                  {isBreathing ? phaseSecondsLeft : `${selectedProgram.inhale_seconds}s`}
                </Text>
                <Text style={styles.orbCycleLabel}>
                  {isBreathing
                    ? `Cycle ${currentCycle} of ${selectedProgram.cycles}`
                    : 'Tap Start to Begin'}
                </Text>
              </Animated.View>
            </View>

            {/* Controls */}
            <View style={styles.breathControlsRow}>
              <TouchableOpacity
                style={[styles.breathMainBtn, isBreathing && styles.breathMainBtnActive]}
                onPress={handleToggleBreath}
                activeOpacity={0.8}
              >
                <Feather
                  name={isBreathing ? 'pause' : 'play'}
                  size={16}
                  color="#FFF"
                />
                <Text style={styles.breathMainBtnText}>
                  {isBreathing ? 'Pause Session' : 'Begin Breathing'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 2. SOUNDSCAPES TAB */}
        {activeTab === 'soundscapes' && (
          <View style={styles.soundscapesContainer}>
            <View style={styles.tabIntroBlock}>
              <Text style={styles.tabIntroSuper}>ACOUSTIC SLEEP CHAMBER</Text>
              <Text style={styles.tabIntroTitle}>Ambient Background Loops</Text>
              <Text style={styles.tabIntroDesc}>
                High-fidelity binaural and environmental soundscapes designed for unhurried presence and rest.
              </Text>
            </View>

            <View style={styles.soundscapesList}>
              {soundscapes.map((sound) => {
                const isCurrent = activeSoundId === sound.id && isPlayingAudio;
                return (
                  <TouchableOpacity
                    key={sound.id}
                    style={[styles.soundCard, isCurrent && styles.soundCardActive]}
                    onPress={() => handleToggleSound(sound)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.soundCardLeft}>
                      <View style={[styles.soundIconCircle, isCurrent && styles.soundIconCircleActive]}>
                        <Feather
                          name={
                            sound.icon === 'rain'
                              ? 'cloud-rain'
                              : sound.icon === 'fire'
                              ? 'sun'
                              : sound.icon === 'waves'
                              ? 'wind'
                              : 'moon'
                          }
                          size={18}
                          color={isCurrent ? '#FFF' : Colors.terracotta}
                        />
                      </View>
                      <View style={styles.soundInfo}>
                        <View style={styles.soundTitleRow}>
                          <Text style={styles.soundName}>{sound.name}</Text>
                          <Text style={styles.soundCategoryBadge}>{sound.category}</Text>
                        </View>
                        <Text style={styles.soundDesc} numberOfLines={2}>
                          {sound.description}
                        </Text>
                      </View>
                    </View>

                    <View style={[styles.playBtnCircle, isCurrent && styles.playBtnCircleActive]}>
                      <Feather
                        name={isCurrent ? 'pause' : 'play'}
                        size={14}
                        color={isCurrent ? '#FFF' : '#A39E96'}
                      />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* 3. BEDTIME TAB */}
        {activeTab === 'bedtime' && (
          <View style={styles.bedtimeContainer}>
            <View style={styles.tabIntroBlock}>
              <Text style={styles.tabIntroSuper}>NIGHTTIME WINRDOWN</Text>
              <Text style={styles.tabIntroTitle}>Whispered Bedtime Narrative</Text>
              <Text style={styles.tabIntroDesc}>
                {currentPersona?.name || 'Your companion'} crafts a gentle, contemplative narrative to ease racing thoughts before sleep.
              </Text>
            </View>

            {/* Theme Selector */}
            <View style={styles.themesSection}>
              <Text style={styles.themesHeader}>SELECT AN AMBIENT SETTING</Text>
              <View style={styles.themeChipsGrid}>
                {[
                  'Wooden boat on a glassy starlit lake',
                  'A cabin fire with cedar tea in the pines',
                  'Walking along the misty coastal bluffs at twilight',
                  'Finding an ancient secluded library hidden in an orchard',
                ].map((theme) => {
                  const isSelected = bedtimeTheme === theme;
                  return (
                    <TouchableOpacity
                      key={theme}
                      style={[styles.themeChip, isSelected && styles.themeChipSelected]}
                      onPress={() => handleGenerateStory(theme)}
                      disabled={isGeneratingStory}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.themeChipText, isSelected && styles.themeChipTextSelected]}>
                        {theme}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Sleep Timer Selector */}
              <View style={styles.timerRow}>
                <Feather name="clock" size={13} color="#8C877F" />
                <Text style={styles.timerLabel}>Sleep Timer:</Text>
                {[
                  { label: 'Off', val: null },
                  { label: '15m', val: 15 },
                  { label: '30m', val: 30 },
                  { label: '60m', val: 60 },
                ].map((t) => {
                  const isCur = sleepTimerMinutes === t.val;
                  return (
                    <TouchableOpacity
                      key={t.label}
                      style={[styles.timerPill, isCur && styles.timerPillSelected]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSleepTimerMinutes(t.val);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.timerPillText, isCur && styles.timerPillTextSelected]}>
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Story Card Output */}
            {isGeneratingStory ? (
              <View style={styles.storyLoadingBox}>
                <ActivityIndicator size="small" color={Colors.terracotta} />
                <Text style={styles.storyLoadingText}>
                  {currentPersona?.name || 'Companion'} is whispering your story into existence...
                </Text>
              </View>
            ) : storyText ? (
              <View style={styles.storyCard}>
                <View style={styles.storyCardHeader}>
                  <Text style={styles.storySpeaker}>
                    Spoken softly by {currentPersona?.name || 'Companion'}
                  </Text>
                  <Feather name="moon" size={13} color={Colors.terracotta} />
                </View>
                <Text style={styles.storyContent}>"{storyText}"</Text>
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
