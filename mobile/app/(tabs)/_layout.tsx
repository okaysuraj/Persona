import React from 'react';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../src/constants/theme';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 24 : 12);
  const tabHeight = 54 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(13, 16, 14, 0.94)',
          borderTopColor: 'rgba(255, 255, 255, 0.08)',
          borderTopWidth: 1,
          height: tabHeight,
          paddingBottom: bottomPadding,
          paddingTop: 8,
          elevation: 0,
        },
        tabBarActiveTintColor: Colors.text,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Presence',
          tabBarIcon: ({ color, size }) => (
            <Feather name="compass" size={18} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Dialogue',
          tabBarIcon: ({ color, size }) => (
            <Feather name="message-square" size={18} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="memory"
        options={{
          title: 'Journal',
          tabBarIcon: ({ color, size }) => (
            <Feather name="bookmark" size={18} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="gallery"
        options={{
          title: 'Portraits',
          tabBarIcon: ({ color, size }) => (
            <Feather name="image" size={18} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
