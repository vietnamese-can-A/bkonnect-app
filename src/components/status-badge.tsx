import { StyleSheet, Text, View } from 'react-native';

import { colors, radii } from '@/constants/theme';
import type { FoundPostStatus, LostReportStatus, MatchStatus } from '@/types/domain';

type BadgeTone = 'blue' | 'green' | 'gray' | 'amber' | 'red';

const toneStyles = {
  blue: { background: colors.blueSoft, border: '#BFDBFE', text: colors.blueDark },
  green: { background: colors.successSoft, border: '#A7F3D0', text: '#047857' },
  gray: { background: '#F1F5F9', border: colors.borderStrong, text: '#475569' },
  amber: { background: colors.warningSoft, border: '#FDE68A', text: colors.warning },
  red: { background: colors.dangerSoft, border: '#FECDD3', text: colors.danger },
} as const;

function Badge({ label, tone }: { label: string; tone: BadgeTone }) {
  const palette = toneStyles[tone];

  return (
    <View style={[styles.badge, { backgroundColor: palette.background, borderColor: palette.border }]}>
      <Text style={[styles.text, { color: palette.text }]}>{label}</Text>
    </View>
  );
}

export function FoundBadge() {
  return <Badge label="ĐỒ NHẶT ĐƯỢC" tone="blue" />;
}

export function FoundPostStatusBadge({ status }: { status: FoundPostStatus }) {
  return <Badge label={status === 'OPEN' ? 'ĐANG GIỮ' : 'ĐÃ TRẢ'} tone={status === 'OPEN' ? 'green' : 'gray'} />;
}

export function LostReportStatusBadge({ status }: { status: LostReportStatus }) {
  return <Badge label={status === 'SEARCHING' ? 'ĐANG TÌM' : 'ĐÃ TÌM LẠI'} tone={status === 'SEARCHING' ? 'amber' : 'green'} />;
}

export function MatchStatusBadge({ status }: { status: MatchStatus }) {
  const labels: Record<MatchStatus, string> = {
    POSSIBLE: 'CÓ THỂ TRÙNG KHỚP',
    DISMISSED: 'ĐÃ BỎ QUA',
    COMPLETED: 'ĐÃ HOÀN TẤT',
  };
  const tones: Record<MatchStatus, BadgeTone> = {
    POSSIBLE: 'amber',
    DISMISSED: 'red',
    COMPLETED: 'green',
  };

  return <Badge label={labels[status]} tone={tones[status]} />;
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  text: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
