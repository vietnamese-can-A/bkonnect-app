import type { ImageSourcePropType } from 'react-native';

import type { DemoImageKey, FoundPost } from '@/types/domain';

export const demoFoundPostImages: Record<DemoImageKey, ImageSourcePropType> = {
  wallet: require('@/assets/images/demo/wallet.png'),
  'student-card': require('@/assets/images/demo/student-card.png'),
  calculator: require('@/assets/images/demo/calculator.png'),
  airpods: require('@/assets/images/demo/airpods.png'),
  backpack: require('@/assets/images/demo/backpack.png'),
};

export function getFoundPostImageSource(post: Pick<FoundPost, 'imageKey' | 'imageUri'>) {
  if (post.imageUri) {
    return { uri: post.imageUri };
  }

  return post.imageKey ? demoFoundPostImages[post.imageKey] : undefined;
}
