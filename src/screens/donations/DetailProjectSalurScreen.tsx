import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import type {BottomSheetModal} from '@gorhom/bottom-sheet';
import {FileText, HandMoney, MapPoint, Share} from '@solar-icons/react-native/Linear';
import {EmptyState} from '@/components/ui/EmptyState';
import {Icon} from '@/components/ui/Icon';
import {HeaderTransparent} from '@/components/shared/HeaderTransparent';
import {HeaderLight} from '@/components/shared/HeaderLight';
import {FundraiserCard} from '@/components/shared/FundraiserCard';
import {ProjectSalurInfoAlert} from '@/components/shared/ProjectSalurInfoAlert';
import {ProjectSalurAmountCards} from '@/components/shared/ProjectSalurAmountCards';
import {ProjectSalurProgressSection} from '@/components/shared/ProjectSalurProgressSection';
import {ProjectSalurTabBar} from '@/components/shared/ProjectSalurTabBar';
import {SalurTimelineItem} from '@/components/shared/SalurTimelineItem';
import {HtmlContent} from '@/components/shared/HtmlContent';
import {DonaturListItem} from '@/components/shared/DonaturListItem';
import {FloatingDonationFooter} from '@/components/shared/FloatingDonationFooter';
import {ShareBottomSheet, type ShareOption} from '@/components/shared/ShareBottomSheet';
import {NominalBottomSheet} from '@/components/shared/NominalBottomSheet';
import {MetodePembayaranBottomSheet} from '@/components/shared/MetodePembayaranBottomSheet';
import {useDetailProjectSalur} from '@/hooks/useDetailProjectSalur';
import {usePaymentMethodSelection} from '@/hooks/usePaymentMethodSelection';
import {useAuthStore} from '@/stores/authStore';
import {showToast} from '@/utils/toast';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {
  DetailProjectSalurScreenProps,
  RootStackNavigationProp,
} from '@/types/navigation';
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

const HEADER_IMAGE_HEIGHT = 220;

