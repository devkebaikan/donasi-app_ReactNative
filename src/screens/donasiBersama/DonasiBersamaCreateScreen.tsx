import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {BottomSheetModal} from '@gorhom/bottom-sheet';
import {
  AltArrowDown,
  CalendarMinimalistic,
} from '@solar-icons/react-native/Linear';
import {HeaderLight} from '@/components/shared/HeaderLight';
import {PrayerOptionSheet} from '@/components/shared/PrayerOptionSheet';
import {PrayerSettingToggleRow} from '@/components/shared/PrayerSettingToggleRow';
import {QuranDatePickerSheet} from '@/components/shared/QuranDatePickerSheet';
import {DonasiBersamaCoverPicker} from '@/components/shared/DonasiBersamaCoverPicker';
import {DonasiBersamaWeekDayPicker} from '@/components/shared/DonasiBersamaWeekDayPicker';
import {Button} from '@/components/ui/Button';
import {Icon} from '@/components/ui/Icon';
import {useCreateDonasiBersama} from '@/hooks/useCreateDonasiBersama';
import {formatDate} from '@/utils/formatDate';
import {formatNumberWithSeparator} from '@/utils/formatCurrency';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import {useDonasiBersamaDetail} from '@/hooks/useDonasiBersamaDetail';
import type {
  RootStackNavigationProp,
  RootStackParamList,
} from '@/types/navigation';
import type {ReminderFrequency} from '@/types/donasiBersama';

const FREQUENCY_OPTIONS: {value: ReminderFrequency; label: string}[] = [
  {value: 'daily', label: 'Setiap Hari'},
  {value: 'weekly', label: 'Mingguan'},
  {value: 'monthly', label: 'Bulanan'},
];

