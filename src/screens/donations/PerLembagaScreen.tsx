import React, {useRef} from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {BottomSheetModal} from '@gorhom/bottom-sheet';
import {Buildings, FileText} from '@solar-icons/react-native/Linear';
import {EmptyState} from '@/components/ui/EmptyState';
import {DetailProgramHeader} from '@/components/shared/DetailProgramHeader';
import {LembagaHeader} from '@/components/shared/LembagaHeader';
import {LembagaTabBar} from '@/components/shared/LembagaTabBar';
import {LaporanCard} from '@/components/shared/LaporanCard';
import {ProgramCard} from '@/components/shared/ProgramCard';
import {ShareBottomSheet, type ShareOption} from '@/components/shared/ShareBottomSheet';
import {useLembagaProfile} from '@/hooks/useLembagaProfile';
import {showToast} from '@/utils/toast';
import {colors, spacing, radius, fontSize, fontWeight, lineHeight} from '@/theme';
import type {PerLembagaScreenProps, RootStackNavigationProp} from '@/types/navigation';
import type {Program} from '@/types/program';
import type {OrganizationReport} from '@/types/organization';

const SHARE_OPTION_LABEL: Record<ShareOption, string> = {
  facebook: 'Facebook',
  twitter: 'Twitter',
  whatsapp: 'Whatsapp',
  'copy-url': 'Salin URL',
};

export default function PerLembagaScreen({
  route,
}: PerLembagaScreenProps): React.JSX.Element {
  const {lembagaId, lembagaName} = route.params;
  const navigation = useNavigation<RootStackNavigationProp>();
  const insets = useSafeAreaInsets();
  const shareSheetRef = useRef<BottomSheetModal>(null);

  const {
    organization,
    isLoading,
    isNotFound,
    activeTab,
    programs,
    isProgramsLoading,
    reports,
    isReportsLoading,
    setActiveTab,
  } = useLembagaProfile(lembagaId);

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

  function handlePressProgram(program: Program): void {
    navigation.navigate('DetailProgram', {
      link: program.link || String(program.id),
    });
  }

  function handlePressReport(report: OrganizationReport): void {
    navigation.navigate('WebView', {
      url: report.fileUrl,
      title: report.title,
    });
  }

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator color={colors.primary[500]} />
      </View>
    );
  }

  if (isNotFound || !organization) {
    return (
      <View style={[styles.container, {paddingTop: insets.top}]}>
        <DetailProgramHeader
          title="Profil Lembaga"
          onPressBack={handleBack}
          onPressShare={handleShare}
        />
        <EmptyState
          icon={Buildings}
          title="Lembaga tidak ditemukan"
          description={`Lembaga "${lembagaName}" tidak ditemukan atau sudah tidak tersedia.`}
        />
        <ShareBottomSheet
          ref={shareSheetRef}
          onSelectOption={handleSelectShareOption}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <DetailProgramHeader
        title={organization.name}
        onPressBack={handleBack}
        onPressShare={handleShare}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <LembagaHeader organization={organization} />

        <View style={styles.tabBarWrapper}>
          <LembagaTabBar activeTab={activeTab} onChange={setActiveTab} />
        </View>

        <View style={styles.tabContent}>
          {activeTab === 'program' &&
            (isProgramsLoading ? (
              <View style={styles.tabLoading}>
                <ActivityIndicator color={colors.primary[500]} />
              </View>
            ) : programs.length === 0 ? (
              <EmptyState icon={Buildings} title="Belum ada program" />
            ) : (
              <View style={styles.listSection}>
                <Text style={styles.sectionTitle}>
                  {programs.length} Program Tersedia
                </Text>
                {programs.map(program => (
                  <ProgramCard
                    key={program.id}
                    program={program}
                    onPress={handlePressProgram}
                  />
                ))}
              </View>
            ))}

          {activeTab === 'about' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tentang Kami</Text>
              <View style={styles.aboutCard}>
                <Text style={styles.aboutText}>{organization.description}</Text>
              </View>
            </View>
          )}

          {activeTab === 'report' &&
            (isReportsLoading ? (
              <View style={styles.tabLoading}>
                <ActivityIndicator color={colors.primary[500]} />
              </View>
            ) : reports.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="Belum ada laporan tersedia"
              />
            ) : (
              <View style={styles.listSection}>
                <Text style={styles.sectionTitle}>Laporan Keuangan</Text>
                {reports.map(report => (
                  <LaporanCard
                    key={report.id}
                    report={report}
                    onPress={handlePressReport}
                  />
                ))}
              </View>
            ))}
        </View>
      </ScrollView>

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
    backgroundColor: colors.neutral[0],
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: spacing['3xl'],
  },
  tabBarWrapper: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  tabContent: {
    paddingVertical: spacing.lg,
  },
  section: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  listSection: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  tabLoading: {
    paddingVertical: spacing['2xl'],
    alignItems: 'center',
  },
  aboutCard: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[50],
  },
  aboutText: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.relaxed,
    color: colors.neutral[700],
  },
});
