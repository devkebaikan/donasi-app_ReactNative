import React, {forwardRef, useCallback, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import type {BottomSheetBackdropProps} from '@gorhom/bottom-sheet';
import {Icon} from '@/components/ui/Icon';
import {AltArrowLeft, AltArrowRight} from '@solar-icons/react-native/Linear';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';

const WEEKDAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

// Semua perbandingan tanggal pakai string YYYY-MM-DD, bukan objek Date —
// menghindari geser sehari akibat konversi timezone.
function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function todayKey(): string {
  const now = new Date();
  return toDateKey(now.getFullYear(), now.getMonth(), now.getDate());
}

interface QuranDatePickerSheetProps {
  value: string; // YYYY-MM-DD
  /** Tanggal paling awal yang boleh dipilih. Kosong = bebas. */
  minDate?: string;
  onSelect: (date: string) => void;
}

export const QuranDatePickerSheet = forwardRef<
  BottomSheetModal,
  QuranDatePickerSheetProps
>(function QuranDatePickerSheetComponent(
  {value, minDate, onSelect},
  ref,
): React.JSX.Element {
  const initial = value || todayKey();
  const [viewYear, setViewYear] = useState(() => Number(initial.slice(0, 4)));
  const [viewMonth, setViewMonth] = useState(
    () => Number(initial.slice(5, 7)) - 1,
  );

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

  function shiftMonth(delta: number): void {
    const next = viewMonth + delta;
    if (next < 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
      return;
    }
    if (next > 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
      return;
    }
    setViewMonth(next);
  }

  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({length: firstWeekday}, () => null),
    ...Array.from({length: daysInMonth}, (_, index) => index + 1),
  ];

  return (
    <BottomSheetModal
      ref={ref}
      enableDynamicSizing
      backdropComponent={renderBackdrop}>
      <BottomSheetView style={styles.container}>
        <Text style={styles.title}>Pilih Tanggal</Text>

        <View style={styles.monthRow}>
          <TouchableOpacity
            style={styles.monthButton}
            onPress={() => shiftMonth(-1)}
            accessibilityRole="button"
            accessibilityLabel="Bulan sebelumnya">
            <Icon icon={AltArrowLeft} size={20} color={colors.neutral[700]} />
          </TouchableOpacity>

          <Text style={styles.monthLabel}>
            {MONTHS[viewMonth]} {viewYear}
          </Text>

          <TouchableOpacity
            style={styles.monthButton}
            onPress={() => shiftMonth(1)}
            accessibilityRole="button"
            accessibilityLabel="Bulan berikutnya">
            <Icon icon={AltArrowRight} size={20} color={colors.neutral[700]} />
          </TouchableOpacity>
        </View>

        <View style={styles.weekRow}>
          {WEEKDAYS.map(day => (
            <Text key={day} style={styles.weekday}>
              {day}
            </Text>
          ))}
        </View>

        <View style={styles.grid}>
          {cells.map((day, index) => {
            if (day == null) {
              return <View key={`empty-${index}`} style={styles.cell} />;
            }
            const key = toDateKey(viewYear, viewMonth, day);
            const isSelected = key === value;
            const isDisabled = minDate != null && key < minDate;

            return (
              <TouchableOpacity
                key={key}
                style={[styles.cell, isSelected && styles.cellSelected]}
                onPress={() => onSelect(key)}
                disabled={isDisabled}
                accessibilityRole="button"
                accessibilityLabel={`${day} ${MONTHS[viewMonth]} ${viewYear}`}
                accessibilityState={{selected: isSelected, disabled: isDisabled}}>
                <Text
                  style={[
                    styles.cellLabel,
                    isSelected && styles.cellLabelSelected,
                    isDisabled && styles.cellLabelDisabled,
                  ]}>
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.bottomSpacer} />
      </BottomSheetView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  monthButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  weekRow: {
    flexDirection: 'row',
  },
  weekday: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.neutral[500],
    marginBottom: spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellSelected: {
    borderRadius: radius.full,
    backgroundColor: colors.primary[500],
  },
  cellLabel: {
    fontSize: fontSize.md,
    color: colors.neutral[800],
  },
  cellLabelSelected: {
    color: colors.neutral[0],
    fontWeight: fontWeight.bold,
  },
  cellLabelDisabled: {
    color: colors.neutral[300],
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});
