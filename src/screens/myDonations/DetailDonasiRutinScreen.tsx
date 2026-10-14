import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import type {BottomSheetModal} from '@gorhom/bottom-sheet';
import {MenuDots, Pause, Play, Pen, TrashBinTrash} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {HeaderLight} from '@/components/shared/HeaderLight';
import {ActionSheet, type ActionSheetAction} from '@/components/shared/ActionSheet';
import {RecurringEditSheet} from '@/components/shared/RecurringEditSheet';
import {NominalBottomSheet} from '@/components/shared/NominalBottomSheet';
import {RecurringHistoryItem} from '@/components/shared/RecurringHistoryItem';
import {PauseStopDialog} from '@/components/shared/PauseStopDialog';
import {useRecurringDonationDetail} from '@/hooks/useRecurringDonationDetail';
import {
  useRecurringDonationEdit,
  MIN_RECURRING_EDIT_AMOUNT,
} from '@/hooks/useRecurringDonationEdit';
import {formatCurrency} from '@/utils/formatCurrency';
import {formatRecurringSchedule} from '@/utils/formatDate';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {DetailDonasiRutinScreenProps} from '@/types/navigation';
import type {RecurringDonationStatus} from '@/types/recurringDonation';

const STATUS_LABEL: Record<RecurringDonationStatus, string> = {
  AKTIF: 'AKTIF',
  JEDA: 'JEDA',
};

const STATUS_COLOR: Record<RecurringDonationStatus, {bg: string; text: string}> = {
  AKTIF: {bg: colors.semantic.successLight, text: colors.semantic.success},
  JEDA: {bg: colors.neutral[100], text: colors.neutral[500]},
};

type ActionValue = 'edit' | 'toggle' | 'stop';

