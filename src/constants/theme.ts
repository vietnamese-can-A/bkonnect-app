export const colors = {
  background: '#FAF8FF',
  backgroundCool: '#F8FAFC',
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',
  card: '#FFFFFF',
  indigo: '#030391',
  indigoDark: '#000056',
  indigoSoft: '#EAEDFF',
  indigoTint: '#F2F3FF',
  blue: '#1488D8',
  blueDark: '#00629F',
  blueSoft: '#EFF6FF',
  text: '#131B2E',
  textMuted: '#64748B',
  textSubtle: '#94A3B8',
  white: '#FFFFFF',
  success: '#059669',
  successSoft: '#ECFDF5',
  warning: '#B45309',
  warningSoft: '#FFFBEB',
  danger: '#BA1A1A',
  dangerSoft: '#FFF1F2',
} as const;

export const radii = {
  small: 6,
  medium: 8,
  large: 16,
  pill: 999,
} as const;

export const shadows = {
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  floating: {
    shadowColor: '#030391',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;
