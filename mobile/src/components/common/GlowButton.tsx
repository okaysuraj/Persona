import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, BorderRadius, Spacing } from '../../constants/theme';

interface GlowButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  variant?: 'primary' | 'romantic' | 'secondary' | 'ochre' | 'forest' | 'burgundy' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
}

export const GlowButton: React.FC<GlowButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  icon,
  variant = 'forest',
  loading = false,
  disabled = false,
}) => {
  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const getBackgroundColor = () => {
    if (variant === 'burgundy' || variant === 'romantic') return Colors.burgundy;
    if (variant === 'ochre') return Colors.ochre;
    if (variant === 'secondary' || variant === 'ghost') return 'rgba(255, 255, 255, 0.05)';
    return Colors.forestGreen; // Default: Deep forest green
  };

  const getBorderColor = () => {
    if (variant === 'secondary' || variant === 'ghost') return Colors.glassBorder;
    return 'rgba(255, 255, 255, 0.08)';
  };

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
        },
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={Colors.text} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {icon}
          <Text style={[styles.text, icon ? { marginLeft: Spacing.sm } : null, textStyle]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.md, // Soft 14px corner
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  disabled: {
    opacity: 0.45,
  },
});
