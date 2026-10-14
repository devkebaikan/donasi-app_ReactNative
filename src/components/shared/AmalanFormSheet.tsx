import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet,
} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import type {BottomSheetBackdropProps} from '@gorhom/bottom-sheet';
import {
  Alarm,
  AltArrowDown,
  ChecklistMinimalistic,
  ClockCircle,
  Pen,
} from '@solar-icons/react-native/Linear';
import {Icon, type SolarIconComponent} from '@/components/ui/Icon';
import {Button} from '@/components/ui/Button';
import {
  PrayerOptionSheet,
  type PrayerSheetOption,
} from '@/components/shared/PrayerOptionSheet';
import {colors, fontWeight, fontSize, radius, spacing} from '@/theme';
import type {
  AmalanPayload,
  AmalanPreset,
  AmalanSheetMode,
} from '@/types/amalan';

export const AMALAN_NOTE_MAX_LENGTH = 200;

// Empat field + baris tombol. Isinya tetap di dalam BottomSheetScrollView, jadi
// layar pendek atau keyboard terbuka tinggal ikut scroll.
const SNAP_POINTS = ['85%'];

interface AmalanFormSheetProps {
  isOpen: boolean;
  mode: AmalanSheetMode | null;
  date: string;
  presets: AmalanPreset[];
  isPresetsError: boolean;
  onRetryPresets: () => void;
  onSubmit: (payload: AmalanPayload) => void;
  isSubmitting: boolean;
  fieldErrors: Record<string, string>;
  onClose: () => void;
}

