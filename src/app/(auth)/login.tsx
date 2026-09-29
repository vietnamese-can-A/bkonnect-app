import { PlaceholderScreen } from '@/components/placeholder-screen';

export default function LoginScreen() {
  return (
    <PlaceholderScreen
      eyebrow="Authentication"
      title="Login"
      description="HCMUT student authentication will be connected in a later step."
      actions={[{ label: 'Continue to home', href: '/(tabs)' }]}
    />
  );
}
