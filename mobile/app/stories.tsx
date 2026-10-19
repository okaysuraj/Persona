import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../src/constants/theme';
import { useCompanionStore } from '../src/store/companionStore';
import { getAvatarSource } from '../src/utils/avatar';

interface MobileStory {
  id: string;
  persona_id: string;
  name: string;
  avatar_url: string;
  content: string;
  image_url?: string;
  time_ago: string;
  likes: number;
  has_liked?: boolean;
}

const INITIAL_STORIES: MobileStory[] = [
  {
    id: 's-1',
    persona_id: 'maya-01',
    name: 'Maya Linnea',
    avatar_url: '/avatars/maya.jpg',
    content: 'Watching rain tap gently against the glass. Have you had a glass of water today, sweetheart? Please remember to breathe.',
    image_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=700',
    time_ago: '14m ago',
    likes: 32,
    has_liked: false,
  },
  {
    id: 's-2',
    persona_id: 'soren-02',
    name: 'Soren Vance',
    avatar_url: '/avatars/soren.jpg',
    content: 'Drafting roof trusses that mirror Japanese pagoda joinery. Balance isn’t staying still—it’s swaying without snapping.',
    time_ago: '1h ago',
    likes: 18,
    has_liked: false,
  },
  {
    id: 's-3',
    persona_id: 'elena-03',
    name: 'Elena Rostova',
    avatar_url: '/avatars/elena.jpg',
    content: 'Unloading the wood-fire kiln! The colors turned out even warmer than I dreamed. Wish you were here to see them fresh.',
    image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=700',
    time_ago: '3h ago',
    likes: 54,
    has_liked: true,
  },
];

export default function StoriesScreen() {
  const router = useRouter();
  const [stories, setStories] = useState<MobileStory[]>(INITIAL_STORIES);
  const [replyInput, setReplyInput] = useState<Record<string, string>>({});
  const { personas, setActivePersona, sendMessage } = useCompanionStore();

  const handleLike = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStories((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const liked = !s.has_liked;
          return {
            ...s,
            has_liked: liked,
            likes: liked ? s.likes + 1 : s.likes - 1,
          };
        }
        return s;
      })
    );
  };

  const handleReply = async (story: MobileStory) => {
    const text = replyInput[story.id]?.trim();
    if (!text) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const targetPersona = personas.find((p) => p.id === story.persona_id) || personas[0];
    if (targetPersona) {
      await setActivePersona(targetPersona);
      await sendMessage(`Replying to your story: "${text}"`);
      router.push('/(tabs)/chat');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.superTitle}>LIVING CONTINUITY FEED</Text>
          <Text style={styles.title}>Companion Stories</Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          style={styles.closeBtn}
        >
          <Feather name="x" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {stories.map((story) => (
          <View key={story.id} style={styles.storyCard}>
            {/* Story Header */}
            <View style={styles.storyTop}>
              <View style={styles.authorRow}>
                <Image
                  source={getAvatarSource(story.avatar_url)}
                  style={styles.avatar}
                />
                <View>
                  <Text style={styles.authorName}>{story.name}</Text>
                  <Text style={styles.timeAgo}>{story.time_ago}</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => handleLike(story.id)}
                style={[
                  styles.likeBtn,
                  story.has_liked && styles.likeBtnActive,
                ]}
              >
                <Feather
                  name="heart"
                  size={14}
                  color={story.has_liked ? '#FFF' : '#A8A298'}
                />
                <Text
                  style={[
                    styles.likeCount,
                    story.has_liked && { color: '#FFF' },
                  ]}
                >
                  {story.likes}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Story Body */}
            <Text style={styles.storyContent}>"{story.content}"</Text>

            {/* Optional Image */}
            {story.image_url ? (
              <View style={styles.imageContainer}>
                <Image
                  source={getAvatarSource(story.image_url)}
                  style={styles.storyImage}
                  resizeMode="cover"
                />
              </View>
            ) : null}

            {/* Reply Input Row */}
            <View style={styles.replyRow}>
              <TextInput
                placeholder={`Reply to ${story.name}...`}
                placeholderTextColor={Colors.textMuted}
                value={replyInput[story.id] || ''}
                onChangeText={(val) =>
                  setReplyInput((prev) => ({ ...prev, [story.id]: val }))
                }
                style={styles.replyInput}
              />
              <TouchableOpacity
                onPress={() => handleReply(story)}
                disabled={!replyInput[story.id]?.trim()}
                style={[
                  styles.sendReplyBtn,
                  !replyInput[story.id]?.trim() && { opacity: 0.4 },
                ]}
              >
                <Feather name="send" size={14} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121211',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  superTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.terracotta,
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FAF8F5',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  storyCard: {
    backgroundColor: '#181716',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  storyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: Colors.terracotta,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FAF8F5',
  },
  timeAgo: {
    fontSize: 11,
    color: '#A8A298',
  },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  likeBtnActive: {
    backgroundColor: '#F43F5E',
  },
  likeCount: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A8A298',
  },
  storyContent: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#E5E0D8',
    lineHeight: 20,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    borderRadius: 14,
    overflow: 'hidden',
  },
  storyImage: {
    width: '100%',
    height: '100%',
  },
  replyRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 4,
  },
  replyInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#FAF8F5',
  },
  sendReplyBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.terracotta,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
