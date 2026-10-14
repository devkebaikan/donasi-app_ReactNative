import React, {useRef} from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {FileText, Share} from '@solar-icons/react-native/Linear';
import type {BottomSheetModal} from '@gorhom/bottom-sheet';
import {HeaderLight} from '@/components/shared/HeaderLight';
import {SalurTimelineItem} from '@/components/shared/SalurTimelineItem';
import {SalurSummaryCard} from '@/components/shared/SalurSummaryCard';
import {MitraSalurSelector} from '@/components/shared/MitraSalurSelector';
import {MitraSalurBottomSheet} from '@/components/shared/MitraSalurBottomSheet';
import {ShareBottomSheet, type ShareOption} from '@/components/shared/ShareBottomSheet';
import {EmptyState} from '@/components/ui/EmptyState';
import {Icon} from '@/components/ui/Icon';
import {useProgramSalur} from '@/hooks/useProgramSalur';
import {showToast} from '@/utils/toast';
import {colors, spacing} from '@/theme';
import type {AllProjectSalurScreenProps} from '@/types/navigation';
import type {MitraSalur, ProjectSalur} from '@/types/programDetail';

const SHARE_OPTION_LABEL: Record<ShareOption, string> = {
  facebook: 'Facebook',
  twitter: 'Twitter',
  whatsapp: 'Whatsapp',
  'copy-url': 'Salin URL',
};

export default function AllProjectSalurScreen({
  route,
  navigation,
}: AllProjectSalurScreenProps): React.JSX.Element {
  const {programId} = route.params;
  const {projects, summary, mitraList, isLoading} = useProgramSalur(programId);
  const mitraSheetRef = useRef<BottomSheetModal>(null);
  const shareSheetRef = useRef<BottomSheetModal>(null);

  const mitraUtama = mitraList.find(mitra => mitra.role === 'utama');

  function handleBack(): void {
    navigation.goBack();
  }

  function handleShare(): void {
    shareSheetRef.current?.present();
  }

  function handleSelectShareOption(option: ShareOption): void {
    shareSheetRef.current?.dismiss();
    showToast(`Fitur berbagi ke ${SHARE_OPTION_LABEL[option]} akan segera hadir.`);
  }

  function handleOpenMitraSalur(): void {
    mitraSheetRef.current?.present();
  }

  function handleSelectMitra(mitra: MitraSalur): void {
    mitraSheetRef.current?.dismiss();
    navigation.navigate('PerLembaga', {
      lembagaId: mitra.id,
      lembagaName: mitra.name,
    });
  }

  function handlePressDetailProjectSalur(projectSalurId: string): void {
    navigation.navigate('DetailProjectSalur', {projectSalurId});
  }

  function renderItem({
    item,
    index,
  }: {
    item: ProjectSalur;
    index: number;
  }): React.JSX.Element {
    return (
      <View style={styles.itemWrapper}>
        <SalurTimelineItem
          item={item}
          isLast={index === projects.length - 1}
          onPressDetail={handlePressDetailProjectSalur}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderLight
        title="Semua Project Salur"
        onBack={handleBack}
        rightSlot={
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleShare}
            accessibilityRole="button"
            accessibilityLabel="Bagikan">
            <Icon icon={Share} size={22} color={colors.neutral[900]} />
          </TouchableOpacity>
        }
      />
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary[500]} />
        </View>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <>
              <View style={styles.section}>
                <SalurSummaryCard summary={summary} />
              </View>
              <View style={styles.gap} />
              <View style={styles.section}>
                <MitraSalurSelector
                  mitraUtama={mitraUtama}
                  onPress={handleOpenMitraSalur}
                />
              </View>
              <View style={styles.gap} />
              <View style={styles.listTopSpacer} />
            </>
          }
          ListEmptyComponent={
            <EmptyState icon={FileText} title="Belum ada project salur" />
          }
        />
      )}
      <MitraSalurBottomSheet
        ref={mitraSheetRef}
        mitraList={mitraList}
        onSelectMitra={handleSelectMitra}
      />
      <ShareBottomSheet
        ref={shareSheetRef}
        onSelectOption={handleSelectShareOption}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    backgroundColor: colors.neutral[0],
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: spacing.lg,
  },
  section: {
    backgroundColor: colors.neutral[0],
  },
  gap: {
    height: spacing.md,
    backgroundColor: colors.neutral[50],
  },
  listTopSpacer: {
    height: spacing.lg,
    backgroundColor: colors.neutral[0],
  },
  itemWrapper: {
    paddingHorizontal: spacing.lg,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
