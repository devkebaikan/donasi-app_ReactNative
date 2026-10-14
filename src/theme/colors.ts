export const colors = {
  primary: {
    50: '#F4FBFB',
    100: '#E4F6F6',
    200: '#C4EDEB',
    300: '#A0E1DE',
    400: '#62CDC8',
    500: '#1EB8B1',
    600: '#1AA29C',
    700: '#168883',
    800: '#126E6A',
    900: '#0E5551',
  },
  secondary: {
    50: '#FFF7F6',
    100: '#FEECE9',
    200: '#FDD6CF',
    300: '#FBBCB2',
    400: '#F9907F',
    500: '#FD6542',
    600: '#D8543F',
    700: '#B64735',
    800: '#943A2B',
    900: '#712C21',
  },
  neutral: {
    0: '#FFFFFF',
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    1000: '#000000',
  },
  semantic: {
    success: '#16A34A',
    successLight: '#DCFCE7',
    warning: '#D97706',
    warningLight: '#FEF3C7',
    error: '#DC2626',
    errorLight: '#FEE2E2',
    info: '#0EA5E9',
    infoLight: '#E0F2FE',
  },
} as const;

// Overlay tints untuk efek glassmorphism (panel transparan di atas gradient/blur).
// Perlu alpha channel sehingga tidak masuk skala `colors` biasa.
export const glass = {
  tint: 'rgba(255, 255, 255, 0.5)',
  tintHeavy: 'rgba(255, 255, 255, 0.75)',
  border: 'rgba(255, 255, 255, 0.6)',
} as const;

// Aurora UI tokens — pastel palette matched to FloraGoGo brand (teal, lavender, coral)
export const aurora = {
  gradientStart: '#DCF7F2',
  gradientMid: '#E8E4FF',
  gradientEnd: '#FFE8E4',
  // Orbs: brand teal, soft violet, warm coral
  orb1: 'rgba(30, 184, 177, 0.45)',
  orb2: 'rgba(139, 92, 246, 0.38)',
  orb3: 'rgba(246, 130, 107, 0.38)',
  // Glassmorphism card (light frosted)
  glassBorder: 'rgba(255, 255, 255, 0.90)',
  glassOverlay: 'rgba(255, 255, 255, 0.40)',
  glassFallback: '#F0FBF9',
  // Inputs inside card
  inputBg: 'rgba(255, 255, 255, 0.72)',
  inputBorder: 'rgba(0, 0, 0, 0.10)',
  // Logo mark in hero
  logoMarkBg: 'rgba(255, 255, 255, 0.78)',
  logoMarkBorder: 'rgba(255, 255, 255, 0.95)',
  // OTP button tinted background
  otpButtonBg: 'rgba(30, 184, 177, 0.07)',
  // Divider inside card
  divider: 'rgba(0, 0, 0, 0.06)',
} as const;

// Gradient background khusus screen auth (login, register, forgot password)
export const authGradient = {
  colors: ['#1EB8B1', '#AEEBE4', '#DDF6F3'],
  locations: [0, 0.5, 1],
};

// Gradient overlay QuranWelcomeScreen — transparan di atas, hijau pekat di bawah
// agar teks putih tetap terbaca di atas background image.
// Alpha 0 ditulis eksplisit sebagai rgba primary[700], bukan 'transparent',
// karena 'transparent' pada Android memudar ke hitam di sebagian perangkat.
export const quranWelcomeGradient = {
  colors: ['rgba(22, 136, 131, 0)', 'rgba(22, 136, 131, 0.72)', '#126E6A'],
  locations: [0, 0.45, 1],
};

// Gradient kartu menu Quran (challenge & jadwal): mint -> putih hangat ->
// peach. `aurora.gradientMid` (lavender) sengaja tidak dipakai — tidak ada
// ungu di menu Quran. Titik tengahnya putih hangat karena mint yang sejuk ke
// peach yang hangat akan terlihat kusam kalau dilewatkan abu-abu netral.
export const quranCardGradient = {
  colors: [aurora.gradientStart, colors.secondary[50], aurora.gradientEnd],
};

export const colorTokens = {
  background: {
    primary: colors.neutral[0],
    secondary: colors.neutral[50],
    tertiary: colors.neutral[100],
  },
  text: {
    primary: colors.neutral[900],
    secondary: colors.neutral[600],
    disabled: colors.neutral[400],
    inverse: colors.neutral[0],
  },
  border: {
    default: colors.neutral[200],
    strong: colors.neutral[300],
    focus: colors.primary[500],
  },
  brand: {
    default: colors.primary[500],
    hover: colors.primary[600],
    light: colors.primary[50],
  },
} as const;
