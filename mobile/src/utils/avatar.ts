import { ImageSourcePropType } from 'react-native';

const LOCAL_AVATARS: Record<string, any> = {
  maya: require('../../assets/avatars/maya.jpg'),
  soren: require('../../assets/avatars/soren.jpg'),
  elena: require('../../assets/avatars/elena.jpg'),
  kaelen: require('../../assets/avatars/kaelen.jpg'),
};

export function getAvatarSource(avatarUrl?: string): ImageSourcePropType {
  if (!avatarUrl) {
    return LOCAL_AVATARS.maya;
  }

  const lower = avatarUrl.toLowerCase();
  if (lower.includes('maya')) return LOCAL_AVATARS.maya;
  if (lower.includes('soren')) return LOCAL_AVATARS.soren;
  if (lower.includes('elena')) return LOCAL_AVATARS.elena;
  if (lower.includes('kaelen')) return LOCAL_AVATARS.kaelen;

  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return { uri: avatarUrl };
  }

  return LOCAL_AVATARS.maya;
}
