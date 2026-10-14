import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {BottomSheetModal} from '@gorhom/bottom-sheet';
import {FileText, HandMoney} from '@solar-icons/react-native/Linear';
import {EmptyState} from '@/components/ui/EmptyState';
import {DetailProgramHeader} from '@/components/shared/DetailProgramHeader';
import {InfoTerkiniCard} from '@/components/shared/InfoTerkiniCard';
import {ProgramInfoCapaian} from '@/components/shared/ProgramInfoCapaian';
import {ProjectSalurTerdekatSection} from '@/components/shared/ProjectSalurTerdekatSection';
import {ProgramAvailabilityNote} from '@/components/shared/ProgramAvailabilityNote';
import {SalesNotifCard} from '@/components/shared/SalesNotifCard';
import {FundraiserCard} from '@/components/shared/FundraiserCard';
import {ProgramTabBar} from '@/components/shared/ProgramTabBar';
import {HtmlContent} from '@/components/shared/HtmlContent';
import {SalurTimelineItem} from '@/components/shared/SalurTimelineItem';
import {SeeMoreOverlay} from '@/components/shared/SeeMoreOverlay';
import {DonaturListItem} from '@/components/shared/DonaturListItem';
import {FloatingDonationFooter} from '@/components/shared/FloatingDonationFooter';
import {ShareBottomSheet, type ShareOption} from '@/components/shared/ShareBottomSheet';
import {NominalBottomSheet} from '@/components/shared/NominalBottomSheet';
import {MetodePembayaranBottomSheet} from '@/components/shared/MetodePembayaranBottomSheet';
import {useDetailProgram} from '@/hooks/useDetailProgram';
import {usePaymentMethodSelection} from '@/hooks/usePaymentMethodSelection';
import {useAuthStore} from '@/stores/authStore';
import {showToast} from '@/utils/toast';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {DetailProgramScreenProps, RootStackNavigationProp} from '@/types/navigation';
import type {DonaturSort} from '@/types/programDetail';
import type {PaymentMethod} from '@/types/payment';

const SHARE_OPTION_LABEL: Record<ShareOption, string> = {
  facebook: 'Facebook',
  twitter: 'Twitter',
  whatsapp: 'Whatsapp',
  'copy-url': 'Salin URL',
};

const DONATUR_SORT_OPTIONS: {value: DonaturSort; label: string}[] = [
  {value: 'terbaru', label: 'Terbaru'},
  {value: 'terbesar', label: 'Terbesar'},
];

const SALUR_LIST_LIMIT = 3;

