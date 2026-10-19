import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/theme';

interface BrandHeaderProps {
  rightAction?: React.ReactNode;
  onPressBrand?: () => void;
  showSubtitle?: boolean;
}

export const BrandHeader: React.FC<BrandHeaderProps> = ({
  rightAction,
  onPressBrand,
  showSubtitle = false,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={onPressBrand ? 0.7 : 1}
        onPress={onPressBrand}
        style={styles.brandRow}
      >
        {/* Brand Icon: P with terracotta dot */}
        <View style={styles.iconCircle}>
          <Text style={styles.brandP}>P</Text>
          <View style={styles.terracottaDot} />
        </View>

        <View>
          <Text style={styles.brandTitle}>Persona</Text>
          {showSubtitle && (
            <Text style={styles.brandSubtitle}>Your AI Soulmate</Text>
          )}
        </View>
      </TouchableOpacity>

      {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E1D1B',
    borderWidth: 1,
    borderColor: '#2E2C2A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  brandP: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F5F2EC',
    fontFamily: 'serif',
    marginLeft: 2,
  },
  terracottaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.terracotta, // #C85A32
    marginLeft: 2,
    marginBottom: 4,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F5F2EC',
    letterSpacing: -0.3,
  },
  brandSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  rightAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
