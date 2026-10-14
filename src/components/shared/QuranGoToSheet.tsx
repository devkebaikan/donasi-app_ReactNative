import React, {forwardRef, useCallback, useState} from 'react';
import {View, Text, TouchableOpacity, TextInput, StyleSheet} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import type {BottomSheetBackdropProps} from '@gorhom/bottom-sheet';
import {Button} from '@/components/ui/Button';
import {Icon} from '@/components/ui/Icon';
import {AltArrowDown} from '@solar-icons/react-native/Linear';
import {QuranSurahPickerList} from '@/components/shared/QuranSurahPickerList';
import {getSurahs} from '@/services/quranContentService';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {Surah} from '@/types/quran';

interface QuranGoToSheetProps {
  currentSurahNumber: number;
  onOpen: (surahNumber: number, ayahNumber: number) => void;
}

export const QuranGoToSheet = forwardRef<
  BottomSheetModal,
  QuranGoToSheetProps
>(function QuranGoToSheetComponent(
  {currentSurahNumber, onOpen},
  ref,
): React.JSX.Element {
  const surahs = getSurahs();
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(
    surahs.find(s => s.number === currentSurahNumber) ?? null,
  );
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [ayahInput, setAyahInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    [],
  );

  function handleSelectSurah(surah: Surah): void {
    setSelectedSurah(surah);
    setIsPickerOpen(false);
    // Target ayat direset karena batas maksimalnya ikut berubah.
    setAyahInput('');
    setError(null);
  }

  function handleOpen(): void {
    if (!selectedSurah) {
      setError('Pilih surah terlebih dahulu');
      return;
    }
    // Ayat opsional — kosong berarti mulai dari ayat 1.
    if (!ayahInput.trim()) {
      onOpen(selectedSurah.number, 1);
      return;
    }
    const ayahNumber = Number(ayahInput.replace(/\D/g, ''));
    if (!ayahNumber || ayahNumber < 1) {
      setError('Nomor ayat tidak valid');
      return;
    }
    if (ayahNumber > selectedSurah.totalAyah) {
      setError(`Surah ini hanya punya ${selectedSurah.totalAyah} ayat`);
      return;
    }
    onOpen(selectedSurah.number, ayahNumber);
  }

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={['70%']}
      backdropComponent={renderBackdrop}>
      <BottomSheetScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Pergi ke</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Surah</Text>
          <TouchableOpacity
            style={styles.select}
            onPress={() => setIsPickerOpen(open => !open)}
            accessibilityRole="button"
            accessibilityLabel={
              selectedSurah
                ? `Surah terpilih ${selectedSurah.nameLatin}`
                : 'Pilih surah'
            }>
            <Text style={styles.selectLabel} numberOfLines={1}>
              {selectedSurah ? selectedSurah.nameLatin : 'Pilih surah'}
            </Text>
            <Icon icon={AltArrowDown} size={18} color={colors.neutral[600]} />
          </TouchableOpacity>
        </View>

        {isPickerOpen ? (
          <View style={styles.picker}>
            <QuranSurahPickerList
              selectedSurahNumber={selectedSurah?.number ?? null}
              onSelect={handleSelectSurah}
            />
          </View>
        ) : null}

        <View style={styles.field}>
          <Text style={styles.label}>Ayat (opsional)</Text>
          <TextInput
            style={styles.input}
            value={ayahInput}
            onChangeText={value => {
              setAyahInput(value);
              setError(null);
            }}
            placeholder="1"
            placeholderTextColor={colors.neutral[400]}
            keyboardType="number-pad"
            accessibilityLabel="Nomor ayat"
          />
          {selectedSurah ? (
            <Text style={styles.helper}>
              dari {selectedSurah.totalAyah} ayat
            </Text>
          ) : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>

        <Button label="Buka" onPress={handleOpen} />
        <View style={styles.bottomSpacer} />
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.lg,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[600],
  },
  select: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  selectLabel: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.neutral[900],
  },
  picker: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    paddingVertical: spacing.xs,
  },
  input: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    fontSize: fontSize.md,
    color: colors.neutral[900],
  },
  helper: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
  },
  error: {
    fontSize: fontSize.sm,
    color: colors.semantic.error,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});
