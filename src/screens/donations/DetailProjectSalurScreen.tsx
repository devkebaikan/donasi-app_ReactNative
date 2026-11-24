import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import type {BottomSheetModal} from '@gorhom/bottom-sheet';
import {FileText, MapPoint, Share} from '@solar-icons/react-native/Linear';
import {EmptyState} from '@/components/ui/EmptyState';
import {Icon} from '@/components/ui/Icon';
import {HeaderTransparent} from '@/components/shared/HeaderTransparent';
import {HeaderLight} from '@/components/shared/HeaderLight';
import {FundraiserCard} from '@/components/shared/FundraiserCard';
import {ProjectSalurInfoAlert} from '@/components/shared/ProjectSalurInfoAlert';
import {ProjectSalurAmountCards} from '@/components/shared/ProjectSalurAmountCards';
import {ProjectSalurProgressSection} from '@/components/shared/ProjectSalurProgressSection';
import {HtmlContent} from '@/components/shared/HtmlContent';
import {FloatingDonationFooter} from '@/components/shared/FloatingDonationFooter';
import {ShareBottomSheet, type ShareOption} from '@/components/shared/ShareBottomSheet';
import {NominalBottomSheet} from '@/components/shared/NominalBottomSheet';
import {MetodePembayaranBottomSheet} from '@/components/shared/MetodePembayaranBottomSheet';
import {useDetailProjectSalur} from '@/hooks/useDetailProjectSalur';
import {usePaymentMethodSelection} from '@/hooks/usePaymentMethodSelection';
import {useAuthStore} from '@/stores/authStore';
import {showToast} from '@/utils/toast';
import {colors} from '@/theme';
import type {
  DetailProjectSalurScreenProps,
  RootStackNavigationProp,
} from '@/types/navigation';
import type {PaymentMethod} from '@/types/payment';

const SHARE_OPTION_LABEL: Record<ShareOption, string> = {
  facebook: 'Facebook',
  twitter: 'Twitter',
  whatsapp: 'Whatsapp',
  'copy-url': 'Salin URL',
};
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
  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator color={colors.primary[500]} />
      </View>
    );
  }

  if (isNotFound || !project) {
    return (
      <View className="flex-1 bg-white">
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
      className="w-11 h-11 items-center justify-center"
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
    <View className="flex-1 bg-white">
      <View className="absolute top-0 left-0 right-0 z-10">
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
        contentContainerClassName="pb-32">
        <Image
          source={{uri: project.photoUrl}}
          className="w-full h-[220px] bg-neutral-200"
          resizeMode="cover"
          accessibilityRole="image"
          accessibilityLabel={project.title}
        />

        <View className="px-6 py-4 gap-2">
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

        <View className="px-6 py-4 gap-2">
          <Text className="text-lg font-bold text-neutral-900">{project.title}</Text>
          <View className="flex-row items-center gap-1">
            <Icon icon={MapPoint} size={16} color={colors.neutral[500]} />
            <Text className="flex-1 text-sm text-neutral-600">{project.address}</Text>
          </View>
        </View>

        <View className="px-6 py-4 gap-2">
          <ProjectSalurInfoAlert
            programTitle={project.program.title}
            onPress={handlePressProgramAlert}
          />
        </View>

        <View className="px-6 py-4 gap-2">
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
          <View className="px-6 py-4 gap-2">
            <Text className="text-base font-semibold text-neutral-900">Deskripsi Project</Text>
            <HtmlContent html={project.descriptionHtml} />
          </View>
        ) : null}
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
        programTitle={project.title}
        programImageUrl={project.photoUrl}
        shareUrl={`https://beramalbersama.com/project-salur/${project.id}`}
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
