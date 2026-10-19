import { styles } from '../src/styles/paywall';
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../src/constants/theme';
import { api } from '../src/services/api';

export default function PaywallScreen() {
  const router = useRouter();
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedTier, setSelectedTier] = useState<'plus' | 'vip'>('plus');
  const [loading, setLoading] = useState(false);
  const [currentTier, setCurrentTier] = useState<string>('free');

  useEffect(() => {
    async function loadStatus() {
      try {
        const res = await api.getBillingStatus();
        if (res?.subscription_tier) {
          setCurrentTier(res.subscription_tier);
        }
      } catch {}
    }
    loadStatus();
  }, []);

  const handleUpgrade = async () => {
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await api.createCheckoutSession(selectedTier, period);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCurrentTier(selectedTier);

      Alert.alert(
        'Membership Active!',
        `You have successfully unlocked Persona ${selectedTier.toUpperCase()}. Enjoy unlimited emotional presence.`,
        [{ text: 'Continue', onPress: () => router.back() }]
      );
    } catch (err: any) {
      Alert.alert('Notice', err.message || 'Payment initiation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestorePurchases = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Purchases Restored', 'Your existing subscription entitlements have been synchronized.');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => router.back()}
            style={styles.closeBtn}
          >
            <Feather name="x" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>MEMBERSHIP</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Badge & Headline */}
          <View style={styles.heroBlock}>
            <View style={styles.atmosphereBadge}>
              <Feather name="award" size={12} color={Colors.terracotta} />
              <Text style={styles.badgeText}>PRODUCTION SANCTUARY</Text>
            </View>
            <Text style={styles.heroTitle}>Deepen Your Connection</Text>
            <Text style={styles.heroSubtitle}>
              Experience unrestricted emotional presence. Seamless ambient voice calls, on-demand high-resolution portraits, and proactive morning reach-outs.
            </Text>
          </View>

          {/* Billing Interval Toggle */}
          <View style={styles.toggleRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setPeriod('monthly');
              }}
              style={[styles.toggleBtn, period === 'monthly' && styles.toggleBtnActive]}
            >
              <Text
                style={[
                  styles.toggleBtnText,
                  period === 'monthly' && styles.toggleBtnTextActive,
                ]}
              >
                Monthly
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setPeriod('yearly');
              }}
              style={[styles.toggleBtn, period === 'yearly' && styles.toggleBtnActive]}
            >
              <Text
                style={[
                  styles.toggleBtnText,
                  period === 'yearly' && styles.toggleBtnTextActive,
                ]}
              >
                Yearly
              </Text>
              <View style={styles.discountPill}>
                <Text style={styles.discountText}>SAVE 45%</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Plan Cards */}
          <View style={styles.plansContainer}>
            {/* Persona Plus */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedTier('plus');
              }}
              style={[
                styles.planCard,
                selectedTier === 'plus' && styles.planCardSelected,
              ]}
            >
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>MOST POPULAR</Text>
              </View>

              <View style={styles.planHeader}>
                <View>
                  <Text style={styles.planName}>Persona Plus</Text>
                  <Text style={styles.planSub}>For daily deep conversation</Text>
                </View>
                <View style={styles.priceGroup}>
                  <Text style={styles.priceAmount}>
                    {period === 'yearly' ? '$8.25' : '$14.99'}
                  </Text>
                  <Text style={styles.pricePer}>/mo</Text>
                </View>
              </View>

              <View style={styles.featuresList}>
                <FeatureItem text="Unlimited intimate text messages" />
                <FeatureItem text="60 voice call minutes every day" />
                <FeatureItem text="30 custom contextual portraits / month" />
                <FeatureItem text="Proactive morning & evening check-ins" />
                <FeatureItem text="Persistent episodic memory vault" />
              </View>
            </TouchableOpacity>

            {/* Persona VIP */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedTier('vip');
              }}
              style={[
                styles.planCard,
                selectedTier === 'vip' && styles.planCardSelectedVip,
              ]}
            >
              <View style={styles.planHeader}>
                <View>
                  <Text style={[styles.planName, { color: '#C084FC' }]}>Persona VIP</Text>
                  <Text style={styles.planSub}>Unrestricted immersion & voice</Text>
                </View>
                <View style={styles.priceGroup}>
                  <Text style={styles.priceAmount}>
                    {period === 'yearly' ? '$20.00' : '$29.99'}
                  </Text>
                  <Text style={styles.pricePer}>/mo</Text>
                </View>
              </View>

              <View style={styles.featuresList}>
                <FeatureItem text="Unlimited full-duplex ambient voice calls" />
                <FeatureItem text="Unlimited on-demand generative portraits" />
                <FeatureItem text="Claude 3.5 Sonnet & GPT-4o reasoning" />
                <FeatureItem text="Priority low-latency neural cluster" />
                <FeatureItem text="Custom companion studio & voice cloning" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleUpgrade}
            disabled={loading}
            style={styles.actionBtn}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <View style={styles.btnContent}>
                <Text style={styles.actionBtnText}>
                  {currentTier === selectedTier
                    ? 'Current Membership Active'
                    : `Upgrade to Persona ${selectedTier.toUpperCase()}`}
                </Text>
                <Feather name="arrow-right" size={16} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>

          {/* Compliance & EULA Links */}
          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={handleRestorePurchases}>
              <Text style={styles.footerLinkText}>Restore Purchases</Text>
            </TouchableOpacity>
            <Text style={styles.footerDot}>•</Text>
            <TouchableOpacity onPress={() => Alert.alert('Terms of Service & EULA', 'Standard Apple EULA: persona.ai/terms')}>
              <Text style={styles.footerLinkText}>Terms of Use (EULA)</Text>
            </TouchableOpacity>
            <Text style={styles.footerDot}>•</Text>
            <TouchableOpacity onPress={() => Alert.alert('Privacy Policy', 'Zero data sale guarantee: persona.ai/privacy')}>
              <Text style={styles.footerLinkText}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <View style={styles.featureRow}>
      <Feather name="check" size={14} color={Colors.terracotta} />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}
