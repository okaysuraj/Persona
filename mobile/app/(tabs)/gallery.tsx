import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Colors, BorderRadius, Spacing, Typography } from '../../src/constants/theme';
import { useCompanionStore } from '../../src/store/companionStore';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - Spacing.md * 2 - 12) / 2;

export default function GalleryScreen() {
  const activePersona = useCompanionStore((state) => state.activePersona);
  const messages = useCompanionStore((state) => state.messages);

  const photos = messages
    .filter((m) => m.media_type === 'selfie' && m.media_url)
    .map((m) => ({
      id: m.id,
      url: m.media_url!,
      caption: m.content || 'Portrait moment',
      date: new Date(m.created_at).toLocaleDateString(),
    }));

  const displayPhotos = photos.length > 0 ? photos : [
    {
      id: 'default-1',
      url: activePersona?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
      caption: 'Initial portrait',
      date: 'Present',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerSuperTitle}>VISUAL ARCHIVE</Text>
        <Text style={styles.headerTitle}>Portraits</Text>
        <Text style={styles.headerSubtitle}>
          Visual glimpses and portraits shared by {activePersona?.name || 'your companion'}.
        </Text>
      </View>

      {/* Cinematic Photo Grid */}
      <View style={styles.grid}>
        {displayPhotos.map((photo) => (
          <TouchableOpacity key={photo.id} activeOpacity={0.85} style={styles.cardWrapper}>
            <View style={styles.photoContainer}>
              <Image source={{ uri: photo.url }} style={styles.photoImage} resizeMode="cover" />
              <View style={styles.photoMeta}>
                <Text style={styles.photoCaption} numberOfLines={2}>
                  {photo.caption}
                </Text>
                <Text style={styles.photoDate}>{photo.date}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: 54,
    paddingBottom: 60,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  headerSuperTitle: {
    fontSize: Typography.metadata,
    letterSpacing: 2.2,
    color: Colors.textMuted,
    fontWeight: '600',
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: Typography.screenTitle, // 36px
    lineHeight: Typography.lineHeight.screenTitle,
    fontWeight: '400',
    color: Colors.text,
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 8,
    lineHeight: 22,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  cardWrapper: {
    width: COLUMN_WIDTH,
  },
  photoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: 220,
  },
  photoMeta: {
    padding: 12,
  },
  photoCaption: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
    lineHeight: 20,
  },
  photoDate: {
    fontSize: 11,
    letterSpacing: 0.8,
    color: Colors.textMuted,
    marginTop: 6,
  },
});
