export const fontFamily = {
  light: 'Montserrat-Light',
  lightItalic: 'Montserrat-LightItalic',
  regular: 'Montserrat-Regular',
  italic: 'Montserrat-Italic',
  medium: 'Montserrat-Medium',
  mediumItalic: 'Montserrat-MediumItalic',
  semiBold: 'Montserrat-SemiBold',
  semiBoldItalic: 'Montserrat-SemiBoldItalic',
  bold: 'Montserrat-Bold',
  boldItalic: 'Montserrat-BoldItalic',
  // Font mushaf: LPMQ Isep Misbah, font resmi Mushaf Standar Indonesia.
  // Dipilih karena seortografi dengan teks Kemenag yang dipakai aplikasi —
  // lihat ADR-005. Nilainya harus sama dengan nama file .ttf (Android) dan
  // PostScript name (iOS); verifikasi dengan `npm run font:check`.
  arabic: 'LPMQIsepMisbah',
} as const;

export const fontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;

export const lineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
} as const;

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
};

export const textStyles = {
  displayLg: {
    fontSize: fontSize['4xl'],
    lineHeight: fontSize['4xl'] * lineHeight.tight,
    fontWeight: fontWeight.bold,
  },
  displayMd: {
    fontSize: fontSize['3xl'],
    lineHeight: fontSize['3xl'] * lineHeight.tight,
    fontWeight: fontWeight.bold,
  },
  headingLg: {
    fontSize: fontSize['2xl'],
    lineHeight: fontSize['2xl'] * lineHeight.tight,
    fontWeight: fontWeight.bold,
  },
  headingMd: {
    fontSize: fontSize.xl,
    lineHeight: fontSize.xl * lineHeight.tight,
    fontWeight: fontWeight.semiBold,
  },
  headingSm: {
    fontSize: fontSize.lg,
    lineHeight: fontSize.lg * lineHeight.tight,
    fontWeight: fontWeight.semiBold,
  },
  bodyLg: {
    fontSize: fontSize.lg,
    lineHeight: fontSize.lg * lineHeight.normal,
    fontWeight: fontWeight.regular,
  },
  bodyMd: {
    fontSize: fontSize.md,
    lineHeight: fontSize.md * lineHeight.normal,
    fontWeight: fontWeight.regular,
  },
  bodySm: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
    fontWeight: fontWeight.regular,
  },
  labelLg: {
    fontSize: fontSize.md,
    lineHeight: fontSize.md * lineHeight.tight,
    fontWeight: fontWeight.medium,
  },
  labelMd: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.tight,
    fontWeight: fontWeight.medium,
  },
  caption: {
    fontSize: fontSize.xs,
    lineHeight: fontSize.xs * lineHeight.normal,
    fontWeight: fontWeight.regular,
  },
} as const;