export default function DetailProjectSalurScreen({
  route,
}: DetailProjectSalurScreenProps): React.JSX.Element {
  const {
    projectSalurId,
    reopenMetodePembayaran,
    preservedAmount,
    preservedNominalLabel,
  } = route.params;
  const navigation = useNavigation<RootStackNavigationProp>();
  const isAuthenticated = useAuthStore(s => s.accessToken != null);
  const shareSheetRef = useRef<BottomSheetModal>(null);
  const nominalSheetRef = useRef<BottomSheetModal>(null);
  const metodeSheetRef = useRef<BottomSheetModal>(null);
  const hasHandledReopenRef = useRef(false);
  const hasNavigatedToAlurDonasiRef = useRef(false);
  const [confirmedAmount, setConfirmedAmount] = useState<number | null>(null);
  const [confirmedLabel, setConfirmedLabel] = useState('Nominal Donasi');
  const [nominalSheetKey, setNominalSheetKey] = useState(0);
  // Header transparan → light, threshold = tinggi gambar header — pola sama
  // dengan isHeaderCollapsed di useNewsDetail.
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);

  const {
    project,
    isLoading,
    isNotFound,
    activeTab,
    donatur,
    donaturSort,
    isDonaturLoading,
    setActiveTab,
    setDonaturSort,
  } = useDetailProjectSalur(projectSalurId);

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

  // Kembali dari AlurDonasiScreen harus mengosongkan pilihan nominal &
  // metode pembayaran — sama pola dengan DetailProgramScreen.
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
    if (hasHandledReopenRef.current || !project || !reopenMetodePembayaran) {
      return;
    }
    hasHandledReopenRef.current = true;
    setConfirmedAmount(preservedAmount ?? 0);
    setConfirmedLabel(preservedNominalLabel ?? 'Nominal Donasi');
    loadPaymentMethods();
    loadWalletBalance();
    metodeSheetRef.current?.present();
    // Hanya dijalankan sekali setelah project termuat.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project]);

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>): void {
    const scrollY = event.nativeEvent.contentOffset.y;
    const shouldCollapse = scrollY >= HEADER_IMAGE_HEIGHT;
    setIsHeaderCollapsed(prev => (prev === shouldCollapse ? prev : shouldCollapse));
  }

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

  function handlePressMitra(): void {
    if (!project) {
      return;
    }
    navigation.navigate('PerLembaga', {
      lembagaId: project.mitra.id,
      lembagaName: project.mitra.name,
    });
  }

  function handlePressProgramAlert(): void {
    if (!project) {
      return;
    }
    navigation.navigate('DetailProgram', {link: project.program.link});
  }

  function handleDonateNow(): void {
    if (!project) {
      return;
    }
    nominalSheetRef.current?.present();
  }

  function handleConfirmNominal(amount: number, label: string): void {
    if (!project) {
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
    if (!project || confirmedAmount === null || !selectedMethod) {
      return;
    }
    metodeSheetRef.current?.dismiss();
    hasNavigatedToAlurDonasiRef.current = true;
    navigation.navigate('AlurDonasi', {
      programId: project.program.id,
      programTitle: project.program.title,
      programImageUrl: project.program.imageUrl,
      nominalType: project.program.nominalType,
      presets: project.program.nominalPresets,
      packages: project.program.packages,
      preservedAmount: confirmedAmount,
      preservedNominalLabel: confirmedLabel,
      preservedMethod: selectedMethod,
      projectSalurId: project.id,
    });
  }

  function handlePressLoginForWallet(): void {
    metodeSheetRef.current?.dismiss();
    navigation.navigate('Login', {
      redirectTo: {
        screen: 'DetailProjectSalur',
        params: {
          projectSalurId,
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

  function handleSeeAllDonatur(): void {
    showToast('Fitur akan segera hadir.');
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

  if (isNotFound || !project) {
    return (
      <View style={styles.container}>
        <HeaderLight title="Detail Project Salur" onBack={handleBack} />
        <EmptyState
          icon={FileText}
          title="Project salur tidak tersedia"
          description="Project salur yang kamu cari tidak ditemukan atau sudah tidak tersedia."
        />
      </View>
    );
  }

  const shareButton = (
    <TouchableOpacity
      style={styles.headerIconButton}
      onPress={handleShare}
      accessibilityRole="button"
      accessibilityLabel="Bagikan project salur">
      <Icon
        icon={Share}
        size={22}
        color={isHeaderCollapsed ? colors.neutral[900] : colors.neutral[0]}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerOverlay}>
        {isHeaderCollapsed ? (
          <HeaderLight
            title={project.title}
            onBack={handleBack}
            rightSlot={shareButton}
          />
        ) : (
          <HeaderTransparent onBack={handleBack} rightSlot={shareButton} />
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}>
        <Image
          source={{uri: project.photoUrl}}
          style={styles.headerImage}
          resizeMode="cover"
          accessibilityRole="image"
          accessibilityLabel={project.title}
        />

        <View style={styles.section}>
          <FundraiserCard
            organization={{
              id: project.mitra.id,
              name: project.mitra.name,
              logoUrl: project.mitra.photoUrl,
              isVerified: project.mitra.isVerified,
            }}
            label="Lembaga Mitra"
            onPress={handlePressMitra}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>{project.title}</Text>
          <View style={styles.addressRow}>
            <Icon icon={MapPoint} size={16} color={colors.neutral[500]} />
            <Text style={styles.addressText}>{project.address}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <ProjectSalurInfoAlert
            programTitle={project.program.name}
            onPress={handlePressProgramAlert}
          />
        </View>

        <View style={styles.section}>
          <ProjectSalurAmountCards
            targetAmount={project.targetAmount}
            collectedAmount={project.collectedAmount}
          />
          <ProjectSalurProgressSection
            progressPercent={project.progressPercent}
            beneficiaryCount={project.beneficiaryCount}
            distributedAt={project.distributedAt}
          />
        </View>

        {project.descriptionHtml ? (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Deskripsi Project</Text>
            <HtmlContent html={project.descriptionHtml} />
          </View>
        ) : null}

        <View style={styles.tabBarWrapper}>
          <ProjectSalurTabBar activeTab={activeTab} onChange={setActiveTab} />
        </View>

        <View style={styles.tabContent}>
          {activeTab === 'report' &&
            (project.reports.length === 0 ? (
              <EmptyState icon={FileText} title="Belum ada report penyaluran" />
            ) : (
              <View style={styles.listSection}>
                <View style={styles.timelineWrapper}>
                  {project.reports.map((report, index, visible) => (
                    <SalurTimelineItem
                      key={report.id}
                      item={report}
                      isLast={index === visible.length - 1}
                    />
                  ))}
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
                    {project.donaturCount.toLocaleString('id-ID')} Donatur
                  </Text>
                  <TouchableOpacity
                    onPress={handleSeeAllDonatur}
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
        </View>
      </ScrollView>

      <FloatingDonationFooter
        isRutin={false}
        donationLabel={"Donasi"}
        onPressSecondary={handleShare}
        onPressDonate={handleDonateNow}
      />

      <ShareBottomSheet
        ref={shareSheetRef}
        title="Bagikan Project Salur"
        onSelectOption={handleSelectShareOption}
      />
      <NominalBottomSheet
        key={nominalSheetKey}
        ref={nominalSheetRef}
        programTitle={project.program.title}
        programImageUrl={project.program.imageUrl}
        nominalType={project.program.nominalType}
        presets={project.program.nominalPresets.map(preset => ({
          amount: preset.nominal,
          iconUrl: preset.iconUrl,
          label: preset.label,
        }))}
        packages={project.program.packages}
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
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: spacing['4xl'] * 2,
  },
  headerImage: {
    width: '100%',
    height: HEADER_IMAGE_HEIGHT,
    backgroundColor: colors.neutral[200],
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  addressText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.neutral[600],
  },
  sectionHeading: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  tabBarWrapper: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
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
