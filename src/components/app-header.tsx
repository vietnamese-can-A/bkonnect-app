import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/constants/theme';
import { useAppState } from '@/features/app-state/app-state-context';

type AppHeaderProps = {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  right?: ReactNode;
};

export function AppHeader({
  title = 'BKonnect',
  subtitle,
  showBack = false,
  right,
}: AppHeaderProps) {
  const { currentUser } = useAppState();
  const { width } = useWindowDimensions();
  const viewportWidth = width > 0 ? width : 390;

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { width: viewportWidth }]}>
      <View style={styles.header}>
        <View style={styles.leading}>
          {showBack && (
            <Pressable
              accessibilityLabel="Quay lại"
              accessibilityRole="button"
              onPress={() => router.back()}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
              <Text style={styles.backIcon}>‹</Text>
            </Pressable>
          )}

          <View style={styles.logoBox}>
            <Image
              source={require('@/assets/images/demo/hcmut-logo-home.png')}
              resizeMode="contain"
              style={styles.logo}
            />
          </View>

          <View>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        </View>
      </View>
      <View style={styles.trailing}>
        {right ?? (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{currentUser.initials}</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.indigo,
    position: 'relative',
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.indigo,
    flexDirection: 'row',
    height: 56,
    justifyContent: 'space-between',
    position: 'relative',
  },
  leading: {
    alignItems: 'center',
    flexShrink: 1,
    flexDirection: 'row',
    gap: 8,
    marginLeft: 16,
  },
  trailing: {
    bottom: 11,
    position: 'absolute',
    right: 16,
  },
  backButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    marginLeft: -8,
    width: 36,
  },
  backIcon: {
    color: colors.white,
    fontSize: 36,
    fontWeight: '300',
    lineHeight: 38,
  },
  logoBox: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 3,
    height: 32,
    justifyContent: 'center',
    width: 44,
  },
  logo: {
    height: 27,
    width: 40,
  },
  title: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    color: '#DDE1FF',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
    textTransform: 'uppercase',
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.indigoDark,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 14,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  avatarText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.75,
  },
});
