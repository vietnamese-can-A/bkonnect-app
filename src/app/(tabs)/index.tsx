import { PlaceholderScreen } from '@/components/placeholder-screen';

export default function HomeScreen() {
  return (
    <PlaceholderScreen
      eyebrow="Lost & Found"
      title="Home"
      description="Lost and found posts from the HCMUT community will appear here."
      actions={[
        { label: 'View sample item', href: '/posts/sample-item' },
        { label: 'Review claims', href: '/claims' },
      ]}
    />
  );
}
