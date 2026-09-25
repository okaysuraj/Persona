import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, BorderRadius, Spacing } from '../../constants/theme';

interface GlowButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  variant?:
    | 'primary'
    | 'terracotta'
    | 'secondary'
    | 'ghost'
    | 'danger'
    | 'romantic'
    | 'forest'
    | 'burgundy'
    | 'ochre';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
}

export const GlowButton: React.FC<GlowButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  icon,
  trailingIcon,
  variant = 'terracotta',
  size = 'md',
  loading = false,
  disabled = false,
}) => {
  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const getBackgroundColor = () => {
    if (variant === 'secondary') return 'rgba(255, 255, 255, 0.05)';
    if (variant === 'ghost') return 'transparent';
    if (variant === 'danger') return 'rgba(200, 90, 50, 0.2)';
    if (variant === 'ochre') return Colors.amber;
    // Primary / Terracotta / Default
    return Colors.terracotta; // #C85A32
  };

  const getBorderColor = () => {
    if (variant === 'secondary') return 'rgba(255, 255, 255, 0.09)';
    if (variant === 'ghost') return 'transparent';
    if (variant === 'danger') return 'rgba(200, 90, 50, 0.4)';
    return 'rgba(255, 255, 255, 0.1)';
  };

  const getTextColor = () => {
    if (variant === 'secondary') return Colors.text;
    if (variant === 'ghost') return Colors.textSecondary;
    if (variant === 'danger') return '#FF7A59';
    return '#FFFFFF';
  };

  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

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
          paddingVertical: isSmall ? 8 : isLarge ? 16 : 12,
          paddingHorizontal: isSmall ? 14 : isLarge ? 24 : 18,
        },
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {icon && <View style={styles.leadingIcon}>{icon}</View>}
          <Text
            style={[
              styles.text,
              { color: getTextColor(), fontSize: isSmall ? 13 : 15 },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {trailingIcon && <View style={styles.trailingIcon}>{trailingIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.md, // 16px
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leadingIcon: {
    marginRight: 8,
  },
  trailingIcon: {
    marginLeft: 8,
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  disabled: {
    opacity: 0.45,
  },
});
