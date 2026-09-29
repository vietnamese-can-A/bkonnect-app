import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { FoundBadge, FoundPostStatusBadge } from '@/components/status-badge';
import { colors, radii, shadows } from '@/constants/theme';
import { getFoundPostImageSource } from '@/features/posts/found-post-images';
import type { FoundPost } from '@/types/domain';
import { formatRelativeTime } from '@/utils/date';

type FoundPostCardProps = {
  post: FoundPost;
  onPress: () => void;
};

export function FoundPostCard({ post, onPress }: FoundPostCardProps) {
  const imageSource = getFoundPostImageSource(post);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      {imageSource ? (
        <Image source={imageSource} resizeMode="cover" style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>ĐỒ NHẶT ĐƯỢC</Text>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text numberOfLines={2} style={styles.title}>
            {post.title}
          </Text>
          <Text style={styles.time}>{formatRelativeTime(post.createdAt)}</Text>
        </View>

        <Text numberOfLines={1} style={styles.location}>
          ⌖ {post.building} · {post.specificLocation}
        </Text>

        <Text style={styles.category}>
          {post.category} · {post.color}
        </Text>

        <View style={styles.badges}>
          <FoundBadge />
          <FoundPostStatusBadge status={post.status} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radii.medium,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 9,
    ...shadows.card,
  },
  image: {
    backgroundColor: colors.indigoSoft,
    borderRadius: radii.small,
    height: 106,
    width: 106,
  },
  imagePlaceholder: {
    alignItems: 'center',
    backgroundColor: colors.indigoSoft,
    borderRadius: radii.small,
    height: 106,
    justifyContent: 'center',
    padding: 8,
    width: 106,
  },
  imagePlaceholderText: {
    color: colors.indigo,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    gap: 5,
    justifyContent: 'space-between',
    minWidth: 0,
  },
  titleRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 6,
  },
  title: {
    color: colors.indigo,
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  time: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  location: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  category: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '600',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.995 }],
  },
});
