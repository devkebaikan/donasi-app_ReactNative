import React, {useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {BottomSheetModal} from '@gorhom/bottom-sheet';
import {Icon} from '@/components/ui/Icon';
import {AltArrowDown, Calendar} from '@solar-icons/react-native/Linear';
import {Button} from '@/components/ui/Button';
import {HeaderLight} from '@/components/shared/HeaderLight';
import {QuranDatePickerSheet} from '@/components/shared/QuranDatePickerSheet';
import {QuranSurahPickerSheet} from '@/components/shared/QuranSurahPickerSheet';
import {QuranRepeatSelector} from '@/components/shared/QuranRepeatSelector';
import {useQuranScheduleForm} from '@/hooks/useQuranScheduleForm';
import type {RootStackNavigationProp, RootStackParamList} from '@/types/navigation';
import type {Surah} from '@/types/quran';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

function formatDateLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  if (!year || !month || !day) {
    return 'Pilih tanggal';
  }
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

function QuranScheduleFormScreen(): React.JSX.Element {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'QuranScheduleForm'>>();
  const insets = useSafeAreaInsets();
  const datePickerRef = useRef<BottomSheetModal>(null);
  const surahPickerRef = useRef<BottomSheetModal>(null);

  const {
    isEditMode,
    isLoading,
    date,
    surah,
    targetAyah,
    repeat,
    fieldErrors,
    isSaving,
    today,
    setDate,
    selectSurah,
    setTargetAyah,
    setRepeat,
    submit,
  } = useQuranScheduleForm(route.params?.scheduleId);

  function handleBack(): void {
    navigation.goBack();
  }

  function handleSelectDate(value: string): void {
    setDate(value);
    datePickerRef.current?.dismiss();
  }

  function handleSelectSurah(value: Surah): void {
    selectSurah(value);
    surahPickerRef.current?.dismiss();
  }

  async function handleSubmit(): Promise<void> {
    const success = await submit();
    if (success) {
      navigation.goBack();
    }
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <HeaderLight title="Ubah Jadwal" onBack={handleBack} />
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary[500]} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderLight
        title={isEditMode ? 'Ubah Jadwal' : 'Tambah Jadwal'}
        onBack={handleBack}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.field}>
          <Text style={styles.label}>Tanggal</Text>
          <TouchableOpacity
            style={[styles.select, fieldErrors.date ? styles.inputError : null]}
            onPress={() => datePickerRef.current?.present()}
            accessibilityRole="button"
            accessibilityLabel={`Tanggal, ${formatDateLabel(date)}`}>
            <Text style={styles.selectLabel}>{formatDateLabel(date)}</Text>
            <Icon icon={Calendar} size={20} color={colors.neutral[600]} />
          </TouchableOpacity>
          {fieldErrors.date ? (
            <Text style={styles.error}>{fieldErrors.date}</Text>
          ) : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Surah</Text>
          <TouchableOpacity
            style={[
              styles.select,
              fieldErrors.surahNumber ? styles.inputError : null,
            ]}
            onPress={() => surahPickerRef.current?.present()}
            accessibilityRole="button"
            accessibilityLabel={
              surah ? `Surah ${surah.nameLatin}` : 'Pilih surah'
            }>
            <Text
              style={[styles.selectLabel, !surah && styles.placeholder]}
              numberOfLines={1}>
              {surah ? surah.nameLatin : 'Pilih surah'}
            </Text>
            <Icon icon={AltArrowDown} size={20} color={colors.neutral[600]} />
          </TouchableOpacity>
          {fieldErrors.surahNumber ? (
            <Text style={styles.error}>{fieldErrors.surahNumber}</Text>
          ) : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Target sampai ayat</Text>
          <TextInput
            style={[
              styles.input,
              fieldErrors.targetAyah ? styles.inputError : null,
            ]}
            value={targetAyah}
            onChangeText={setTargetAyah}
            placeholder="1"
            placeholderTextColor={colors.neutral[400]}
            keyboardType="number-pad"
            accessibilityLabel="Target sampai ayat"
          />
          {surah ? (
            <Text style={styles.helper}>dari {surah.totalAyah} ayat</Text>
          ) : null}
          {fieldErrors.targetAyah ? (
            <Text style={styles.error}>{fieldErrors.targetAyah}</Text>
          ) : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Pengulangan</Text>
          <QuranRepeatSelector value={repeat} onChange={setRepeat} />
        </View>
      </ScrollView>

      <View style={[styles.footer, {paddingBottom: insets.bottom + spacing.md}]}>
        {/* Tombol tidak pernah disabled saat form kosong — hanya saat proses
            simpan berjalan. Validasi jalan ketika tombol ditekan. */}
        <Button label="Simpan" onPress={handleSubmit} isLoading={isSaving} />
      </View>

      <QuranDatePickerSheet
        ref={datePickerRef}
        value={date}
        minDate={isEditMode ? undefined : today}
        onSelect={handleSelectDate}
      />

      <QuranSurahPickerSheet
        ref={surahPickerRef}
        selectedSurahNumber={surah?.number ?? null}
        onSelect={handleSelectSurah}
      />
    </View>
  );
}

export default QuranScheduleFormScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[0],
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    padding: spacing.lg,
    gap: spacing.xl,
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
  placeholder: {
    fontWeight: fontWeight.regular,
    color: colors.neutral[400],
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
  inputError: {
    borderColor: colors.semantic.error,
  },
  helper: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
  },
  error: {
    fontSize: fontSize.sm,
    color: colors.semantic.error,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
});
