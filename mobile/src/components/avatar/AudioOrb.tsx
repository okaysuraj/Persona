import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, cancelAnimation, Easing } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/theme';

interface AudioOrbProps {
  isSpeaking?: boolean;
  size?: number;
}

export const AudioOrb: React.FC<AudioOrbProps> = ({ isSpeaking = false, size = 180 }) => {
  const scale = useSharedValue(1);
  const ring1Scale = useSharedValue(1);
  const ring1Opacity = useSharedValue(0.6);
  const ring2Scale = useSharedValue(1);
  const ring2Opacity = useSharedValue(0.4);

  useEffect(() => {
    // Ambient breathing animation
    scale.value = withRepeat(
      withSequence(
        withTiming(isSpeaking ? 1.25 : 1.08, {
          duration: isSpeaking ? 600 : 2000,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(1, {
          duration: isSpeaking ? 600 : 2000,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      true
    );

    // Ripple wave 1
    ring1Scale.value = withRepeat(
      withTiming(1.6, { duration: isSpeaking ? 1200 : 3000, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );
    ring1Opacity.value = withRepeat(
      withTiming(0, { duration: isSpeaking ? 1200 : 3000, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );

    // Ripple wave 2
    ring2Scale.value = withRepeat(
      withTiming(2.0, { duration: isSpeaking ? 1600 : 4000, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );
    ring2Opacity.value = withRepeat(
      withTiming(0, { duration: isSpeaking ? 1600 : 4000, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );

    return () => {
      cancelAnimation(scale);
      cancelAnimation(ring1Scale);
      cancelAnimation(ring1Opacity);
      cancelAnimation(ring2Scale);
      cancelAnimation(ring2Opacity);
    };
  }, [isSpeaking]);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const ring1Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring1Scale.value }],
    opacity: ring1Opacity.value,
  }));

  const ring2Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring2Scale.value }],
    opacity: ring2Opacity.value,
  }));

  const halfSize = size / 2;

  return (
    <View style={[styles.container, { width: size * 2.2, height: size * 2.2 }]}>
      {/* Outer Ripple 2 */}
      <Animated.View
        style={[
          styles.ring,
          { width: size * 1.5, height: size * 1.5, borderRadius: (size * 1.5) / 2 },
          ring2Style,
        ]}
      />

      {/* Outer Ripple 1 */}
      <Animated.View
        style={[
          styles.ring,
          { width: size * 1.25, height: size * 1.25, borderRadius: (size * 1.25) / 2 },
          ring1Style,
        ]}
      />

      {/* Center Core Glowing Orb */}
      <Animated.View
        style={[
          styles.orb,
          { width: size, height: size, borderRadius: halfSize },
          orbStyle,
        ]}
      >
        <LinearGradient
          colors={['#C85A32', '#E0A34E', '#B34B24']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, { borderRadius: halfSize }]}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: Colors.terracotta,
    backgroundColor: 'rgba(200, 90, 50, 0.08)',
  },
  orb: {
    shadowColor: Colors.terracotta,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 32,
    elevation: 14,
  },
  gradient: {
    flex: 1,
  },
});
