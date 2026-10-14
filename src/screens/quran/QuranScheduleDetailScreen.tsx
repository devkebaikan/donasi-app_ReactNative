import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Calendar, PenNewSquare} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {EmptyState} from '@/components/ui/EmptyState';
import {Button} from '@/components/ui/Button';
import {HeaderLight} from '@/components/shared/HeaderLight';
import {QuranStatusBadge} from '@/components/shared/QuranStatusBadge';
import {QuranProgressBar} from '@/components/shared/QuranProgressBar';
import {QuranConfirmDialog} from '@/components/shared/QuranConfirmDialog';
import {REPEAT_LABEL} from '@/components/shared/QuranRepeatSelector';
import {useQuranScheduleDetail} from '@/hooks/useQuranScheduleDetail';
import type {RootStackNavigationProp, RootStackParamList} from '@/types/navigation';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

// String date-only diparse sebagai UTC oleh JS, jadi dipecah manual supaya
// tanggalnya tidak mundur sehari di timezone negatif.
function formatDate(dateKey: string): string {
  const [year, month, day] = dateKey.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) {
    return '-';
  }
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

function QuranScheduleDetailScreen(): React.JSX.Element {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'QuranScheduleDetail'>>();
  const insets = useSafeAreaInsets();
  const {scheduleId} = route.params;

  const {
    schedule,
    isLoading,
    isNotFound,
    isDeleteDialogOpen,
    isDeleting,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete,
  } = useQuranScheduleDetail(scheduleId);

  function handleBack(): void {
    navigation.goBack();
  }

  function handleEdit(): void {
    navigation.navigate('QuranScheduleForm', {scheduleId});
  }

  function handleContinueReading(): void {
    if (!schedule) {
      return;
    }
    navigation.navigate('QuranReader', {
      surahNumber: schedule.surahNumber,
      ayahNumber: Math.max(1, schedule.readAyah),
    });
  }

  async function handleConfirmDelete(): Promise<void> {
    const success = await confirmDelete();
    if (success) {
      navigation.goBack();
    }
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <HeaderLight title="Detail Jadwal" onBack={handleBack} />
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary[500]} />
        </View>
      </View>
    );
  }

  if (isNotFound || !schedule) {
    return (
      <View style={styles.container}>
        <HeaderLight title="Detail Jadwal" onBack={handleBack} />
        <View style={styles.errorState}>
          <EmptyState
            icon={Calendar}
            title="Jadwal tidak ditemukan"
            description="Jadwal ini mungkin sudah dihapus."
          />
          <Button label="Kembali" variant="secondary" onPress={handleBack} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderLight
        title="Detail Jadwal"
        onBack={handleBack}
        rightSlot={
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEdit}
            accessibilityRole="button"
            accessibilityLabel="Ubah jadwal">
            <Icon icon={PenNewSquare} size={22} color={colors.neutral[700]} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.date}>{formatDate(schedule.date)}</Text>
          <QuranStatusBadge status={schedule.status} />

          <Text style={styles.surah}>{schedule.surahNameLatin}</Text>
          <Text style={styles.target}>
            Target sampai ayat {schedule.targetAyah}
          </Text>

          <Text style={styles.percentage}>{schedule.percentage}%</Text>
          <QuranProgressBar
            percentage={schedule.percentage}
            trackColor={colors.primary[700]}
            fillColor={colors.neutral[0]}
          />
          <Text style={styles.readCount}>
            Terbaca {schedule.readAyah} dari {schedule.targetAyah}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Pengulangan</Text>
          <Text style={styles.infoValue}>{REPEAT_LABEL[schedule.repeat]}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Dibuat</Text>
          <Text style={styles.infoValue}>{formatDate(schedule.createdAt)}</Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, {paddingBottom: insets.bottom + spacing.md}]}>
        <Button label="Lanjutkan Membaca" onPress={handleContinueReading} />
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={openDeleteDialog}
          accessibilityRole="button"
          accessibilityLabel="Hapus jadwal">
          <Text style={styles.deleteLabel}>Hapus Jadwal</Text>
        </TouchableOpacity>
      </View>

      <QuranConfirmDialog
        visible={isDeleteDialogOpen}
        title="Hapus jadwal ini?"
        description="Progres bacaanmu tidak ikut terhapus."
        confirmLabel="Hapus"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={closeDeleteDialog}
      />
    </View>
  );
}

export default QuranScheduleDetailScreen;

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
  errorState: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  editButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  card: {
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.primary[600],
    gap: spacing.sm,
  },
  date: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.primary[100],
  },
  surah: {
    marginTop: spacing.sm,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.neutral[0],
  },
  target: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    color: colors.primary[100],
  },
  percentage: {
    marginTop: spacing.md,
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
    color: colors.neutral[0],
  },
  readCount: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    color: colors.primary[100],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  infoLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    color: colors.neutral[600],
  },
  infoValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  deleteButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.semantic.error,
  },
});
