import { PlaceholderScreen } from '@/components/placeholder-screen';

export default function MyPostsScreen() {
  return (
    <PlaceholderScreen
      eyebrow="Posts"
      title="My Posts"
      description="Your active and resolved lost or found posts will appear here."
      actions={[{ label: 'Review claims', href: '/claims' }]}
    />
  );
}
