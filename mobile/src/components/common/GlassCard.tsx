import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Colors, BorderRadius, Spacing } from '../../constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  glow?: boolean;
  variant?: 'forest' | 'burgundy' | 'ochre' | 'neutral' | 'emerald' | 'crimson';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  glow = false,
  variant = 'neutral',
}) => {
  const getBorderColor = () => {
    if (!glow) return Colors.glassBorder;
    if (variant === 'burgundy' || variant === 'crimson') return 'rgba(90, 44, 42, 0.40)';
    if (variant === 'ochre') return 'rgba(128, 101, 45, 0.40)';
    return 'rgba(41, 71, 53, 0.40)';
  };

  const getBackgroundColor = () => {
    if (variant === 'burgundy' || variant === 'crimson') return 'rgba(90, 44, 42, 0.08)';
    if (variant === 'ochre') return 'rgba(128, 101, 45, 0.08)';
    if (variant === 'forest' || variant === 'emerald') return 'rgba(41, 71, 53, 0.08)';
    return Colors.glass;
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg, // Soft 20px organic corner
    borderWidth: 1,
    padding: Spacing.md,
  },
});
