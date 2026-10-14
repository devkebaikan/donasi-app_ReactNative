import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {
  colors,
  spacing,
  radius,
  fontSize,
  fontWeight,
  lineHeight,
} from '@/theme';
import type {AppFontSize} from '@/types/setting';

interface SizeOption {
  value: AppFontSize;
  label: string;
  // Ukuran huruf "A" pada tombol — penanda visual urutan, bukan ukuran
  // sebenarnya. Nilainya ikut diskalakan oleh pengaturan yang sedang aktif,
  // jadi urutannya tetap terbaca di semua tingkat.
  markSize: number;
}

const SIZE_OPTIONS: SizeOption[] = [
  {value: 'small', label: 'Kecil', markSize: 12},
  {value: 'medium', label: 'Sedang', markSize: 14},
  {value: 'large', label: 'Besar', markSize: 16},
  {value: 'xlarge', label: 'Sangat Besar', markSize: 18},
];

const PREVIEW_TEXT =
  'Sedekah tidak akan mengurangi harta. Begini tampilan teks aplikasi pada ukuran yang Anda pilih.';

interface FontSizeSelectorProps {
  value: AppFontSize;
  onChange: (value: AppFontSize) => void;
}

// Tidak ada pratinjau yang diskalakan sendiri di sini: begitu satu tingkat
// dipilih, SELURUH layar langsung berubah ukuran — itu pratinjau yang paling
// jujur. Kotak contoh di bawah cuma memberi satu paragraf utuh untuk dinilai.
export function FontSizeSelector({
  value,
  onChange,
}: FontSizeSelectorProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Ukuran Font</Text>
      <Text style={styles.description}>
        Berlaku untuk seluruh tulisan di aplikasi
      </Text>

      <View style={styles.steps}>
        {SIZE_OPTIONS.map(option => {
          const isActive = option.value === value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.step, isActive && styles.stepActive]}
              onPress={() => onChange(option.value)}
              accessibilityRole="radio"
              accessibilityLabel={`Ukuran font ${option.label}`}
              accessibilityState={{selected: isActive, checked: isActive}}
            >
              <Text
                style={[
                  styles.stepMark,
                  {fontSize: option.markSize},
                  isActive && styles.stepTextActive,
                ]}
              >
                A
              </Text>
              <Text
                style={[styles.stepLabel, isActive && styles.stepTextActive]}
                numberOfLines={1}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.preview}>
        <Text style={styles.previewText}>{PREVIEW_TEXT}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral[200],
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
  },
  steps: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[100],
    borderRadius: radius.lg,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  step: {
    flex: 1,
    minHeight: 44,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  stepActive: {
    backgroundColor: colors.neutral[0],
  },
  stepMark: {
    fontWeight: fontWeight.bold,
    color: colors.neutral[500],
  },
  stepLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.neutral[500],
  },
  stepTextActive: {
    color: colors.primary[600],
  },
  preview: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primary[50],
  },
  previewText: {
    fontSize: fontSize.md,
    lineHeight: fontSize.md * lineHeight.normal,
    color: colors.neutral[800],
  },
});
