import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

import { colors, radii } from '@/constants/theme';

type FormFieldProps = PropsWithChildren<{
  label: string;
  required?: boolean;
  hint?: string;
}>;

export function FormField({ label, required = false, hint, children }: FormFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      {children}
      {hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

export function FormTextInput(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.textSubtle}
      {...props}
      style={[styles.input, props.multiline && styles.multiline, props.style]}
    />
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 6,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  required: {
    color: colors.danger,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  input: {
    backgroundColor: colors.backgroundCool,
    borderColor: colors.border,
    borderRadius: radii.small,
    borderWidth: 1,
    color: colors.text,
    fontSize: 14,
    minHeight: 46,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  multiline: {
    minHeight: 104,
    textAlignVertical: 'top',
  },
});
