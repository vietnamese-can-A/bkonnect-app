import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, shadows } from '@/constants/theme';

type SelectFieldProps = {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
  title?: string;
};

export function SelectField({
  value,
  options,
  onChange,
  placeholder = 'Chọn',
  title,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}>
        <Text numberOfLines={1} style={[styles.value, !value && styles.placeholder]}>
          {value || placeholder}
        </Text>
        <Text style={styles.chevron}>⌄</Text>
      </Pressable>

      <Modal animationType="fade" onRequestClose={() => setOpen(false)} transparent visible={open}>
        <Pressable onPress={() => setOpen(false)} style={styles.backdrop}>
          <Pressable style={styles.sheet}>
            {title ? <Text style={styles.sheetTitle}>{title}</Text> : null}
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const active = item === value;
                return (
                  <Pressable
                    onPress={() => {
                      onChange(item);
                      setOpen(false);
                    }}
                    style={[styles.option, active && styles.optionActive]}>
                    <Text style={[styles.optionText, active && styles.optionTextActive]}>{item}</Text>
                    {active && <Text style={styles.check}>✓</Text>}
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    alignItems: 'center',
    backgroundColor: colors.backgroundCool,
    borderColor: colors.border,
    borderRadius: radii.small,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 46,
    paddingHorizontal: 13,
  },
  pressed: { opacity: 0.8 },
  value: { color: colors.text, flex: 1, fontSize: 14 },
  placeholder: { color: colors.textSubtle },
  chevron: { color: colors.textMuted, fontSize: 18, fontWeight: '700' },
  backdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(15,23,42,0.45)',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  sheet: {
    backgroundColor: colors.card,
    borderRadius: radii.large,
    maxHeight: '70%',
    maxWidth: 420,
    padding: 8,
    width: '100%',
    ...shadows.floating,
  },
  sheetTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  option: {
    alignItems: 'center',
    borderRadius: radii.medium,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 13,
  },
  optionActive: { backgroundColor: colors.indigoTint },
  optionText: { color: colors.text, fontSize: 14 },
  optionTextActive: { color: colors.indigo, fontWeight: '800' },
  check: { color: colors.indigo, fontWeight: '900' },
});
