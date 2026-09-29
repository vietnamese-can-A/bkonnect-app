import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { colors, radii, shadows } from '@/constants/theme';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: 'primary' | 'secondary' | 'danger' | 'success';
  icon?: ReactNode;
  style?: ViewStyle;
};

const backgrounds = {
  primary: colors.blue,
  secondary: colors.indigoSoft,
  danger: colors.danger,
  success: '#10B981',
} as const;

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  tone = 'primary',
  icon,
  style,
}: PrimaryButtonProps) {
  const secondary = tone === 'secondary';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: backgrounds[tone] },
        !secondary && shadows.floating,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}>
      {icon}
      <Text style={[styles.label, secondary && styles.secondaryLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: radii.medium,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  label: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryLabel: {
    color: colors.text,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
});