export default function DetailDonasiRutinScreen({
  route,
  navigation,
}: DetailDonasiRutinScreenProps): React.JSX.Element {
  const {recurringId} = route.params;
  const nominalSheetRef = useRef<BottomSheetModal>(null);

  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

  const {
    detail,
    isLoading,
    isPausing,
    isSaving,
    isStopping,
    isStopDialogVisible,
    pause,
    resume,
    update,
    openStopDialog,
    closeStopDialog,
    confirmStop,
  } = useRecurringDonationDetail(recurringId);

  const form = useRecurringDonationEdit(detail, isEditSheetOpen);

  const isPaused = detail?.status === 'JEDA';

  const actions: ActionSheetAction[] = [
    {value: 'edit', label: 'Ubah Rutinitas', icon: Pen},
    {
      value: 'toggle',
      label: isPaused ? 'Aktifkan Lagi' : 'Jeda Rutinitas',
      icon: isPaused ? Play : Pause,
    },
    {
      value: 'stop',
      label: 'Hentikan Rutinitas',
      icon: TrashBinTrash,
      tone: 'danger',
    },
  ];

  // Sheet aksi HARUS tertutup dulu sebelum sheet ubah atau dialog dibuka —
  // dua bottom sheet yang present bersamaan membuat backdrop menumpuk dan
  // sheet kedua tidak bisa ditutup.
  function handleSelectAction(value: string): void {
    setIsActionSheetOpen(false);
    const action = value as ActionValue;
    if (action === 'edit') {
      setIsEditSheetOpen(true);
      return;
    }
    if (action === 'toggle') {
      if (isPausing) {
        return;
      }
      if (isPaused) {
        resume();
      } else {
        pause();
      }
      return;
    }
    openStopDialog();
  }

  function handleConfirmAmount(amount: number): void {
    form.setAmount(amount);
    nominalSheetRef.current?.dismiss();
  }

  async function handleSubmitEdit(): Promise<void> {
    const payload = form.buildPayload();
    if (!payload) {
      return;
    }
    const fieldErrors = await update(payload);
    if (fieldErrors) {
      form.setErrors(fieldErrors);
      return;
    }
    setIsEditSheetOpen(false);
  }

  async function handleConfirmStop(): Promise<void> {
    const success = await confirmStop();
    if (success) {
      navigation.goBack();
    }
  }

  function renderHeaderAction(): React.JSX.Element | undefined {
    if (!detail) {
      return undefined;
    }
    return (
      <TouchableOpacity
        style={styles.headerAction}
        onPress={() => setIsActionSheetOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Aksi lain untuk rutinitas ini">
        <Icon icon={MenuDots} size={22} color={colors.neutral[900]} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderLight
        title="Detail Donasi Rutin"
        onBack={() => navigation.goBack()}
        rightSlot={renderHeaderAction()}
      />

      {isLoading || !detail ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary[500]} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <Image
            source={{uri: detail.programImageUrl}}
            style={styles.programImage}
          />

          <Text style={styles.programTitle}>{detail.programTitle}</Text>

          {/* Empat keterangan rutinitas dikumpulkan dalam satu kartu 2x2:
              berapa yang sudah terkumpul, berapa per periode, sedang jalan
              atau dijeda, dan kapan jalannya. Sebelumnya status dan jadwal
              berdiri sendiri di luar kartu sehingga halaman ini terbaca
              sebagai empat blok terpisah untuk satu hal yang sama. */}
          <View style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total Terdonasi</Text>
                <Text style={styles.statValue}>
                  {formatCurrency(detail.totalDonated)}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Nominal</Text>
                <Text style={styles.statValue}>
                  {formatCurrency(detail.amount)}
                </Text>
              </View>
            </View>

            <View style={styles.statsRowDivider} />

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Status</Text>
                <View
                  style={[
                    styles.statusBadge,
                    {backgroundColor: STATUS_COLOR[detail.status].bg},
                  ]}>
                  <Text
                    style={[
                      styles.statusBadgeText,
                      {color: STATUS_COLOR[detail.status].text},
                    ]}>
                    {STATUS_LABEL[detail.status]}
                  </Text>
                </View>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Waktu</Text>
                <Text style={styles.scheduleText} numberOfLines={2}>
                  {formatRecurringSchedule(detail)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>Riwayat Otomatis</Text>
            {detail.history.length === 0 ? (
              <Text style={styles.historyEmpty}>Belum ada riwayat.</Text>
            ) : (
              detail.history.map(entry => (
                <RecurringHistoryItem key={entry.id} entry={entry} />
              ))
            )}
          </View>
        </ScrollView>
      )}

      <ActionSheet
        isOpen={isActionSheetOpen}
        title="Aksi Rutinitas"
        actions={actions}
        onSelect={handleSelectAction}
        onClose={() => setIsActionSheetOpen(false)}
      />

      <RecurringEditSheet
        isOpen={isEditSheetOpen}
        amount={form.amount}
        frequency={form.frequency}
        scheduleDay={form.scheduleDay}
        weekDay={form.weekDay}
        scheduleHour={form.scheduleHour}
        scheduleMinute={form.scheduleMinute}
        errors={form.errors}
        isSaving={isSaving}
        onPressAmount={() => nominalSheetRef.current?.present()}
        onChangeFrequency={form.setFrequency}
        onChangeWeekDay={form.setWeekDay}
        onChangeMonthDay={form.setScheduleDay}
        onChangeHour={form.setScheduleHour}
        onChangeMinute={form.setScheduleMinute}
        onSubmit={handleSubmitEdit}
        onClose={() => setIsEditSheetOpen(false)}
      />

      <NominalBottomSheet
        ref={nominalSheetRef}
        programTitle={detail?.programTitle ?? ''}
        programImageUrl={detail?.programImageUrl ?? ''}
        onConfirm={handleConfirmAmount}
        minAmount={MIN_RECURRING_EDIT_AMOUNT}
        sectionTitle="Nominal donasi rutin"
        confirmLabel="Simpan Nominal"
        presetLayout="grid"
      />

      <PauseStopDialog
        visible={isStopDialogVisible}
        isLoading={isStopping}
        onConfirm={handleConfirmStop}
        onCancel={closeStopDialog}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  headerAction: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
    gap: spacing.md,
  },
  programImage: {
    width: '100%',
    height: 160,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[200],
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  statusBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semiBold,
  },
  programTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
  statsCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
  },
  statItem: {
    flex: 1,
    gap: spacing.xs,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.neutral[200],
    marginHorizontal: spacing.md,
  },
  statsRowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.neutral[200],
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
  statValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
  scheduleText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  // Tanpa kartu pembungkus: tiap baris riwayat sudah jadi kartunya sendiri,
  // jadi section ini cuma judul + tumpukan kartu.
  historySection: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  historyEmpty: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
  },
});
