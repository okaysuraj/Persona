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
import { Colors, BorderRadius, Spacing } from '../../src/constants/theme';
import { useCompanionStore } from '../../src/store/companionStore';
import { getAvatarSource } from '../../src/utils/avatar';

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

  const displayPhotos =
    photos.length > 0
      ? photos
      : [
          {
            id: 'default-1',
            url: activePersona?.avatar_url || '/avatars/maya.jpg',
            caption: 'Initial portrait at quiet twilight',
            date: 'Present',
          },
        ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
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
          <TouchableOpacity
            key={photo.id}
            activeOpacity={0.85}
            style={styles.cardWrapper}
          >
            <View style={styles.photoContainer}>
              <Image
                source={getAvatarSource(photo.url)}
                style={styles.photoImage}
                resizeMode="cover"
              />
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
    backgroundColor: Colors.background, // #121211
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: 52,
    paddingBottom: 70,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  headerSuperTitle: {
    fontSize: 10,
    letterSpacing: 2.0,
    color: Colors.terracotta,
    fontWeight: '700',
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 20,
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
    backgroundColor: '#191817',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
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
    fontSize: 13,
    color: Colors.text,
    fontWeight: '500',
    lineHeight: 18,
  },
  photoDate: {
    fontSize: 11,
    letterSpacing: 0.8,
    color: Colors.textMuted,
    marginTop: 6,
  },
});
