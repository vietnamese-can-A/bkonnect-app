import { PlaceholderScreen } from '@/components/placeholder-screen';

export default function ProfileScreen() {
  return (
    <PlaceholderScreen
      eyebrow="Account"
      title="Profile"
      description="Student profile and account settings will be implemented here."
      actions={[{ label: 'Return to login', href: '/(auth)/login' }]}
    />
  );
}
