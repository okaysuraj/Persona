import { styles } from '../src/styles/cbt';
import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../src/constants/theme';
import { useCompanionStore } from '../src/store/companionStore';
import { api } from '../src/services/api';
import { DoubleBezelCard } from '../src/components/common/DoubleBezelCard';

const COGNITIVE_DISTORTIONS = [
  'All-or-Nothing Thinking',
  'Catastrophizing',
  'Mind Reading',
  'Overgeneralization',
  'Emotional Reasoning',
  'Should Statements',
  'Discounting Positives',
];

export default function MobileCBTScreen() {
  const router = useRouter();
  const { activePersona, personas } = useCompanionStore();
  const currentPersona = activePersona || personas[0];

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [situation, setSituation] = useState('');
  const [automaticThought, setAutomaticThought] = useState('');
  const [selectedDistortion, setSelectedDistortion] = useState(COGNITIVE_DISTORTIONS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [debriefResult, setDebriefResult] = useState<any | null>(null);

  const handleNext = () => {
    if (step === 1) {
      if (!situation.trim()) {
        Alert.alert('Required', 'Please describe the situation or trigger.');
        return;
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setStep(2);
    } else if (step === 2) {
      if (!automaticThought.trim()) {
        Alert.alert('Required', 'Please share the automatic thought you noticed.');
        return;
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setStep(3);
    }
  };

  const handleExecuteDebrief = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);

    try {
      const res = await api.executeCBTDebrief(
        currentPersona?.id || 'maya',
        situation,
        automaticThought,
        selectedDistortion
      );
      setDebriefResult(res);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (_) {
      setDebriefResult({
        situation,
        automatic_thought: automaticThought,
        detected_distortion: selectedDistortion,
        socratic_reframe:
          'When we examine this without fatigue, is the catastrophic outcome inevitable, or is your nervous system conflating tiredness with personal failure?',
        boundary_affirmation:
          'You are whole independent of today’s checklist. You do not need to earn your rest tonight.',
        evening_grounding_exercise:
          'Place one hand over your chest. Take three deliberate, 4-second breaths. Release the need to solve tomorrow tonight.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setDebriefResult(null);
    setSituation('');
    setAutomaticThought('');
    setStep(1);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      style={styles.container}
    >
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Feather name="chevron-left" size={20} color={Colors.text} />
          <Text style={styles.backBtnText}>Exit Debrief</Text>
        </TouchableOpacity>

        <View style={styles.badge}>
          <Feather name="shield" size={11} color="#38BDF8" />
          <Text style={styles.badgeText}>SOCRATIC REFLECTION</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Editorial Title */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Evening Wind-Down</Text>
          <Text style={styles.heroSubtitle}>
            A structured 3-step cognitive debrief with {currentPersona?.name || 'your companion'} to deconstruct cognitive distortions and detach before sleep.
          </Text>
        </View>

        {!debriefResult ? (
          <View style={styles.wizardCard}>
            {/* Step Indicators */}
            <View style={styles.stepProgressRow}>
              {[1, 2, 3].map((s) => (
                <View
                  key={s}
                  style={[
                    styles.stepBar,
                    step >= s ? styles.stepBarActive : styles.stepBarInactive,
                  ]}
                />
              ))}
            </View>

            {step === 1 && (
              <View style={styles.stepContent}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>STEP 1 OF 3</Text>
                </View>
                <Text style={styles.stepTitle}>What event or friction triggered tension today?</Text>
                <Text style={styles.stepHint}>
                  Be objective and factual. (e.g. A missed project deadline, a quiet disagreement, or a sudden surge of exhaustion).
                </Text>

                <TextInput
                  placeholder="Describe the situation..."
                  placeholderTextColor={Colors.textMuted}
                  value={situation}
                  onChangeText={setSituation}
                  multiline
                  numberOfLines={4}
                  style={styles.textArea}
                />

                <TouchableOpacity
                  onPress={handleNext}
                  style={styles.nextBtn}
                  activeOpacity={0.8}
                >
                  <Text style={styles.nextBtnText}>Continue to Automatic Thought</Text>
                  <Feather name="arrow-right" size={14} color="#FFF" />
                </TouchableOpacity>
              </View>
            )}

            {step === 2 && (
              <View style={styles.stepContent}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>STEP 2 OF 3</Text>
                </View>
                <Text style={styles.stepTitle}>What was your immediate automatic thought?</Text>
                <Text style={styles.stepHint}>
                  The unfiltered inner critic or worst-case narrative. (e.g. "I am falling behind everyone else and I cannot keep up.")
                </Text>

                <TextInput
                  placeholder="Share the raw thought..."
                  placeholderTextColor={Colors.textMuted}
                  value={automaticThought}
                  onChangeText={setAutomaticThought}
                  multiline
                  numberOfLines={4}
                  style={styles.textArea}
                />

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity
                    onPress={() => setStep(1)}
                    style={styles.backStepBtn}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.backStepBtnText}>Back</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleNext}
                    style={[styles.nextBtn, { flex: 1 }]}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.nextBtnText}>Identify Distortion</Text>
                    <Feather name="arrow-right" size={14} color="#FFF" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {step === 3 && (
              <View style={styles.stepContent}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>STEP 3 OF 3</Text>
                </View>
                <Text style={styles.stepTitle}>Select the primary cognitive distortion</Text>
                <Text style={styles.stepHint}>
                  How might the inner narrative be magnifying or distorting reality?
                </Text>

                <View style={styles.distortionsGrid}>
                  {COGNITIVE_DISTORTIONS.map((dist) => {
                    const isSelected = selectedDistortion === dist;
                    return (
                      <TouchableOpacity
                        key={dist}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setSelectedDistortion(dist);
                        }}
                        activeOpacity={0.7}
                        style={[
                          styles.distortionChip,
                          isSelected && styles.distortionChipActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.distortionText,
                            isSelected && styles.distortionTextActive,
                          ]}
                        >
                          {dist}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                  <TouchableOpacity
                    onPress={() => setStep(2)}
                    style={styles.backStepBtn}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.backStepBtnText}>Back</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleExecuteDebrief}
                    disabled={isLoading}
                    style={[styles.nextBtn, { flex: 1 }]}
                    activeOpacity={0.8}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <>
                        <Text style={styles.nextBtnText}>Receive Socratic Reframe</Text>
                        <Feather name="compass" size={14} color="#FFF" />
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.resultsContainer}>
            {/* Socratic Reframe Card */}
            <DoubleBezelCard style={styles.resultCardOuter} innerStyle={styles.resultCardInner}>
              <View style={styles.resultBadgeRow}>
                <Feather name="compass" size={12} color={Colors.terracotta} />
                <Text style={styles.resultBadgeText}>SOCRATIC COGNITIVE REFRAME</Text>
              </View>
              <Text style={styles.resultMainText}>{debriefResult.socratic_reframe}</Text>
            </DoubleBezelCard>

            {/* Boundary Affirmation Card */}
            <DoubleBezelCard style={styles.resultCardOuter} innerStyle={styles.resultCardInner}>
              <View style={styles.resultBadgeRow}>
                <Feather name="shield" size={12} color="#10B981" />
                <Text style={[styles.resultBadgeText, { color: '#10B981' }]}>
                  ANTI-CODEPENDENCY BOUNDARY
                </Text>
              </View>
              <Text style={styles.resultMainText}>{debriefResult.boundary_affirmation}</Text>
            </DoubleBezelCard>

            {/* Evening Grounding Exercise Card */}
            <DoubleBezelCard style={styles.resultCardOuter} innerStyle={styles.resultCardInner}>
              <View style={styles.resultBadgeRow}>
                <Feather name="moon" size={12} color="#818CF8" />
                <Text style={[styles.resultBadgeText, { color: '#818CF8' }]}>
                  SOMATOSENSORY WIND-DOWN
                </Text>
              </View>
              <Text style={styles.resultMainText}>{debriefResult.evening_grounding_exercise}</Text>
            </DoubleBezelCard>

            <TouchableOpacity
              onPress={handleReset}
              style={styles.doneBtn}
              activeOpacity={0.8}
            >
              <Feather name="check" size={14} color="#FFF" />
              <Text style={styles.doneBtnText}>Complete Evening Reflection</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
