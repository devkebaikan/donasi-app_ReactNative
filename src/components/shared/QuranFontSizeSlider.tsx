import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {ARABIC_FONT_SCALE} from '@/stores/quranSettingStore';
import {colors, fontFamily, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {ArabicFontSize} from '@/types/quran';

interface SizeOption {
  value: ArabicFontSize;
  label: string;
}

const SIZE_OPTIONS: SizeOption[] = [
  {value: 'small', label: 'Kecil'},
  {value: 'medium', label: 'Sedang'},
  {value: 'large', label: 'Besar'},
  {value: 'xlarge', label: 'Sangat Besar'},
];

// Contoh teks arab pendek untuk pratinjau. Sengaja bukan potongan ayat —
// pratinjau ini soal ukuran huruf, dan teks mushaf tidak boleh muncul
// setengah-setengah di luar halaman baca.
const PREVIEW_TEXT = 'أَبْجَدْ هَوَّزْ حُطِّي';

interface QuranFontSizeSliderProps {
  value: ArabicFontSize;
  onChange: (value: ArabicFontSize) => void;
}

export function QuranFontSizeSlider({
  value,
  onChange,
}: QuranFontSizeSliderProps): React.JSX.Element {
  const scale = ARABIC_FONT_SCALE[value];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Ukuran Teks Arab</Text>

      <View style={styles.steps}>
        {SIZE_OPTIONS.map(option => {
          const isActive = option.value === value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.step, isActive && styles.stepActive]}
              onPress={() => onChange(option.value)}
              accessibilityRole="radio"
              accessibilityLabel={`Ukuran teks arab ${option.label}`}
              accessibilityState={{selected: isActive, checked: isActive}}>
              <Text
                style={[styles.stepLabel, isActive && styles.stepLabelActive]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Pratinjau ikut berubah seketika — tidak ada tombol simpan. */}
      <View style={styles.preview}>
        <Text
          style={[
            styles.previewText,
            {fontSize: scale.fontSize, lineHeight: scale.lineHeight},
          ]}
          accessibilityLabel="Pratinjau ukuran teks arab">
          {PREVIEW_TEXT}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.neutral[800],
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
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  stepActive: {
    backgroundColor: colors.neutral[0],
  },
  stepLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.neutral[500],
  },
  stepLabelActive: {
    color: colors.primary[600],
    fontWeight: fontWeight.semiBold,
  },
  preview: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primary[50],
  },
  previewText: {
    fontFamily: fontFamily.arabic,
    color: colors.neutral[900],
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
