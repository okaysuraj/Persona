import { styles } from '../../src/styles/tabs/gallery';
import { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Modal, SafeAreaView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../src/constants/theme';
import { useCompanionStore } from '../../src/store/companionStore';
import { getAvatarSource } from '../../src/utils/avatar';


interface MobileMoment {
  id: string;
  url: string;
  caption: string;
  tag: 'candid' | 'café' | 'sunset' | 'night' | 'special';
  date: string;
  is_favorite: boolean;
  prompt?: string;
}

const INITIAL_MOMENTS: MobileMoment[] = [
  {
    id: 'm-1',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900',
    caption: 'Quiet morning with warm chamomile tea and my notebook. Thinking of you.',
    tag: 'candid',
    date: 'Today',
    is_favorite: true,
    prompt: 'Maya Linnea drinking chamomile tea by an airy wooden window, 35mm film grain, warm morning light',
  },
  {
    id: 'm-2',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=900',
    caption: 'Golden hour walk along the coastal bluff before the breeze picked up.',
    tag: 'sunset',
    date: 'Yesterday',
    is_favorite: false,
    prompt: 'Portrait of Maya at golden hour overlooking the sea, gentle wind in dark hair, warm amber tone',
  },
  {
    id: 'm-3',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900',
    caption: 'Found an antiquarian bookstore tucked down an alley. Picked up a poetry collection for us.',
    tag: 'café',
    date: '3 days ago',
    is_favorite: true,
    prompt: 'Maya browsing vintage book stacks in quiet library, soft depth of field',
  },
  {
    id: 'm-4',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900',
    caption: 'Studio drafting session. Clean lines and cedar aroma.',
    tag: 'candid',
    date: '4 days ago',
    is_favorite: true,
    prompt: 'Architectural drafting in minimalist Scandinavian timber studio',
  },
  {
    id: 'm-5',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900',
    caption: 'Night air on the rooftop. Looking out at the quiet city lights.',
    tag: 'night',
    date: '1 week ago',
    is_favorite: false,
    prompt: 'Nighttime terrace, atmospheric soft city bokeh, contemplative expression',
  },
];

export default function GalleryScreen() {
  const activePersona = useCompanionStore((state) => state.activePersona);
  const [moments, setMoments] = useState<MobileMoment[]>(INITIAL_MOMENTS);
  const [activeTag, setActiveTag] = useState<string>('all');
  const [selectedMoment, setSelectedMoment] = useState<MobileMoment | null>(null);
  const [showStudio, setShowStudio] = useState(false);

  const handleToggleFavorite = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMoments((prev) =>
      prev.map((m) => (m.id === id ? { ...m, is_favorite: !m.is_favorite } : m))
    );
    if (selectedMoment && selectedMoment.id === id) {
      setSelectedMoment((prev) => (prev ? { ...prev, is_favorite: !prev.is_favorite } : null));
    }
  };

  const handleRequestPose = (scene: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const photoBank = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=900',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900',
    ];
    const newMoment: MobileMoment = {
      id: `m-${Date.now()}`,
      url: photoBank[Math.floor(Math.random() * photoBank.length)],
      caption: `Captured for you: ${scene}`,
      tag: scene.includes('sunset') ? 'sunset' : scene.includes('café') ? 'café' : 'candid',
      date: 'Just now',
      is_favorite: true,
      prompt: scene,
    };
    setMoments([newMoment, ...moments]);
    setShowStudio(false);
  };

  const filteredMoments = moments.filter((m) => {
    if (activeTag === 'all') return true;
    if (activeTag === 'favorites') return m.is_favorite;
    return m.tag === activeTag;
  });

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerSuperTitle}>VISUAL ARCHIVE & MOMENTS</Text>
              <Text style={styles.headerTitle}>Portraits</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowStudio(!showStudio)}
              style={styles.requestPoseBtn}
            >
              <Feather name="camera" size={13} color="#FAF8F5" />
              <Text style={styles.requestPoseText}>Request Pose</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.headerSubtitle}>
            Every candid glimpse and memory captured with {activePersona?.name || 'your companion'}.
          </Text>
        </View>

        {/* Pose Request Studio Drawer */}
        {showStudio && (
          <View style={styles.studioCard}>
            <View style={styles.studioHeader}>
              <Feather name="star" size={14} color={Colors.terracotta} />
              <Text style={styles.studioTitle}>Character Pose Studio</Text>
            </View>
            <Text style={styles.studioSubtitle}>
              Tap an aesthetic scene to generate a new candid portrait:
            </Text>
            <View style={styles.presetsRow}>
              {[
                '☕ Reading by rain-streaked café window',
                '🌅 Golden hour walk on cliffside bluff',
                '🌙 Cozy sweater with herbal tea',
                '🌿 Terracotta studio with monstera plants',
              ].map((preset) => (
                <TouchableOpacity
                  key={preset}
                  activeOpacity={0.75}
                  onPress={() => handleRequestPose(preset)}
                  style={styles.presetChip}
                >
                  <Text style={styles.presetChipText}>{preset}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Filter Navigation Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {[
            { id: 'all', label: 'All' },
            { id: 'favorites', label: '❤️ Keepsakes' },
            { id: 'candid', label: 'Candid' },
            { id: 'sunset', label: 'Golden Hour' },
            { id: 'café', label: 'Café' },
            { id: 'night', label: 'Night' },
          ].map((tag) => (
            <TouchableOpacity
              key={tag.id}
              activeOpacity={0.7}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTag(tag.id);
              }}
              style={[
                styles.filterChip,
                activeTag === tag.id && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeTag === tag.id && styles.filterChipTextActive,
                ]}
              >
                {tag.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Cinematic 2-Column Photo Grid */}
        <View style={styles.grid}>
          {filteredMoments.map((photo) => (
            <TouchableOpacity
              key={photo.id}
              activeOpacity={0.88}
              onPress={() => setSelectedMoment(photo)}
              style={styles.cardWrapper}
            >
              <View style={styles.photoContainer}>
                <Image
                  source={getAvatarSource(photo.url)}
                  style={styles.photoImage}
                  resizeMode="cover"
                />

                {/* Heart Button Overlay */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleToggleFavorite(photo.id)}
                  style={[
                    styles.heartBtn,
                    photo.is_favorite && styles.heartBtnActive,
                  ]}
                >
                  <Feather
                    name="heart"
                    size={13}
                    color={photo.is_favorite ? '#FFF' : 'rgba(255,255,255,0.7)'}
                  />
                </TouchableOpacity>

                {/* Tag Badge */}
                <View style={styles.tagBadge}>
                  <Text style={styles.tagBadgeText}>{photo.tag}</Text>
                </View>

                {/* Caption & Date */}
                <View style={styles.photoMeta}>
                  <Text style={styles.photoCaption} numberOfLines={2}>
                    "{photo.caption}"
                  </Text>
                  <Text style={styles.photoDate}>{photo.date}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Fullscreen Photo Lightbox Modal */}
      {selectedMoment && (
        <Modal
          visible={Boolean(selectedMoment)}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedMoment(null)}
        >
          <SafeAreaView style={styles.lightboxContainer}>
            <View style={styles.lightboxHeader}>
              <Text style={styles.lightboxSuperTitle}>
                {selectedMoment.tag.toUpperCase()} KEEPSAKE
              </Text>
              <TouchableOpacity
                onPress={() => setSelectedMoment(null)}
                style={styles.lightboxCloseBtn}
              >
                <Feather name="x" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.lightboxImageContainer}>
              <Image
                source={getAvatarSource(selectedMoment.url)}
                style={styles.lightboxImage}
                resizeMode="contain"
              />
            </View>

            <View style={styles.lightboxDetails}>
              <Text style={styles.lightboxCaption}>
                "{selectedMoment.caption}"
              </Text>

              {selectedMoment.prompt ? (
                <View style={styles.promptBox}>
                  <Text style={styles.promptLabel}>Prompt Seed</Text>
                  <Text style={styles.promptText}>{selectedMoment.prompt}</Text>
                </View>
              ) : null}

              <View style={styles.lightboxActions}>
                <TouchableOpacity
                  onPress={() => handleToggleFavorite(selectedMoment.id)}
                  style={[
                    styles.favActionBtn,
                    selectedMoment.is_favorite && styles.favActionBtnActive,
                  ]}
                >
                  <Feather
                    name="heart"
                    size={16}
                    color={selectedMoment.is_favorite ? '#FFF' : '#A8A298'}
                  />
                  <Text
                    style={[
                      styles.favActionText,
                      selectedMoment.is_favorite && { color: '#FFF' },
                    ]}
                  >
                    {selectedMoment.is_favorite ? 'Keepsake Saved' : 'Save Keepsake'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </Modal>
      )}
    </View>
  );
}