export default function DonasiBersamaCreateScreen(): React.JSX.Element {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'DonasiBersamaCreate'>>();
  const editGroupId = route.params?.groupId;
  const insets = useSafeAreaInsets();
  const datePickerRef = useRef<BottomSheetModal>(null);
  const [isProgramSheetOpen, setIsProgramSheetOpen] = useState(false);

  // Detail hanya dimuat di mode ubah. Hook-nya sama dengan yang dipakai
  // halaman detail, jadi biasanya sudah ada di cache dan tidak ada request
  // tambahan.
  const {group} = useDonasiBersamaDetail(editGroupId ?? '', {
    enabled: Boolean(editGroupId),
  });
  const editGroup = editGroupId ? group : null;

  const {
    isEditMode,
    localCoverUri,
    coverImageUrl,
    isUploadingCover,
    name,
    programId,
    programTitle,
    programOptions,
    isLoadingPrograms,
    targetAmount,
    deadline,
    isPublic,
    reminderEnabled,
    reminderFrequency,
    reminderWeekDay,
    reminderTime,
    fieldErrors,
    isSubmitting,
    minDeadline,
    pickCover,
    setName,
    selectProgram,
    loadPrograms,
    setTargetAmount,
    setDeadline,
    setIsPublic,
    setReminderEnabled,
    setReminderFrequency,
    setReminderWeekDay,
    setReminderHour,
    setReminderMinute,
    submit,
  } = useCreateDonasiBersama({group: editGroup});

  const [hour = '05', minute = '00'] = reminderTime.split(':');

  function handleBack(): void {
    navigation.goBack();
  }

  // Daftar dimuat DULU baru sheet dibuka — PrayerOptionSheet tidak punya
  // state loading sendiri, jadi membukanya lebih awal berarti pengguna melihat
  // sheet kosong sesaat. Baris select yang menampilkan status memuatnya.
  async function handleOpenProgramSheet(): Promise<void> {
    await loadPrograms();
    setIsProgramSheetOpen(true);
  }

  async function handleSubmit(): Promise<void> {
    const saved = await submit();
    if (!saved) {
      return;
    }
    if (isEditMode) {
      // Mengubah grup kembali ke detail yang sudah ada, bukan ke layar hasil —
      // tidak ada yang "baru dibuat" untuk dirayakan.
      navigation.goBack();
      return;
    }
    // replace supaya back dari screen sukses tidak kembali ke form yang sudah
    // tidak relevan.
    navigation.replace('DonasiBersamaSukses', {
      groupId: saved.id,
      groupName: saved.name,
      targetAmount: saved.targetAmount,
      coverImageUrl: saved.coverImageUrl,
    });
  }

  return (
    <View style={styles.container}>
      <HeaderLight
        title={isEditMode ? 'Ubah Grup' : 'Buat Grup'}
        onBack={handleBack}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <DonasiBersamaCoverPicker
            uri={localCoverUri ?? coverImageUrl}
            isUploading={isUploadingCover}
            onPress={pickCover}
          />

          <View style={styles.field}>
            <Text style={styles.label}>Nama Grup</Text>
            <TextInput
              style={[styles.input, fieldErrors.name ? styles.inputError : null]}
              value={name}
              onChangeText={setName}
              placeholder="Misal: Donasi Tahajud Bersama"
              placeholderTextColor={colors.neutral[400]}
              accessibilityLabel="Nama grup"
            />
            {fieldErrors.name ? (
              <Text style={styles.error}>{fieldErrors.name}</Text>
            ) : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Pilih Program</Text>
            <TouchableOpacity
              style={[
                styles.select,
                fieldErrors.programId ? styles.inputError : null,
              ]}
              onPress={handleOpenProgramSheet}
              disabled={isLoadingPrograms}
              accessibilityRole="button"
              accessibilityLabel={
                programTitle ? `Program ${programTitle}` : 'Pilih program'
              }>
              <Text
                style={[styles.selectLabel, !programTitle && styles.placeholder]}
                numberOfLines={1}>
                {isLoadingPrograms
                  ? 'Memuat program...'
                  : (programTitle ?? 'Pilih program')}
              </Text>
              <Icon icon={AltArrowDown} size={20} color={colors.neutral[600]} />
            </TouchableOpacity>
            {fieldErrors.programId ? (
              <Text style={styles.error}>{fieldErrors.programId}</Text>
            ) : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Target Nominal</Text>
            <View
              style={[
                styles.amountField,
                fieldErrors.targetAmount ? styles.inputError : null,
              ]}>
              <Text style={styles.amountPrefix}>Rp</Text>
              <TextInput
                style={styles.amountInput}
                value={targetAmount ? formatNumberWithSeparator(targetAmount) : ''}
                onChangeText={setTargetAmount}
                placeholder="0"
                placeholderTextColor={colors.neutral[400]}
                keyboardType="number-pad"
                accessibilityLabel="Target nominal"
              />
            </View>
            {fieldErrors.targetAmount ? (
              <Text style={styles.error}>{fieldErrors.targetAmount}</Text>
            ) : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Durasi / Deadline</Text>
            <TouchableOpacity
              style={[
                styles.select,
                fieldErrors.deadline ? styles.inputError : null,
              ]}
              onPress={() => datePickerRef.current?.present()}
              accessibilityRole="button"
              accessibilityLabel={
                deadline ? `Tenggat ${formatDate(deadline)}` : 'Pilih tenggat'
              }>
              <Text
                style={[styles.selectLabel, !deadline && styles.placeholder]}>
                {deadline ? formatDate(deadline) : 'Pilih tenggat'}
              </Text>
              <Icon
                icon={CalendarMinimalistic}
                size={20}
                color={colors.neutral[600]}
              />
            </TouchableOpacity>
            {fieldErrors.deadline ? (
              <Text style={styles.error}>{fieldErrors.deadline}</Text>
            ) : null}
          </View>

          <PrayerSettingToggleRow
            label="Grup Publik"
            description="Izinkan orang lain melihat dan bergabung"
            value={isPublic}
            onChange={setIsPublic}
          />

          <View style={styles.divider} />

          <PrayerSettingToggleRow
            label="Pengaturan Pengingat Urunan"
            description="Kirim notifikasi otomatis ke anggota grup"
            value={reminderEnabled}
            onChange={setReminderEnabled}
          />

          {reminderEnabled ? (
            <>
              <View style={styles.field}>
                <Text style={styles.label}>Frekuensi</Text>
                <View style={styles.chipRow}>
                  {FREQUENCY_OPTIONS.map(option => {
                    const isSelected = reminderFrequency === option.value;
                    return (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.frequencyChip,
                          isSelected && styles.frequencyChipSelected,
                        ]}
                        onPress={() => setReminderFrequency(option.value)}
                        accessibilityRole="radio"
                        accessibilityLabel={option.label}
                        accessibilityState={{selected: isSelected}}>
                        <Text
                          style={[
                            styles.frequencyLabel,
                            isSelected && styles.frequencyLabelSelected,
                          ]}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {reminderFrequency === 'weekly' ? (
                <View style={styles.field}>
                  <Text style={styles.label}>Pilih Hari</Text>
                  <DonasiBersamaWeekDayPicker
                    value={reminderWeekDay}
                    onChange={setReminderWeekDay}
                  />
                  {fieldErrors.reminderWeekDay ? (
                    <Text style={styles.error}>
                      {fieldErrors.reminderWeekDay}
                    </Text>
                  ) : null}
                </View>
              ) : null}

              <View style={styles.field}>
                <Text style={styles.label}>Waktu Pengingat</Text>
                <View style={styles.timeRow}>
                  <TextInput
                    style={styles.timeInput}
                    value={hour}
                    onChangeText={value =>
                      setReminderHour(Number(value.replace(/\D/g, '') || 0))
                    }
                    keyboardType="number-pad"
                    maxLength={2}
                    accessibilityLabel="Jam pengingat"
                  />
                  <Text style={styles.timeSeparator}>:</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={minute}
                    onChangeText={value =>
                      setReminderMinute(Number(value.replace(/\D/g, '') || 0))
                    }
                    keyboardType="number-pad"
                    maxLength={2}
                    accessibilityLabel="Menit pengingat"
                  />
                </View>
                {/* Fase ini pengaturan hanya disimpan — belum ada penjadwalan
                    notifikasi lokal di project ini. */}
                <Text style={styles.helper}>
                  Pengingat baru tersimpan sebagai pengaturan grup.
                </Text>
              </View>
            </>
          ) : null}
        </ScrollView>

        <View
          style={[styles.footer, {paddingBottom: insets.bottom + spacing.md}]}>
          {/* Tombol tidak pernah disabled saat form kosong — hanya saat proses
              simpan berjalan. Validasi jalan ketika tombol ditekan. */}
          <Button
            label={isEditMode ? 'Simpan Perubahan' : 'Buat Grup Sekarang'}
            onPress={handleSubmit}
            isLoading={isSubmitting}
          />
        </View>
      </KeyboardAvoidingView>

      <QuranDatePickerSheet
        ref={datePickerRef}
        value={deadline || minDeadline}
        minDate={minDeadline}
        onSelect={setDeadline}
      />

      <PrayerOptionSheet
        title="Pilih Program"
        isOpen={isProgramSheetOpen}
        options={programOptions.map(option => ({
          value: option.id,
          label: option.title,
          description: null,
        }))}
        selectedValue={programId ?? ''}
        onSelect={selectProgram}
        onClose={() => setIsProgramSheetOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[0],
  },
  flex: {
    flex: 1,
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
  input: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    fontSize: fontSize.md,
    color: colors.neutral[900],
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
  amountField: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  amountPrefix: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.neutral[500],
  },
  amountInput: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
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
  divider: {
    height: 1,
    backgroundColor: colors.neutral[100],
  },
  // Gaya chip pemilih di dalam form mengikuti JadwalPicker — outline,
  // membagi lebar rata, terpilih ditandai latar primary lembut.
  chipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  frequencyChip: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.lg,
  },
  frequencyChipSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  frequencyLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[600],
  },
  frequencyLabelSelected: {
    color: colors.primary[700],
    fontWeight: fontWeight.semiBold,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  timeInput: {
    width: 64,
    minHeight: 44,
    textAlign: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  timeSeparator: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[500],
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
});
