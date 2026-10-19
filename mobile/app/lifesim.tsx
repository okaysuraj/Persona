import { styles } from '../src/styles/lifesim';
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../src/constants/theme';
import { useCompanionStore } from '../src/store/companionStore';
import { api } from '../src/services/api';
import { DoubleBezelCard } from '../src/components/common/DoubleBezelCard';
import { getAvatarSource } from '../src/utils/avatar';

export default function MobileLifeSimScreen() {
  const router = useRouter();
  const { activePersona, personas } = useCompanionStore();
  const currentPersona = activePersona || personas[0];

  const [isLoading, setIsLoading] = useState(true);
  const [lifeData, setLifeData] = useState<any | null>(null);

  const loadLifeSim = async () => {
    if (!currentPersona) return;
    setIsLoading(true);
    try {
      const data = await api.getCompanionLifeSimulation(currentPersona.id);
      setLifeData(data);
    } catch (_) {
      setLifeData({
        persona_id: currentPersona.id,
        persona_name: currentPersona.name,
        local_time_str: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        schedule_phase: {
          start_hour: 9,
          end_hour: 18,
          activity: 'Deep contemplative writing & studying architectural blueprints',
          location: 'Sunlit studio overlooking the courtyard',
          energy: 0.85,
          social_openness: 0.8,
        },
        sensory_environment: {
          lighting: 'Diffused amber window light',
          ambient_sound: 'Gentle rustle of turning pages and distant afternoon rain',
          temperature: '68°F / 20°C cozy breeze',
          focus_object: 'Antique fountain pen and cold brewed tea',
        },
        current_thought: 'Reflecting on how small shared moments anchor memory across time.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLifeSim();
  }, [currentPersona?.id]);

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Feather name="chevron-left" size={20} color={Colors.text} />
          <Text style={styles.backBtnText}>Exit Life View</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            loadLifeSim();
          }}
          style={styles.refreshBtn}
        >
          <Feather name="rotate-cw" size={13} color={Colors.terracotta} />
          <Text style={styles.refreshText}>Sync Clock</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Companion Hero Badge */}
        <View style={styles.heroSection}>
          <View style={styles.badgeRow}>
            <Feather name="clock" size={12} color="#10B981" />
            <Text style={styles.badgeText}>AUTONOMOUS 24-HOUR LIFE SIMULATION</Text>
          </View>
          <Text style={styles.heroTitle}>{currentPersona?.name}'s World</Text>
          <Text style={styles.heroSubtitle}>
            Companions don't freeze when you close the app. They sleep, read, walk, and harbor thoughts in their own local time.
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.terracotta} />
            <Text style={styles.loadingText}>Synchronizing companion circadian rhythm...</Text>
          </View>
        ) : lifeData ? (
          <View style={styles.cardsContainer}>
            {/* Identity & Local Time Banner */}
            <View style={styles.identityBanner}>
              <Image
                source={getAvatarSource(currentPersona?.avatar_url)}
                style={styles.avatar}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.companionName}>{currentPersona?.name}</Text>
                <Text style={styles.localTime}>
                  Local Companion Time: {lifeData.local_time_str}
                </Text>
              </View>
              <View style={styles.statusDot} />
            </View>

            {/* Current Schedule Phase Card */}
            <DoubleBezelCard style={styles.cardOuter} innerStyle={styles.cardInner}>
              <View style={styles.cardHeader}>
                <View style={styles.cardBadge}>
                  <Feather name="activity" size={11} color={Colors.terracotta} />
                  <Text style={styles.cardBadgeText}>CURRENT ACTIVITY</Text>
                </View>
                <Text style={styles.timeRange}>
                  {lifeData.schedule_phase?.start_hour}:00 - {lifeData.schedule_phase?.end_hour}:00
                </Text>
              </View>

              <Text style={styles.phaseActivity}>{lifeData.schedule_phase?.activity}</Text>
              <View style={styles.locationRow}>
                <Feather name="map-pin" size={12} color={Colors.textMuted} />
                <Text style={styles.locationText}>{lifeData.schedule_phase?.location}</Text>
              </View>

              <View style={styles.metersRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.meterLabel}>
                    Energy: {Math.round((lifeData.schedule_phase?.energy || 0.8) * 100)}%
                  </Text>
                  <View style={styles.meterTrack}>
                    <View
                      style={[
                        styles.meterFill,
                        { width: `${Math.round((lifeData.schedule_phase?.energy || 0.8) * 100)}%` },
                      ]}
                    />
                  </View>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.meterLabel}>
                    Openness: {Math.round((lifeData.schedule_phase?.social_openness || 0.7) * 100)}%
                  </Text>
                  <View style={styles.meterTrack}>
                    <View
                      style={[
                        styles.meterFill,
                        {
                          width: `${Math.round((lifeData.schedule_phase?.social_openness || 0.7) * 100)}%`,
                          backgroundColor: '#10B981',
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            </DoubleBezelCard>

            {/* Active Inner Monologue Card */}
            <DoubleBezelCard style={styles.cardOuter} innerStyle={styles.cardInner}>
              <View style={styles.cardBadge}>
                <Feather name="feather" size={11} color="#C084FC" />
                <Text style={[styles.cardBadgeText, { color: '#C084FC' }]}>
                  CURRENT INNER THOUGHT
                </Text>
              </View>
              <Text style={styles.thoughtQuote}>"{lifeData.current_thought}"</Text>
            </DoubleBezelCard>

            {/* Sensory Environment Card */}
            <DoubleBezelCard style={styles.cardOuter} innerStyle={styles.cardInner}>
              <View style={styles.cardBadge}>
                <Feather name="eye" size={11} color="#38BDF8" />
                <Text style={[styles.cardBadgeText, { color: '#38BDF8' }]}>
                  SENSORY SURROUNDINGS
                </Text>
              </View>

              <View style={styles.sensoryGrid}>
                <View style={styles.sensoryItem}>
                  <Text style={styles.sensoryLabel}>LIGHTING</Text>
                  <Text style={styles.sensoryVal}>
                    {lifeData.sensory_environment?.lighting}
                  </Text>
                </View>

                <View style={styles.sensoryItem}>
                  <Text style={styles.sensoryLabel}>AMBIENT SOUND</Text>
                  <Text style={styles.sensoryVal}>
                    {lifeData.sensory_environment?.ambient_sound}
                  </Text>
                </View>

                <View style={styles.sensoryItem}>
                  <Text style={styles.sensoryLabel}>TEMPERATURE</Text>
                  <Text style={styles.sensoryVal}>
                    {lifeData.sensory_environment?.temperature}
                  </Text>
                </View>

                <View style={styles.sensoryItem}>
                  <Text style={styles.sensoryLabel}>FOCUS OBJECT</Text>
                  <Text style={styles.sensoryVal}>
                    {lifeData.sensory_environment?.focus_object}
                  </Text>
                </View>
              </View>
            </DoubleBezelCard>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