function FieldLabel({
  icon,
  label,
}: {
  icon: SolarIconComponent;
  label: string;
}): React.JSX.Element {
  return (
    <View style={styles.labelRow}>
      <Icon icon={icon} size={16} color={colors.neutral[500]} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function AmalanFormSheet({
  isOpen,
  mode,
  date,
  presets,
  isPresetsError,
  onRetryPresets,
  onSubmit,
  isSubmitting,
  fieldErrors,
  onClose,
}: AmalanFormSheetProps): React.JSX.Element {
  const sheetRef = useRef<BottomSheetModal>(null);
  // Dipakai untuk menahan dismiss() sebelum sheet pernah present. Di gorhom
  // 5.2, handleDismiss TIDAK meng-early-exit saat status masih INITIAL: ia
  // mengunci status jadi DISMISSING, dan handlePortalRender menolak merender
  // sheet apa pun selama status itu. Akibatnya present() berikutnya tidak
  // pernah muncul di layar. (handlePortalOnUnmount menjaga INITIAL, dismiss
  // tidak — lihat node_modules/@gorhom/bottom-sheet/src/components/
  // bottomSheetModal/BottomSheetModal.tsx.)
  const hasPresentedRef = useRef(false);

  // Setelah sheet benar-benar tertutup, gorhom memanggil unmount() yang
  // mengembalikan statusnya ke INITIAL. Kalau penanda ini tidak ikut direset,
  // effect di bawah akan memanggil dismiss() sekali lagi pada sheet yang sudah
  // tertutup — dan dismiss() saat INITIAL mengunci status di DISMISSING, jadi
  // sheet tidak akan pernah bisa dibuka untuk kedua kalinya.
  const handleDismissed = useCallback(() => {
    hasPresentedRef.current = false;
    onClose();
  }, [onClose]);

  // Jam & menit disimpan sebagai string, bukan number: memaksanya ke number
  // membuat keadaan setengah ketik ("" / "0") berubah jadi NaN atau 0 lalu
  // memantul balik ke input dan menghapus ketikan pengguna. Konversi cuma
  // sekali, saat submit.
  const [presetSlug, setPresetSlug] = useState<string | null>(null);
  const [hour, setHour] = useState('00');
  const [minute, setMinute] = useState('00');
  const [note, setNote] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [isPresetSheetOpen, setIsPresetSheetOpen] = useState(false);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  const errors = {...localErrors, ...fieldErrors};
  // Server memakai kunci `time` (nama field payload), validasi client memakai
  // `hour`/`minute`. Border kedua input ikut disorot untuk ketiganya.
  const hourError = errors.hour ?? errors.time;
  const minuteError = errors.minute ?? errors.time;

  // Reset saat sheet DIBUKA, bukan saat ditutup — reset saat menutup membuat
  // isi field berkedip kosong selama animasi turun.
  useEffect(() => {
    if (!isOpen || !mode) {
      return;
    }
    setLocalErrors({});
    setIsPresetSheetOpen(false);
    if (mode.type === 'edit') {
      const [editHour = '00', editMinute = '00'] = mode.amalan.time.split(':');
      setPresetSlug(mode.amalan.presetSlug);
      setHour(editHour);
      setMinute(editMinute);
      setNote(mode.amalan.note ?? '');
      setReminderEnabled(mode.amalan.reminderEnabled);
      return;
    }
    // Mode tambah: waktu sekarang jadi tebakan awal. Pengguna hampir selalu
    // mencatat sesuatu yang baru saja dikerjakan, jadi tebakan ini lebih sering
    // benar daripada field kosong — dan tetap bisa diubah.
    const now = new Date();
    setPresetSlug(null);
    setHour(pad(now.getHours()));
    setMinute(pad(now.getMinutes()));
    setNote('');
    setReminderEnabled(false);
  }, [isOpen, mode]);

  useEffect(() => {
    if (isOpen) {
      hasPresentedRef.current = true;
      sheetRef.current?.present();
      return;
    }
    if (hasPresentedRef.current) {
      sheetRef.current?.dismiss();
    }
  }, [isOpen]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        // Selagi menyimpan, backdrop tidak menutup sheet — supaya tidak ada
        // request yang selesai ke sheet yang sudah hilang.
        pressBehavior={isSubmitting ? 'none' : 'close'}
      />
    ),
    [isSubmitting],
  );

  const selectedPreset = presets.find(item => item.slug === presetSlug) ?? null;
  // Daftar kosong diperlakukan sama dengan gagal dimuat: membuka sheet pilihan
  // yang kosong tanpa penjelasan lebih membingungkan daripada pesan error.
  const isPresetsUnavailable = isPresetsError || presets.length === 0;

  const presetOptions: PrayerSheetOption<string>[] = presets.map(preset => ({
    value: preset.slug,
    label: preset.label,
    description: null,
  }));

  function handleChangeHour(value: string): void {
    setHour(value.replace(/[^0-9]/g, ''));
  }

  function handleChangeMinute(value: string): void {
    setMinute(value.replace(/[^0-9]/g, ''));
  }

  // Clamp saat blur, bukan saat mengetik: kalau di-clamp tiap ketukan, "5"
  // menuju "59" langsung melompat jadi "05" dan kursor berpindah.
  function handleBlurHour(): void {
    setHour(hour === '' ? '' : pad(clamp(Number(hour), 0, 23)));
  }

  function handleBlurMinute(): void {
    setMinute(minute === '' ? '' : pad(clamp(Number(minute), 0, 59)));
  }

  function validate(): Record<string, string> {
    const nextErrors: Record<string, string> = {};
    if (!presetSlug) {
      nextErrors.presetSlug = 'Pilih jenis amalan';
    }
    const hourNumber = Number(hour);
    if (hour === '' || Number.isNaN(hourNumber) || hourNumber < 0 || hourNumber > 23) {
      nextErrors.hour = 'Jam harus 00 sampai 23';
    }
    const minuteNumber = Number(minute);
    if (
      minute === '' ||
      Number.isNaN(minuteNumber) ||
      minuteNumber < 0 ||
      minuteNumber > 59
    ) {
      nextErrors.minute = 'Menit harus 00 sampai 59';
    }
    if (note.trim().length > AMALAN_NOTE_MAX_LENGTH) {
      nextErrors.note = `Catatan maksimal ${AMALAN_NOTE_MAX_LENGTH} karakter`;
    }
    return nextErrors;
  }

  function handleSubmit(): void {
    // Seluruh field divalidasi sekaligus, bukan berhenti di error pertama.
    const nextErrors = validate();
    setLocalErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !presetSlug) {
      return;
    }
    const trimmedNote = note.trim();
    onSubmit({
      date,
      presetSlug,
      time: `${pad(Number(hour))}:${pad(Number(minute))}`,
      // Catatan kosong dikirim null, bukan "" — supaya null jadi satu-satunya
      // arti "tidak ada catatan".
      note: trimmedNote === '' ? null : trimmedNote,
      reminderEnabled,
    });
  }

  function handleClose(): void {
    if (isSubmitting) {
      return;
    }
    onClose();
  }

  const isEditing = mode?.type === 'edit';

  return (
    <>
      <BottomSheetModal
        ref={sheetRef}
        // snapPoints eksplisit + enableDynamicSizing={false} — alasan yang sama
        // dengan AmalanActionSheet. Tinggi dipatok supaya empat field + tombol
        // muat tanpa bergantung pada pengukuran konten.
        snapPoints={SNAP_POINTS}
        enableDynamicSizing={false}
        enablePanDownToClose={!isSubmitting}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        onDismiss={handleDismissed}
        backdropComponent={renderBackdrop}>
        <BottomSheetScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.sheetTitle}>
            {isEditing ? 'Ubah Amalan' : 'Tambah Amalan'}
          </Text>

          <View style={styles.field}>
            <FieldLabel icon={ChecklistMinimalistic} label="Jenis Amalan" />
            <TouchableOpacity
              style={[
                styles.trigger,
                errors.presetSlug ? styles.inputError : null,
              ]}
              onPress={() =>
                isPresetsUnavailable
                  ? onRetryPresets()
                  : setIsPresetSheetOpen(true)
              }
              accessibilityRole="button"
              accessibilityLabel={
                selectedPreset
                  ? `Jenis amalan, ${selectedPreset.label}`
                  : 'Jenis amalan, belum dipilih'
              }>
              <Text
                style={[
                  styles.triggerText,
                  !selectedPreset && styles.triggerPlaceholder,
                ]}>
                {isPresetsUnavailable
                  ? 'Jenis amalan gagal dimuat'
                  : selectedPreset?.label ?? 'Pilih jenis amalan'}
              </Text>
              <Icon icon={AltArrowDown} size={20} color={colors.neutral[500]} />
            </TouchableOpacity>
            {errors.presetSlug ? (
              <Text style={styles.errorText}>{errors.presetSlug}</Text>
            ) : null}
          </View>

          <View style={styles.field}>
            <FieldLabel icon={ClockCircle} label="Waktu" />
            <View
              style={styles.timeRow}
              accessible={false}
              accessibilityLabel="Waktu amalan">
              <View style={styles.timeColumn}>
                <TextInput
                  style={[
                    styles.timeInput,
                    hourError ? styles.inputError : null,
                  ]}
                  value={hour}
                  onChangeText={handleChangeHour}
                  onBlur={handleBlurHour}
                  keyboardType="number-pad"
                  maxLength={2}
                  accessibilityLabel="Jam"
                />
                <Text style={styles.timeCaption}>Jam</Text>
              </View>
              <Text style={styles.timeSeparator}>.</Text>
              <View style={styles.timeColumn}>
                <TextInput
                  style={[
                    styles.timeInput,
                    minuteError ? styles.inputError : null,
                  ]}
                  value={minute}
                  onChangeText={handleChangeMinute}
                  onBlur={handleBlurMinute}
                  keyboardType="number-pad"
                  maxLength={2}
                  accessibilityLabel="Menit"
                />
                <Text style={styles.timeCaption}>Menit</Text>
              </View>
            </View>
            {hourError || minuteError ? (
              <Text style={styles.errorText}>{hourError ?? minuteError}</Text>
            ) : null}
          </View>

          <View style={styles.field}>
            <FieldLabel icon={Pen} label="Catatan" />
            <TextInput
              style={[
                styles.noteInput,
                errors.note ? styles.inputError : null,
              ]}
              value={note}
              onChangeText={setNote}
              placeholder="Tulis catatan singkat (opsional)"
              placeholderTextColor={colors.neutral[400]}
              multiline
              maxLength={AMALAN_NOTE_MAX_LENGTH}
              textAlignVertical="top"
              accessibilityLabel="Catatan amalan"
            />
            <Text
              style={[
                styles.counter,
                note.length >= AMALAN_NOTE_MAX_LENGTH && styles.counterMax,
              ]}>
              {note.length}/{AMALAN_NOTE_MAX_LENGTH}
            </Text>
            {errors.note ? (
              <Text style={styles.errorText}>{errors.note}</Text>
            ) : null}
          </View>

          <View style={styles.field}>
            <View style={styles.reminderRow}>
              <FieldLabel icon={Alarm} label="Pengingat" />
              <Switch
                value={reminderEnabled}
                onValueChange={setReminderEnabled}
                trackColor={{
                  false: colors.neutral[300],
                  true: colors.primary[300],
                }}
                thumbColor={
                  reminderEnabled ? colors.primary[500] : colors.neutral[0]
                }
                accessibilityRole="switch"
                accessibilityState={{checked: reminderEnabled}}
                accessibilityLabel="Pengingat amalan"
                accessibilityHint="Pengingat belum berbunyi di versi ini."
              />
            </View>
            {/* Wajib ada: fase ini hanya menyimpan flag, tidak ada notifikasi
                lokal yang dijadwalkan. Toggle yang menjanjikan pengingat lalu
                diam adalah janji yang tidak ditepati. */}
            {reminderEnabled ? (
              <Text style={styles.reminderNote}>
                Pengingat belum berbunyi di versi ini.
              </Text>
            ) : null}
          </View>

          <View style={styles.footer}>
            <View style={styles.footerCancel}>
              <Button
                label="Batal"
                variant="ghost"
                onPress={handleClose}
                isDisabled={isSubmitting}
              />
            </View>
            <View style={styles.footerSubmit}>
              <Button
                label="Simpan"
                onPress={handleSubmit}
                isLoading={isSubmitting}
              />
            </View>
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>

      <PrayerOptionSheet
        title="Jenis Amalan"
        isOpen={isPresetSheetOpen}
        options={presetOptions}
        // PrayerOptionSheet tidak menerima null; string kosong tidak cocok
        // dengan slug mana pun sehingga tidak ada baris yang tampak terpilih.
        selectedValue={presetSlug ?? ''}
        onSelect={value => {
          setPresetSlug(value);
          setIsPresetSheetOpen(false);
        }}
        onClose={() => setIsPresetSheetOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
    gap: spacing.lg,
  },
  sheetTitle: {
    fontWeight: fontWeight.bold,
    fontSize: fontSize.lg,
    color: colors.neutral[900],
  },
  field: {
    gap: spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    fontWeight: fontWeight.medium,
    fontSize: fontSize.sm,
    color: colors.neutral[700],
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: radius.md,
  },
  triggerText: {
    flex: 1,
    fontWeight: fontWeight.regular,
    fontSize: fontSize.md,
    color: colors.neutral[900],
  },
  triggerPlaceholder: {
    color: colors.neutral[400],
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  timeColumn: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  timeInput: {
    width: 64,
    minHeight: 44,
    textAlign: 'center',
    fontWeight: fontWeight.semiBold,
    fontSize: fontSize.lg,
    color: colors.neutral[900],
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
  },
  timeCaption: {
    fontWeight: fontWeight.regular,
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
  timeSeparator: {
    fontWeight: fontWeight.bold,
    fontSize: fontSize.lg,
    color: colors.neutral[700],
    marginBottom: spacing.lg,
  },
  noteInput: {
    minHeight: 96,
    padding: spacing.md,
    fontWeight: fontWeight.regular,
    fontSize: fontSize.md,
    color: colors.neutral[900],
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: radius.md,
  },
  counter: {
    alignSelf: 'flex-end',
    fontWeight: fontWeight.regular,
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
  counterMax: {
    color: colors.semantic.error,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  reminderNote: {
    fontWeight: fontWeight.regular,
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
  inputError: {
    borderColor: colors.semantic.error,
  },
  errorText: {
    fontWeight: fontWeight.regular,
    fontSize: fontSize.xs,
    color: colors.semantic.error,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  footerCancel: {
    flex: 1,
  },
  footerSubmit: {
    flex: 2,
  },
});
