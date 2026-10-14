import React, {useCallback, useEffect, useRef} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import type {BottomSheetBackdropProps} from '@gorhom/bottom-sheet';
import {Button} from '@/components/ui/Button';
import {JadwalPicker} from '@/components/shared/JadwalPicker';
import {DonasiBersamaWeekDayPicker} from '@/components/shared/DonasiBersamaWeekDayPicker';
import {MonthDayPicker} from '@/components/shared/MonthDayPicker';
import {formatCurrency} from '@/utils/formatCurrency';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {RecurringFrequency} from '@/types/recurringDonation';
import type {WeekDay} from '@/types/donasiBersama';

// Empat field + baris tombol, isinya di dalam BottomSheetScrollView supaya
// layar pendek tetap bisa menggulir sampai tombol simpan.
const SNAP_POINTS = ['80%'];

interface RecurringEditSheetProps {
  isOpen: boolean;
  amount: number;
  frequency: RecurringFrequency;
  scheduleDay: number | null;
  weekDay: WeekDay | null;
  scheduleHour: number;
  scheduleMinute: number;
  errors: Record<string, string>;
  isSaving: boolean;
  onPressAmount: () => void;
  onChangeFrequency: (frequency: RecurringFrequency) => void;
  onChangeWeekDay: (day: WeekDay) => void;
  onChangeMonthDay: (day: number) => void;
  onChangeHour: (hour: number) => void;
  onChangeMinute: (minute: number) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export function RecurringEditSheet({
  isOpen,
  amount,
  frequency,
  scheduleDay,
  weekDay,
  scheduleHour,
  scheduleMinute,
  errors,
  isSaving,
  onPressAmount,
  onChangeFrequency,
  onChangeWeekDay,
  onChangeMonthDay,
  onChangeHour,
  onChangeMinute,
  onSubmit,
  onClose,
}: RecurringEditSheetProps): React.JSX.Element {
  const sheetRef = useRef<BottomSheetModal>(null);
  // Menahan dismiss() sebelum sheet pernah present — lihat catatan panjang di
  // PrayerOptionSheet soal status INITIAL di gorhom 5.2.
  const hasPresentedRef = useRef(false);

  const handleDismissed = useCallback(() => {
    hasPresentedRef.current = false;
    onClose();
  }, [onClose]);

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
        pressBehavior={isSaving ? 'none' : 'close'}
      />
    ),
    [isSaving],
  );

  const isWeekly = frequency === 'mingguan';
  const isMonthly = frequency === 'bulanan';

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={SNAP_POINTS}
      backdropComponent={renderBackdrop}
      onDismiss={handleDismissed}
      enablePanDownToClose={!isSaving}>
      <BottomSheetScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Ubah Rutinitas</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Nominal</Text>
          <TouchableOpacity
            style={[styles.amountRow, errors.amount ? styles.fieldError : null]}
            onPress={onPressAmount}
            accessibilityRole="button"
            accessibilityLabel={`Ubah nominal, sekarang ${formatCurrency(amount)}`}>
            <Text style={styles.amountValue}>{formatCurrency(amount)}</Text>
            <Text style={styles.amountAction}>Ubah</Text>
          </TouchableOpacity>
          {errors.amount ? (
            <Text style={styles.errorText}>{errors.amount}</Text>
          ) : null}
        </View>

        {/* JadwalPicker sudah memuat pilihan frekuensi DAN input jam, jadi
            dipakai apa adanya — tidak ada pemilih frekuensi terpisah. */}
        <JadwalPicker
          frequency={frequency}
          onChangeFrequency={onChangeFrequency}
          scheduleHour={scheduleHour}
          scheduleMinute={scheduleMinute}
          onChangeHour={onChangeHour}
          onChangeMinute={onChangeMinute}
        />
        {errors.scheduleTime ? (
          <Text style={styles.errorText}>{errors.scheduleTime}</Text>
        ) : null}

        {isWeekly || isMonthly ? (
          <View style={styles.field}>
            <Text style={styles.label}>Hari</Text>
            {isWeekly ? (
              <DonasiBersamaWeekDayPicker
                value={weekDay}
                onChange={onChangeWeekDay}
              />
            ) : (
              <MonthDayPicker value={scheduleDay} onChange={onChangeMonthDay} />
            )}
            {errors.scheduleDay ? (
              <Text style={styles.errorText}>{errors.scheduleDay}</Text>
            ) : null}
          </View>
        ) : null}

        <View style={styles.actions}>
          {/* Tidak disabled saat form belum valid — hanya saat menyimpan.
              Validasi jalan waktu tombol ditekan. */}
          <Button
            label="Simpan Perubahan"
            onPress={onSubmit}
            isDisabled={isSaving}
            isLoading={isSaving}
          />
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            disabled={isSaving}
            accessibilityRole="button"
            accessibilityLabel="Batal mengubah rutinitas">
            <Text style={styles.cancelLabel}>Batal</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
    gap: spacing.lg,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
  field: {
    gap: spacing.sm,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[700],
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.lg,
  },
  fieldError: {
    borderColor: colors.semantic.error,
  },
  amountValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  amountAction: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.primary[600],
  },
  errorText: {
    fontSize: fontSize.xs,
    color: colors.semantic.error,
  },
  actions: {
    gap: spacing.sm,
  },
  cancelButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[600],
  },
});
