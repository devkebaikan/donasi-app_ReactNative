import React, {useMemo, useState} from 'react';
import {View, Text, FlatList, RefreshControl, StyleSheet} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {DocumentText} from '@solar-icons/react-native/Linear';
import {HeaderLight} from '@/components/shared/HeaderLight';
import {FloatingOrbs} from '@/components/shared/FloatingOrbs';
import {ReportPeriodRow} from '@/components/shared/ReportPeriodRow';
import {DistributionSummaryCards} from '@/components/shared/DistributionSummaryCards';
import {DistributionCategoryTabBar} from '@/components/shared/DistributionCategoryTabBar';
import {DistributionProgramCard} from '@/components/shared/DistributionProgramCard';
import {
  DistributionProgramCardSkeleton,
  DistributionSummarySkeleton,
} from '@/components/shared/DistributionProgramCardSkeleton';
import {PrayerOptionSheet} from '@/components/shared/PrayerOptionSheet';
import {EmptyState} from '@/components/ui/EmptyState';
import {useDistributionReport} from '@/hooks/useDistributionReport';
import {colors, spacing, fontSize, fontWeight} from '@/theme';
import type {DistributionCategory} from '@/types/impact';
import type {
  DistributionReportScreenProps,
  RootStackNavigationProp,
} from '@/types/navigation';

const CATEGORY_LABEL: Record<Exclude<DistributionCategory, 'all'>, string> = {
  sedekah: 'sedekah',
  wakaf: 'wakaf',
};

const SKELETON_KEYS = ['a', 'b', 'c'];

function ItemSeparator(): React.JSX.Element {
  return <View style={styles.separator} />;
}

export default function DistributionReportScreen(): React.JSX.Element {
  const navigation = useNavigation<RootStackNavigationProp>();
  const {params} = useRoute<DistributionReportScreenProps['route']>();

  const {
    data,
    isLoading,
    isRefreshing,
    selectPeriod,
    refresh,
  } = useDistributionReport(params?.period ?? null);

  const [selectedCategory, setSelectedCategory] =
    useState<DistributionCategory>('all');
  const [isPeriodSheetOpen, setIsPeriodSheetOpen] = useState(false);
  const [expandedProgramIds, setExpandedProgramIds] = useState<string[]>([]);

  // Penyaringan kategori di KLIEN, bukan query ke server.
  const visiblePrograms = useMemo(() => {
    const programs = data?.programs ?? [];
    if (selectedCategory === 'all') {
      return programs;
    }
    return programs.filter(program =>
      program.categories.includes(selectedCategory),
    );
  }, [data, selectedCategory]);

  const periodOptions = useMemo(
    () =>
      (data?.availablePeriods ?? []).map(period => ({
        value: period.value,
        label: period.label,
        description: null,
      })),
    [data],
  );

  function handleSelectPeriod(period: string): void {
    setIsPeriodSheetOpen(false);
    // Chip di-reset tiap ganti periode: kategori yang ada bulan lalu belum
    // tentu ada bulan ini, dan filter yang tertinggal membuat daftar tampak
    // kosong tanpa sebab.
    setSelectedCategory('all');
    setExpandedProgramIds([]);
    selectPeriod(period);
  }

  function handleToggleProgram(programId: string): void {
    setExpandedProgramIds(previous =>
      previous.includes(programId)
        ? previous.filter(id => id !== programId)
        : [...previous, programId],
    );
  }

  function renderEmpty(): React.JSX.Element | null {
    if (isLoading || !data) {
      return null;
    }
    // Dua sebab yang berbeda sengaja dibedakan pesannya: periode yang memang
    // belum ada laporannya, dan kategori yang tidak ada di periode ini.
    // selectedCategory pasti bukan 'all' di cabang kedua — chip "Semua" tidak
    // menyaring apa pun, jadi daftarnya tidak mungkin kosong kalau
    // data.programs terisi.
    const description =
      data.programs.length === 0 || selectedCategory === 'all'
        ? `Laporan untuk periode ${data.periodLabel} belum tersedia.`
        : `Belum ada program ${CATEGORY_LABEL[selectedCategory]} pada periode ini.`;
    return (
      <EmptyState
        icon={DocumentText}
        title="Belum Ada Laporan"
        description={description}
      />
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary[200], colors.primary[50], colors.neutral[0]]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.backgroundGradient}
      />
      <FloatingOrbs />

      <HeaderLight
        title="Laporan Penyaluran"
        onBack={() => navigation.goBack()}
      />

      <FlatList
        data={isLoading ? [] : visiblePrograms}
        keyExtractor={program => program.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={colors.primary[500]}
          />
        }
        ListHeaderComponent={
          <View>
            <ReportPeriodRow
              label={data?.periodLabel ?? ''}
              isEnabled={periodOptions.length > 0}
              onPress={() => setIsPeriodSheetOpen(true)}
            />

            {isLoading || !data ? (
              <DistributionSummarySkeleton />
            ) : (
              <DistributionSummaryCards summary={data.summary} />
            )}

            <View style={styles.tabBarWrapper}>
              <DistributionCategoryTabBar
                activeTab={selectedCategory}
                onChange={setSelectedCategory}
              />
            </View>

            <Text style={styles.sectionTitle}>Laporan Program</Text>

            {isLoading ? (
              <View style={styles.skeletonList}>
                {SKELETON_KEYS.map(key => (
                  <DistributionProgramCardSkeleton key={key} />
                ))}
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={renderEmpty()}
        renderItem={({item}) => (
          <DistributionProgramCard
            program={item}
            isExpanded={expandedProgramIds.includes(item.id)}
            onToggle={handleToggleProgram}
          />
        )}
        ItemSeparatorComponent={ItemSeparator}
      />

      <PrayerOptionSheet
        title="Pilih Periode"
        isOpen={isPeriodSheetOpen}
        options={periodOptions}
        selectedValue={data?.period ?? ''}
        onSelect={handleSelectPeriod}
        onClose={() => setIsPeriodSheetOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[0],
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 420,
  },
  content: {
    paddingHorizontal: spacing.lg,
    // Tanpa paddingTop, kartu periode menempel ke garis header. Nilai yang
    // sama dipakai DonasiBersamaListScreen.
    paddingTop: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  tabBarWrapper: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
  skeletonList: {
    gap: spacing.md,
  },
  separator: {
    height: spacing.md,
  },
});