export default function DetailProgramScreen({
  route,
}: DetailProgramScreenProps): React.JSX.Element {
  const {
    link,
    reopenMetodePembayaran,
    preservedAmount,
    preservedNominalLabel,
  } = route.params;
  const navigation = useNavigation<RootStackNavigationProp>();
  const insets = useSafeAreaInsets();
  const isAuthenticated = useAuthStore(s => s.accessToken != null);
  const shareSheetRef = useRef<BottomSheetModal>(null);
  const nominalSheetRef = useRef<BottomSheetModal>(null);
  const metodeSheetRef = useRef<BottomSheetModal>(null);
  const hasHandledReopenRef = useRef(false);
  const hasNavigatedToAlurDonasiRef = useRef(false);
  const [confirmedAmount, setConfirmedAmount] = useState<number | null>(null);
  const [confirmedLabel, setConfirmedLabel] = useState('Nominal Donasi');
  const [nominalSheetKey, setNominalSheetKey] = useState(0);

  const {
    program,
    isLoading,
    isNotFound,
    salesNotif,
    activeTab,
    projects,
    reportSalur,
    isProjectsLoading,
    donatur,
    donaturSort,
    isDonaturLoading,
    setActiveTab,
    setDonaturSort,
  } = useDetailProgram(link);

  const {
    paymentMethods,
    isLoadingMethods,
    selectedMethod,
    walletBalance,
    isLoadingWalletBalance,
    isWalletInsufficient,
    loadPaymentMethods,
    loadWalletBalance,
    selectMethod,
    resetSelection,
  } = usePaymentMethodSelection({amount: confirmedAmount ?? 0});

  // Kembali dari AlurDonasiScreen (baik karena invoice sudah berhasil
  // dibentuk lalu tap back, maupun karena Step 3 dibatalkan sebelum
  // submit) harus mengosongkan pilihan nominal & metode pembayaran —
  // bukan menampilkan lagi pilihan lama, user wajib pilih ulang dari awal.
  useFocusEffect(
    useCallback(() => {
      if (!hasNavigatedToAlurDonasiRef.current) {
        return;
      }
      hasNavigatedToAlurDonasiRef.current = false;
      setConfirmedAmount(null);
      setConfirmedLabel('Nominal Donasi');
      resetSelection();
      setNominalSheetKey(key => key + 1);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  useEffect(() => {
    if (hasHandledReopenRef.current || !program || !reopenMetodePembayaran) {
      return;
    }
    hasHandledReopenRef.current = true;
    setConfirmedAmount(preservedAmount ?? 0);
    setConfirmedLabel(preservedNominalLabel ?? 'Nominal Donasi');
    loadPaymentMethods();
    loadWalletBalance();
    metodeSheetRef.current?.present();
    // Hanya dijalankan sekali setelah program termuat.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [program]);

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

  function handlePressFundraiser(): void {
    if (!program?.organization) {
      return;
    }
    navigation.navigate('PerLembaga', {
      lembagaId: program.organization.id,
      lembagaName: program.organization.name,
    });
  }

  function handleDonateNow(): void {
    if (!program) {
      return;
    }
    nominalSheetRef.current?.present();
  }

  function handleConfirmNominal(amount: number, label: string): void {
    if (!program) {
      return;
    }
    nominalSheetRef.current?.dismiss();
    setConfirmedAmount(amount);
    setConfirmedLabel(label);
    loadPaymentMethods();
    loadWalletBalance();
    metodeSheetRef.current?.present();
  }

  function handleSelectMethod(method: PaymentMethod): void {
    selectMethod(method);
  }

  function handleConfirmMethod(): void {
    if (!program || confirmedAmount === null || !selectedMethod) {
      return;
    }
    metodeSheetRef.current?.dismiss();
    hasNavigatedToAlurDonasiRef.current = true;
    navigation.navigate('AlurDonasi', {
      programId: program.id,
      programTitle: program.title,
      programImageUrl: program.imageUrl,
      nominalType: program.nominalType,
      presets: program.nominalPresets,
      packages: program.packages,
      preservedAmount: confirmedAmount,
      preservedNominalLabel: confirmedLabel,
      preservedMethod: selectedMethod,
    });
  }

  function handlePressLoginForWallet(): void {
    metodeSheetRef.current?.dismiss();
    navigation.navigate('Login', {
      redirectTo: {
        screen: 'DetailProgram',
        params: {
          link,
          reopenMetodePembayaran: true,
          preservedAmount: confirmedAmount ?? 0,
          preservedNominalLabel: confirmedLabel,
        },
      },
    });
  }

  function handlePressTopupForWallet(): void {
    metodeSheetRef.current?.dismiss();
    navigation.navigate('Topup');
  }

  function handlePressSecondary(): void {
    if (!program) {
      return;
    }
    if (!program.isRutin) {
      handleShare();
      return;
    }
    const params = {
      programId: program.id,
      programTitle: program.title,
      programImageUrl: program.imageUrl,
    };
    // Melihat program boleh tanpa login; mengatur donasi rutin tidak. Ini
    // SATU-SATUNYA gerbang login untuk alur rutin — tab "Pilihan Rutin" cuma
    // mengantar ke halaman ini, tidak punya jalan pintas ke form.
    // Lihat docs/08-features/donasi-rutin/README.md.
    if (!isAuthenticated) {
      navigation.navigate('Login', {
        redirectTo: {screen: 'DonasiRutinSetup', params},
      });
      return;
    }
    navigation.navigate('DonasiRutinSetup', params);
  }

  function handleSeeAll(): void {
    showToast('Fitur akan segera hadir.');
  }

  function handleSeeAllProjectSalur(): void {
    if (!program) {
      return;
    }
    navigation.navigate('AllProjectSalur', {programId: program.id});
  }

  function handleSeeAllReportSalur(): void {
    if (!program) {
      return;
    }
    navigation.navigate('AllReportSalur', {programId: program.id});
  }

  function handlePressDetailProjectSalur(id: string): void {
    navigation.navigate('DetailProjectSalur', {projectSalurId: id});
  }

  function handlePressAamiin(): void {
    showToast('Fitur akan segera hadir.');
  }

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator color={colors.primary[500]} />
      </View>
    );
  }

  if (isNotFound || !program) {
    return (
      <View style={[styles.container, {paddingTop: insets.top}]}>
        <DetailProgramHeader
          title="Detail Program"
          onPressBack={handleBack}
          onPressShare={handleShare}
        />
        <EmptyState
          icon={FileText}
          title="Program tidak tersedia"
          description="Program yang kamu cari tidak ditemukan atau sudah tidak tersedia."
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
        title={program.title}
        onPressBack={handleBack}
        onPressShare={handleShare}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.mediaWrapper}>
          <Image
            source={{uri: program.imageUrl}}
            style={styles.media}
            resizeMode="cover"
            accessibilityRole="image"
            accessibilityLabel={program.title}
          />
          <View style={styles.salesNotifOverlay}>
            <SalesNotifCard items={salesNotif} />
          </View>
        </View>

        {program.organization ? (
          <InfoTerkiniCard
            organizationName={program.organization.name}
            onPressSelengkapnya={handlePressFundraiser}
          />
        ) : null}

        {/* "Project Salur Terdekat" ikut tersembunyi sampai "Selengkapnya"
            ditekan — satu paket dengan rincian capaian, bukan section
            berdiri sendiri seperti sebelumnya. */}
        <ProgramInfoCapaian
          program={program}
          expandedContent={
            <ProjectSalurTerdekatSection
              items={program.nearestProjects}
              onPressNext={handlePressDetailProjectSalur}
            />
          }
        />

        {/* Note + kartu penggalang dana satu blok: dua-duanya menerangkan
            angka di blok capaian tepat di atasnya, jadi jaraknya dirapatkan
            (gap sm) alih-alih dua section terpisah dengan padding sendiri. */}
        <View style={styles.noteSection}>
          <ProgramAvailabilityNote />
          {program.organization ? (
            <FundraiserCard
              organization={program.organization}
              onPress={handlePressFundraiser}
            />
          ) : null}
        </View>

        <ProgramTabBar activeTab={activeTab} onChange={setActiveTab} />

        <View style={styles.tabContent}>
          {activeTab === 'about' && (
            <View style={styles.section}>
              {program.contentHtml ? (
                <HtmlContent html={program.contentHtml} />
              ) : (
                <EmptyState icon={FileText} title="Belum ada cerita program" />
              )}
            </View>
          )}

          {activeTab === 'projects' &&
            (isProjectsLoading ? (
              <View style={styles.tabLoading}>
                <ActivityIndicator color={colors.primary[500]} />
              </View>
            ) : projects.length === 0 ? (
              <EmptyState icon={FileText} title="Belum ada project salur" />
            ) : (
              <View style={styles.listSection}>
                <View style={styles.timelineWrapper}>
                  {projects.slice(0, SALUR_LIST_LIMIT).map((project, index, visible) => (
                    <SalurTimelineItem
                      key={project.id}
                      item={project}
                      isLast={index === visible.length - 1}
                      onPressDetail={handlePressDetailProjectSalur}
                    />
                  ))}
                  {projects.length > SALUR_LIST_LIMIT ? (
                    <SeeMoreOverlay
                      label="Lihat Semua Project Salur"
                      onPress={handleSeeAllProjectSalur}
                    />
                  ) : null}
                </View>
              </View>
            ))}

          {activeTab === 'donatur' &&
            (isDonaturLoading ? (
              <View style={styles.tabLoading}>
                <ActivityIndicator color={colors.primary[500]} />
              </View>
            ) : (
              <View style={styles.listSection}>
                <View style={styles.donaturHeader}>
                  <Text style={styles.donaturTotal}>
                    {program.donaturCount.toLocaleString('id-ID')} Donatur
                  </Text>
                  <TouchableOpacity
                    onPress={handleSeeAll}
                    accessibilityRole="button"
                    accessibilityLabel="Lihat semua donatur">
                    <Text style={styles.seeAll}>Lihat semua</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.donaturSortRow}>
                  {DONATUR_SORT_OPTIONS.map(option => {
                    const isActive = option.value === donaturSort;
                    return (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.donaturSortChip,
                          isActive && styles.donaturSortChipActive,
                        ]}
                        onPress={() => setDonaturSort(option.value)}
                        accessibilityRole="button"
                        accessibilityLabel={`Urutkan donatur ${option.label}`}
                        accessibilityState={{selected: isActive}}>
                        <Text
                          style={[
                            styles.donaturSortLabel,
                            isActive && styles.donaturSortLabelActive,
                          ]}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {donatur.length === 0 ? (
                  <EmptyState icon={HandMoney} title="Belum ada donatur" />
                ) : (
                  donatur.map(item => (
                    <DonaturListItem
                      key={item.id}
                      donatur={item}
                      onPressAamiin={handlePressAamiin}
                    />
                  ))
                )}
              </View>
            ))}

          {activeTab === 'reports' &&
            (isProjectsLoading ? (
              <View style={styles.tabLoading}>
                <ActivityIndicator color={colors.primary[500]} />
              </View>
            ) : reportSalur.length === 0 ? (
              <EmptyState icon={FileText} title="Belum ada report salur" />
            ) : (
              <View style={styles.listSection}>
                <View style={styles.timelineWrapper}>
                  {reportSalur.slice(0, SALUR_LIST_LIMIT).map((report, index, visible) => (
                    <SalurTimelineItem
                      key={report.id}
                      item={report}
                      isLast={index === visible.length - 1}
                    />
                  ))}
                  {reportSalur.length > SALUR_LIST_LIMIT ? (
                    <SeeMoreOverlay
                      label="Lihat Semua Report Salur"
                      onPress={handleSeeAllReportSalur}
                    />
                  ) : null}
                </View>
              </View>
            ))}
        </View>
      </ScrollView>

      <FloatingDonationFooter
        isRutin={program.isRutin}
        donationLabel={program.donationLabel}
        donateButtonColor={program.ctaColor}
        onPressSecondary={handlePressSecondary}
        onPressDonate={handleDonateNow}
      />

      <ShareBottomSheet
        ref={shareSheetRef}
        onSelectOption={handleSelectShareOption}
      />
      <NominalBottomSheet
        key={nominalSheetKey}
        ref={nominalSheetRef}
        programTitle={program.title}
        programImageUrl={program.imageUrl}
        nominalType={program.nominalType}
        presets={program.nominalPresets.map(preset => ({
          amount: preset.nominal,
          iconUrl: preset.iconUrl,
          label: preset.label,
        }))}
        packages={program.packages}
        onConfirm={handleConfirmNominal}
      />
      <MetodePembayaranBottomSheet
        ref={metodeSheetRef}
        paymentMethods={paymentMethods}
        isLoadingMethods={isLoadingMethods}
        selectedMethod={selectedMethod}
        isAuthenticated={isAuthenticated}
        walletBalance={walletBalance}
        isLoadingWalletBalance={isLoadingWalletBalance}
        isWalletInsufficient={isWalletInsufficient}
        amount={confirmedAmount ?? 0}
        onSelectMethod={handleSelectMethod}
        onPressLoginForWallet={handlePressLoginForWallet}
        onPressTopupForWallet={handlePressTopupForWallet}
        onConfirm={handleConfirmMethod}
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
    paddingBottom: spacing['4xl'] * 2,
  },
  mediaWrapper: {
    position: 'relative',
  },
  media: {
    width: '100%',
    height: 220,
    backgroundColor: colors.neutral[200],
  },
  salesNotifOverlay: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.md,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  noteSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  tabContent: {
    paddingVertical: spacing.md,
  },
  listSection: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  tabLoading: {
    paddingVertical: spacing['2xl'],
    alignItems: 'center',
  },
  timelineWrapper: {
    position: 'relative',
  },
  donaturHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  donaturTotal: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  seeAll: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.primary[600],
    paddingVertical: spacing.sm,
  },
  donaturSortRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  donaturSortChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[100],
  },
  donaturSortChipActive: {
    backgroundColor: colors.primary[500],
  },
  donaturSortLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.neutral[600],
  },
  donaturSortLabelActive: {
    color: colors.neutral[0],
  },
});
