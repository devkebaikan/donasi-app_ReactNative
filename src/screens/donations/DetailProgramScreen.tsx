import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
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
import {colors} from '@/theme';
import {sanitizeImageUrl} from '@/utils/imageUrl';
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
      setNominalSheetKey(currentKey => currentKey + 1);
    }, [resetSelection]),
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
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator color={colors.primary[500]} />
      </View>
    );
  }

  if (isNotFound || !program) {
    return (
      <View className="flex-1 bg-white" style={{paddingTop: insets.top}}>
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
    <View className="flex-1 bg-white" style={{paddingTop: insets.top}}>
      <DetailProgramHeader
        title={program.title}
        onPressBack={handleBack}
        onPressShare={handleShare}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32">
        <View className="relative">
          <Image
            source={{uri: sanitizeImageUrl(program.imageUrl)}}
            className="w-full h-56 bg-neutral-200"
            resizeMode="cover"
            accessibilityRole="image"
            accessibilityLabel={program.title}
          />
          <View className="absolute left-4 right-4 bottom-3">
            <SalesNotifCard items={salesNotif} />
          </View>
        </View>

        {program.organization ? (
          <InfoTerkiniCard
            organizationName={program.organization.name}
            onPressSelengkapnya={handlePressFundraiser}
          />
        ) : null}

        <ProgramInfoCapaian
          program={program}
          expandedContent={
            <ProjectSalurTerdekatSection
              items={program.nearestProjects}
              onPressNext={handlePressDetailProjectSalur}
            />
          }
        />

        <View className="px-4 pb-3 gap-2">
          <ProgramAvailabilityNote />
          {program.organization ? (
            <FundraiserCard
              organization={program.organization}
              onPress={handlePressFundraiser}
            />
          ) : null}
        </View>

        <ProgramTabBar activeTab={activeTab} onChange={setActiveTab} />

        <View className="py-3">
          {activeTab === 'about' && (
            <View className="px-4 py-3 gap-2">
              {program.contentHtml ? (
                <HtmlContent html={program.contentHtml} />
              ) : (
                <EmptyState icon={FileText} title="Belum ada cerita program" />
              )}
            </View>
          )}

          {activeTab === 'projects' &&
            (isProjectsLoading ? (
              <View className="py-8 items-center">
                <ActivityIndicator color={colors.primary[500]} />
              </View>
            ) : projects.length === 0 ? (
              <EmptyState icon={FileText} title="Belum ada project salur" />
            ) : (
              <View className="px-4 gap-3">
                <View className="relative">
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
              <View className="py-8 items-center">
                <ActivityIndicator color={colors.primary[500]} />
              </View>
            ) : (
              <View className="px-4 gap-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-base font-semibold text-neutral-900">
                    {program.donaturCount.toLocaleString('id-ID')} Donatur
                  </Text>
                  <TouchableOpacity
                    onPress={handleSeeAll}
                    accessibilityRole="button"
                    accessibilityLabel="Lihat semua donatur">
                    <Text className="text-sm font-semibold text-primary-600 py-2">Lihat semua</Text>
                  </TouchableOpacity>
                </View>

                <View className="flex-row gap-2">
                  {DONATUR_SORT_OPTIONS.map(option => {
                    const isActive = option.value === donaturSort;
                    return (
                      <TouchableOpacity
                        key={option.value}
                        className={`px-4 py-1.5 rounded-full ${
                          isActive ? 'bg-primary-500' : 'bg-neutral-100'
                        }`}
                        onPress={() => setDonaturSort(option.value)}
                        accessibilityRole="button"
                        accessibilityLabel={`Urutkan donatur ${option.label}`}
                        accessibilityState={{selected: isActive}}>
                        <Text
                          className={`text-xs font-medium ${
                            isActive ? 'text-white' : 'text-neutral-600'
                          }`}>
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
              <View className="py-8 items-center">
                <ActivityIndicator color={colors.primary[500]} />
              </View>
            ) : reportSalur.length === 0 ? (
              <EmptyState icon={FileText} title="Belum ada report salur" />
            ) : (
              <View className="px-4 gap-3">
                <View className="relative">
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
