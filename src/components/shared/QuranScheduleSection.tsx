import React from 'react';
import {View, Text, FlatList, Dimensions, StyleSheet} from 'react-native';
import {EmptyState} from '@/components/ui/EmptyState';
import {Calendar} from '@solar-icons/react-native/Linear';
import {Button} from '@/components/ui/Button';
import {QuranScheduleCard} from '@/components/shared/QuranScheduleCard';
import {colors, spacing, fontSize, fontWeight} from '@/theme';
import type {Schedule} from '@/types/quran';

const SCREEN_WIDTH = Dimensions.get('window').width;
// Card jadwal sengaja lebih sempit dari lebar layar supaya card berikutnya
// ikut mengintip — sinyal bahwa daftarnya bisa digeser.
const CARD_WIDTH = SCREEN_WIDTH * 0.62;
const CARD_GAP = spacing.md;

interface QuranScheduleSectionProps {
  schedules: Schedule[];
  isLoading: boolean;
  onPressSchedule: (schedule: Schedule) => void;
  onPressSeeAll: () => void;
  onPressCreate: () => void;
}

function keyExtractor(schedule: Schedule): string {
  return schedule.id;
}

function renderSeparator(): React.JSX.Element {
  return <View style={styles.separator} />;
}

export function QuranScheduleSection({
  schedules,
  isLoading,
  onPressSchedule,
  onPressSeeAll,
  onPressCreate,
}: QuranScheduleSectionProps): React.JSX.Element {
  const isEmpty = !isLoading && schedules.length === 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Jadwalku</Text>
        {/* Tombol kecil di sisi judul, pola yang sama dengan InfoTerkiniCard. */}
        <Button label="Lihat Semua" size="xs" onPress={onPressSeeAll} />
      </View>

      {isEmpty ? (
        <View style={styles.empty}>
          <EmptyState
            icon={Calendar}
            title="Belum ada jadwal"
            description="Atur jadwal tilawahmu agar bacaan lebih teratur."
          />
          <Button
            label="+ Tambah Jadwal"
            variant="secondary"
            onPress={onPressCreate}
          />
        </View>
      ) : (
        <FlatList
          horizontal
          data={schedules}
          keyExtractor={keyExtractor}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={renderSeparator}
          renderItem={({item}) => (
            <QuranScheduleCard
              schedule={item}
              width={CARD_WIDTH}
              onPress={onPressSchedule}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Ritme vertikal disamakan dengan QuranLastReadSection — dua section ini
  // bersebelahan, jadi padding-nya harus sama supaya jaraknya tidak lompat.
  container: {
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
  list: {
    paddingHorizontal: spacing.lg,
  },
  separator: {
    width: CARD_GAP,
  },
  empty: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
});
