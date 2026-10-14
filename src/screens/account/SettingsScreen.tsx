import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {TrashBinMinimalistic} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {HeaderLight} from '@/components/shared/HeaderLight';
import {PrayerSettingRow} from '@/components/shared/PrayerSettingRow';
import {PrayerSettingToggleRow} from '@/components/shared/PrayerSettingToggleRow';
import {PrayerSettingSelectRow} from '@/components/shared/PrayerSettingSelectRow';
import {PrayerOptionSheet} from '@/components/shared/PrayerOptionSheet';
import {FontSizeSelector} from '@/components/shared/FontSizeSelector';
import {QuranConfirmDialog} from '@/components/shared/QuranConfirmDialog';
import {useSettings} from '@/hooks/useSettings';
import {
  REMINDER_FREQUENCY_OPTIONS,
  REMINDER_TIME_OPTIONS,
  findReminderFrequencyLabel,
  formatReminderTime,
} from '@/utils/donationReminder';
import {formatDataSize} from '@/utils/formatDataSize';
import {showToast} from '@/utils/toast';
import {colors, spacing, fontSize, fontWeight} from '@/theme';

type OpenSheet = 'frequency' | 'time' | null;

export default function SettingsScreen(): React.JSX.Element {
  const navigation = useNavigation();
  const [openSheet, setOpenSheet] = useState<OpenSheet>(null);

  const {
    appFontSize,
    isHideName,
    isHideNominal,
    isContactable,
    isReminderEnabled,
    reminderFrequency,
    reminderTime,
    quranDataSize,
    isClearDialogOpen,
    isClearingQuranData,
    setAppFontSize,
    toggleHideName,
    toggleHideNominal,
    toggleContactable,
    toggleReminder,
    changeReminderFrequency,
    changeReminderTime,
    openClearDialog,
    closeClearDialog,
    confirmClearQuranData,
  } = useSettings();

  const quranDataDescription =
    quranDataSize == null
      ? 'Posisi baca dan riwayat pencarian di perangkat ini'
      : `${formatDataSize(quranDataSize)} — posisi baca dan riwayat pencarian`;

  function closeSheet(): void {
    setOpenSheet(null);
  }

  return (
    <View style={styles.root}>
      <HeaderLight title="Pengaturan" onBack={() => navigation.goBack()} />

      {/* Tidak ada tombol simpan: tiap perubahan langsung berlaku dan langsung
          dikirim, pola yang sama dengan Pengaturan Quran dan Jadwal Sholat. */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Tampilan</Text>
        <FontSizeSelector value={appFontSize} onChange={setAppFontSize} />

        <Text style={styles.sectionTitle}>Donasi</Text>
        <PrayerSettingToggleRow
          label="Sembunyikan nama saya"
          description="Donasi saya tampil atas nama Hamba Allah"
          value={isHideName}
          onChange={toggleHideName}
        />
        <PrayerSettingToggleRow
          label="Sembunyikan nominal donasi"
          description="Nominal donasi saya tampil sebagai Rp ***"
          value={isHideNominal}
          onChange={toggleHideNominal}
        />
        <PrayerSettingToggleRow
          label="Bersedia dihubungi"
          description="Saya bersedia dihubungi untuk informasi program dan laporan penyaluran"
          value={isContactable}
          onChange={toggleContactable}
        />

        <Text style={styles.sectionTitle}>Pengingat Donasi</Text>
        <PrayerSettingToggleRow
          label="Pengingat donasi"
          description="Kirim saya notifikasi pengingat berdonasi"
          value={isReminderEnabled}
          onChange={toggleReminder}
        />
        {/* Baris jadwal hanya muncul saat pengingat menyala — mengatur jam
            pengingat yang mati tidak berarti apa-apa. */}
        {isReminderEnabled ? (
          <>
            <PrayerSettingSelectRow
              label="Frekuensi"
              value={findReminderFrequencyLabel(reminderFrequency)}
              onPress={() => setOpenSheet('frequency')}
            />
            <PrayerSettingSelectRow
              label="Pukul"
              value={formatReminderTime(reminderTime)}
              onPress={() => setOpenSheet('time')}
            />
          </>
        ) : null}

        <Text style={styles.sectionTitle}>Data Quran, Hadits & Do'a</Text>
        {/* Teks mushaf ikut di dalam aplikasi (ADR-003), jadi yang bisa
            dibebaskan hanya jejak pemakaian — bukan 13 MB isi mushafnya. */}
        <PrayerSettingRow
          label="Data Quran"
          description={quranDataDescription}
          rightSlot={
            <TouchableOpacity
              style={styles.iconButton}
              onPress={openClearDialog}
              accessibilityRole="button"
              accessibilityLabel="Hapus data Quran di perangkat ini"
            >
              <Icon
                icon={TrashBinMinimalistic}
                size={22}
                color={colors.semantic.error}
              />
            </TouchableOpacity>
          }
        />

        <Text style={styles.sectionTitle}>Akun</Text>
        <TouchableOpacity
          style={styles.dangerRow}
          onPress={() => showToast('Segera hadir')}
          accessibilityRole="button"
          accessibilityLabel="Hapus akun saya"
        >
          <Text style={styles.dangerLabel}>Hapus akun saya</Text>
        </TouchableOpacity>
      </ScrollView>

      <PrayerOptionSheet
        title="Frekuensi Pengingat"
        isOpen={openSheet === 'frequency'}
        options={REMINDER_FREQUENCY_OPTIONS.map(option => ({
          value: option.value,
          label: option.label,
          description: option.description,
        }))}
        selectedValue={reminderFrequency}
        onSelect={value => {
          changeReminderFrequency(value);
          closeSheet();
        }}
        onClose={closeSheet}
      />

      <PrayerOptionSheet
        title="Jam Pengingat"
        isOpen={openSheet === 'time'}
        options={REMINDER_TIME_OPTIONS.map(time => ({
          value: time,
          label: formatReminderTime(time),
          description: null,
        }))}
        selectedValue={reminderTime}
        onSelect={value => {
          changeReminderTime(value);
          closeSheet();
        }}
        onClose={closeSheet}
      />

      <QuranConfirmDialog
        visible={isClearDialogOpen}
        title="Hapus data Quran di perangkat ini?"
        description="Posisi baca terakhir dan riwayat pencarian akan hilang. Progres challenge dan target baca tersimpan di server, jadi tidak ikut terhapus."
        confirmLabel="Hapus"
        isLoading={isClearingQuranData}
        onConfirm={confirmClearQuranData}
        onCancel={closeClearDialog}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.neutral[0],
  },
  scroll: {
    paddingBottom: spacing['2xl'],
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[500],
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  iconButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerRow: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral[200],
  },
  dangerLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.semantic.error,
  },
});
