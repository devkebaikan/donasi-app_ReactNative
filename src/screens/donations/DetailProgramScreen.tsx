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
import {AltArrowRight, FileText, HandMoney, Soundwave, UsersGroupTwoRounded} from '@solar-icons/react-native/Linear';
import {EmptyState} from '@/components/ui/EmptyState';
import {Avatar} from '@/components/ui/Avatar';
import {DetailProgramHeader} from '@/components/shared/DetailProgramHeader';
import {ProgramInfoCapaian} from '@/components/shared/ProgramInfoCapaian';
import {ProjectSalurTerdekatSection} from '@/components/shared/ProjectSalurTerdekatSection';
import {PenggalangDanaAccordion} from '@/components/shared/PenggalangDanaAccordion';
import {SalesNotifCard} from '@/components/shared/SalesNotifCard';
import {FundraiserCard} from '@/components/shared/FundraiserCard';
import {ProgramTabBar} from '@/components/shared/ProgramTabBar';
import {StorySection} from '@/components/shared/StorySection';
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
import {likeDonaturPrayer} from '@/services/donationService';
import {showToast} from '@/utils/toast';
import {formatCurrency} from '@/utils/formatCurrency';
import {formatFullDate} from '@/utils/formatDate';
import {colors} from '@/theme';
import {sanitizeImageUrl} from '@/utils/imageUrl';
import type {DetailProgramScreenProps, RootStackNavigationProp} from '@/types/navigation';
import type {DonaturSort} from '@/types/programDetail';
import type {PaymentMethod} from '@/types/payment';
import { Icon } from '@/components/ui/Icon';

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

  // Ambil paket data program lengkap dalam 1 objek terpadu `data`
  const {
    data,
    isLoading,
    isNotFound,
    isProjectsLoading,
    isDonaturLoading,
    isFundraisersLoading,
    activeTab,
    setActiveTab,
  } = useDetailProgram(link);

  const program = data.detail;
  const {salesNotif, projects, reportSalur, donatur, fundraisers} = data;

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
  } = usePaymentMethodSelection({amount: confirmedAmount ?? 0, program_link: link});

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
    const mitraId = program?.mitra?.id ?? program?.organization?.id;
    const mitraName = program?.mitra?.name ?? program?.organization?.name;
    if (!mitraId) {
      return;
    }
    navigation.navigate('PerLembaga', {
      lembagaId: String(mitraId),
      lembagaName: mitraName ?? 'Lembaga',
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
      programLink: link,
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

  async function handlePressAamiin(item: any): Promise<void> {
    if (item?.id) {
      await likeDonaturPrayer(item.id);
    }
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
          title="Program tidak ditemukan"
          description="Program yang Anda cari tidak tersedia."
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
      {/* Header Bar */}
      <DetailProgramHeader
        title={program.title}
        onPressBack={handleBack}
        onPressShare={handleShare}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="pb-32">
        {/* Banner Image with Sales Notification */}
        <View className="relative">
          <Image
            source={{uri: sanitizeImageUrl(program.image || program.imageUrl)}}
            className="w-full h-56 bg-neutral-200"
            resizeMode="cover"
            accessibilityRole="image"
            accessibilityLabel={program.title}
          />
          <View className="absolute left-4 right-4 bottom-3">
            <SalesNotifCard items={salesNotif} />
          </View>
        </View>

        {/* Profil Lembaga Mitra (Header Mitra di bawah banner) */}
        {program.mitra || program.organization ? (
          <FundraiserCard
            organization={
              program.organization ?? {
                id: String(program.mitra?.id),
                name: program.mitra?.name ?? '',
                logoUrl: program.mitra?.image ?? '',
                isVerified: true,
              }
            }
            onPress={handlePressFundraiser}
          />
        ) : null}

        {/* Info Capaian & Donasi Tersedia */}
        <ProgramInfoCapaian program={program} />

        {/* Info Box Banner (Informasi rencana dan penyaluran) */}
       <View className="mx-4 my-2 flex-row items-start gap-3 rounded-xl border border-cyan-100 bg-cyan-50/70 p-3">
          {/* Icon */}
          <View className="mt-0.5 h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-100">
            <Icon
              icon={Soundwave}
              size={18}
              color={colors.primary[600]}
            />
          </View>

          {/* Content */}
          <View className="min-w-0 flex-1">
            <Text className="text-xs leading-relaxed text-gray-700">
              Alhamdulillah, Donasi sebesar{' '}
              <Text className="font-semibold text-gray-900">
                {formatCurrency(
                  Number(
                    program.nominal_achieved -
                    program.no_project_nominal.nominal
                  )
                )}
              </Text>{' '}
              telah tersalurkan untuk{' '}
              <Text className="font-semibold text-gray-900">
                {(program.total_beneficiery ??
                  program.totalBeneficiary ??
                  0).toLocaleString('id-ID')}
              </Text>{' '}
              penerima manfaat. Semakin banyak donasi yang tersedia,
              semakin besar bantuan yang bisa disalurkan oleh program ini.
            </Text>
          </View>
        </View>


        {/* Accordion Tentang Penggalang Dana */}
        <PenggalangDanaAccordion
          organization={
            program.organization ?? {
              id: String(program.mitra?.id),
              name: program.mitra?.name ?? '',
              logoUrl: program.mitra?.image ?? '',
              isVerified: true,
            }
          }
        />

        {/* Rencana Salur Terdekat */}
        {((program.last_two_projects && program.last_two_projects.length > 0)) ? (
          <ProjectSalurTerdekatSection
            items={program.last_two_projects}
            onPressNext={handlePressDetailProjectSalur}
            onPressSeeAll={handleSeeAllProjectSalur}
          />
        ) : null}

        {/* Tab Navigasi: Cerita, Salur, Donatur, Fundraiser */}
        <View className="mt-4">
          <ProgramTabBar activeTab={activeTab} onChange={setActiveTab} />
        </View>

        {/* Tab Content Area */}
        <View className="py-2">
          {activeTab === 'about' && (
            program.content || program.contentHtml ? (
              <StorySection htmlContent={program.content || program.contentHtml} />
            ) : (
              <EmptyState
                icon={FileText}
                title="Belum ada cerita program"
                description="Cerita atau informasi detail mengenai program ini belum tersedia."
              />
            )
          )}

          {activeTab === 'projects' &&
            (isProjectsLoading ? (
              <View className="py-8 items-center">
                <ActivityIndicator color={colors.primary[500]} />
              </View>
            ) : !data.report && projects.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="Belum ada Laporan Penyaluran"
                description="Laporan penyaluran donasi untuk program ini belum tersedia."
              />
            ) : data.report ? (
              <View className="px-4 gap-3">
                {/* Title Badge "Laporan Penyaluran" */}
                <View className="flex-row items-center gap-2 mb-1">
                  <View className="px-3.5 py-1.5 rounded-full bg-primary-50 border border-primary-200">
                    <Text className="text-xs font-semibold text-primary-700">
                      Laporan Penyaluran
                    </Text>
                  </View>
                </View>

                {/* Report Card (sesuai TabSection Astro) */}
                <View className="bg-primary-50/50 rounded-xl p-4 border border-primary-100">
                  <View className="flex-row items-center gap-3 mb-3">
                    <Avatar
                      uri={data.report.mitra.photoUrl || null}
                      name={data.report.mitra.name || 'Beramal Bersama'}
                      size={40}
                    />
                    <View className="flex-1 min-w-0">
                      <Text
                        className="font-semibold text-neutral-900 text-sm truncate"
                        numberOfLines={1}>
                        {data.report.mitra.name || 'Beramal Bersama'}
                      </Text>
                      <Text className="text-xs text-neutral-500 mt-0.5">
                        {formatFullDate(data.report.distributedAt)}
                      </Text>
                    </View>
                  </View>

                  {data.report.photoUrl ? (
                    <Image
                      source={{uri: data.report.photoUrl}}
                      className="w-full h-44 rounded-lg bg-neutral-200 mb-3"
                      resizeMode="cover"
                      accessibilityRole="image"
                      accessibilityLabel={data.report.title}
                    />
                  ) : null}

                  <Text className="font-bold text-neutral-900 text-base mb-2">
                    {data.report.title}
                  </Text>

                  {data.report.descriptionHtml ? (
                    <View className="py-1">
                      <HtmlContent html={data.report.descriptionHtml} />
                    </View>
                  ) : null}
                </View>

                {/* Tombol Lihat Dampak Selengkapnya */}
                <TouchableOpacity
                  onPress={handleSeeAllReportSalur}
                  className="mt-2 py-3 px-4 rounded-xl bg-primary-500 items-center justify-center flex-row gap-2 active:opacity-80"
                  accessibilityRole="button"
                  accessibilityLabel="Lihat Dampak Kebaikanmu Selengkapnya">
                  <Text className="text-white text-sm font-semibold">
                    Lihat Dampak Kebaikanmu Selengkapnya
                  </Text>
                  <Icon icon={AltArrowRight} size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
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
                <View className="flex-row items-center justify-between mb-1">
                  <View className="flex-row items-center gap-2">
                    <View className="px-3.5 py-1.5 rounded-full bg-primary-50 border border-primary-200">
                      <Text className="text-xs font-semibold text-primary-700">
                        Donatur
                      </Text>
                    </View>
                    <View className="min-w-[24px] h-6 px-2 rounded-full bg-primary-600 items-center justify-center">
                      <Text className="text-xs font-bold text-white">
                        {Number(program.total_donors ?? program.total_donaturs ?? donatur.length).toLocaleString('id-ID')}
                      </Text>
                    </View>
                  </View>
                  {donatur.length > 0 && (
                    <TouchableOpacity
                      onPress={handleSeeAll}
                      accessibilityRole="button"
                      accessibilityLabel="Lihat semua donatur">
                      <Text className="text-sm font-semibold text-primary-600 py-2">Lihat semua</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {donatur.length === 0 ? (
                  <EmptyState
                    icon={HandMoney}
                    title="Belum ada Donatur"
                    description="Jadilah donatur pertama untuk program ini"
                  />
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
            (isFundraisersLoading ? (
              <View className="py-8 items-center">
                <ActivityIndicator color={colors.primary[500]} />
              </View>
            ) : fundraisers.length === 0 ? (
              <EmptyState
                icon={UsersGroupTwoRounded}
                title="Belum ada Fundraiser"
                description="Jadilah fundraiser pertama untuk program ini"
              />
            ) : (
              <View className="px-4 gap-3">
                <View className="flex-row items-center gap-2 mb-1">
                  <View className="px-3.5 py-1.5 rounded-full bg-primary-50 border border-primary-200">
                    <Text className="text-xs font-semibold text-primary-700">
                      Fundraiser
                    </Text>
                  </View>
                  <View className="min-w-[24px] h-6 px-2 rounded-full bg-primary-600 items-center justify-center">
                    <Text className="text-xs font-bold text-white">
                      {fundraisers.length}
                    </Text>
                  </View>
                </View>

                {fundraisers.map(item => (
                  <View
                    key={item.id}
                    className="flex-row items-center gap-3 p-3.5 bg-white rounded-xl border border-neutral-100 shadow-sm">
                    <View className="w-10 h-10 rounded-full bg-primary-100 items-center justify-center">
                      <Text className="text-sm font-bold text-primary-700">
                        {(item.name || 'F').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View className="flex-1 min-w-0">
                      <Text className="font-semibold text-neutral-900 text-sm truncate" numberOfLines={1}>
                        {item.name || 'Fundraiser'}
                      </Text>
                      <Text className="text-xs text-neutral-500 mt-0.5">
                        Mengajak{' '}
                        <Text className="font-bold text-neutral-800">
                          {item.totalDonors} orang
                        </Text>{' '}
                        berdonasi
                      </Text>
                    </View>
                    <Text className="text-sm font-bold text-primary-600">
                      {formatCurrency(item.totalAmount)}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
        </View>
      </ScrollView>

      {/* Floating Bottom Bar: Rutin & Donasi Sekarang */}
      <FloatingDonationFooter
        isRutin={Boolean(program.is_rutin ?? program.isRutin)}
        donationLabel={program.donationLabel ?? program.tipe?.name ?? 'Donasi'}
        donateButtonColor={program.cta_color ?? program.ctaColor}
        onPressSecondary={handlePressSecondary}
        onPressDonate={handleDonateNow}
      />

      {/* Share Bottom Sheet */}
      <ShareBottomSheet
        ref={shareSheetRef}
        onSelectOption={handleSelectShareOption}
      />

      {/* Nominal Bottom Sheet */}
      <NominalBottomSheet
        key={nominalSheetKey}
        ref={nominalSheetRef}
        programTitle={program.title}
        programImageUrl={program.image || program.imageUrl}
        nominalType={program.nominalType ?? (program.jenis_nominal === 'paket' ? 'paket' : 'biasa')}
        program_link={link}
        packages={program.packages}
        onConfirm={handleConfirmNominal}
      />

      {/* Payment Method Bottom Sheet */}
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
