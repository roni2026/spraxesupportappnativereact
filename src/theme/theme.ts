import { colors } from './colors';

// Central spacing / typography tokens used across screens.
export const theme = {
  colors: {
    primary: colors.navy900,
    accent: colors.orange500,
    background: colors.gray50,
    surface: colors.white,
    surfaceVariant: colors.surfaceVariant,
    onSurface: colors.gray900,
    onSurfaceMuted: 'rgba(17,24,39,0.6)',
    border: colors.gray200,
    error: colors.destructive,
  },
  radius: { sm: 8, md: 14, lg: 16, pill: 50 },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },
  font: {
    headline: 22,
    titleLarge: 20,
    titleMedium: 16,
    body: 14,
    label: 12,
  },
} as const;

export const CURRENCY = '\u09f3'; // Bangladeshi Taka
export function money(value: number | null | undefined): string {
  return CURRENCY + (value ?? 0).toFixed(2);
}
export function titleCase(s: string): string {
  const t = s.replace(/_/g, ' ');
  return t.charAt(0).toUpperCase() + t.slice(1);
}
