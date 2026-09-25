import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/theme';

interface DoubleBezelCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  innerStyle?: ViewStyle;
  onPress?: () => void;
  active?: boolean;
}

export const DoubleBezelCard: React.FC<DoubleBezelCardProps> = ({
  children,
  style,
  innerStyle,
  onPress,
  active = false,
}) => {
  const content = (
    <View
      style={[
        styles.outerBezel,
        active && styles.outerBezelActive,
        style,
      ]}
    >
      <View style={[styles.innerCore, innerStyle]}>{children}</View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  outerBezel: {
    padding: 6,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.035)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  outerBezelActive: {
    borderColor: 'rgba(200, 90, 50, 0.5)',
    backgroundColor: 'rgba(200, 90, 50, 0.05)',
  },
  innerCore: {
    borderRadius: 18,
    backgroundColor: Colors.surface, // #191817
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    overflow: 'hidden',
  },
});
