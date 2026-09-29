import { useLocalSearchParams } from 'expo-router';

import { PlaceholderScreen } from '@/components/placeholder-screen';

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <PlaceholderScreen
      eyebrow="Post"
      title="Item Detail"
      description={`Details for item ${id ?? 'unknown'} and the claim action will be implemented here.`}
    />
  );
}
