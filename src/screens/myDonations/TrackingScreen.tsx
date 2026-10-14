import React, {useRef} from 'react';
import {View, ScrollView, ActivityIndicator, TouchableOpacity, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {BottomSheetModal} from '@gorhom/bottom-sheet';
import {Share} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {HeaderLight} from '@/components/shared/HeaderLight';
import {TrackingTimeline} from '@/components/shared/TrackingTimeline';
import {TrackingProgramCard} from '@/components/shared/TrackingProgramCard';
import {TrackingProjectSalurCard} from '@/components/shared/TrackingProjectSalurCard';
import {TrackingReportCarousel} from '@/components/shared/TrackingReportCarousel';
import {PaymentAccordion} from '@/components/shared/PaymentAccordion';
import {TrackingActionList} from '@/components/shared/TrackingActionList';
import {ShareBottomSheet, type ShareOption} from '@/components/shared/ShareBottomSheet';
import {useTrackingDetail} from '@/hooks/useTrackingDetail';
import {showToast} from '@/utils/toast';
import {openWhatsappCs} from '@/utils/whatsapp';
import {colors, spacing} from '@/theme';
import type {RootStackNavigationProp, TrackingScreenProps} from '@/types/navigation';

const SHARE_OPTION_LABEL: Record<ShareOption, string> = {
  facebook: 'Facebook',
  twitter: 'Twitter',
  whatsapp: 'Whatsapp',
  'copy-url': 'Salin URL',
};

export default function TrackingScreen({
  route,
}: TrackingScreenProps): React.JSX.Element {
  const {donationId} = route.params;
  const navigation = useNavigation<RootStackNavigationProp>();
  const shareSheetRef = useRef<BottomSheetModal>(null);

  const {tracking, isLoading, isPaymentExpanded, togglePaymentExpanded} =
    useTrackingDetail(donationId);

  function handleBack(): void {
    // Kalau screen ini dibuka lewat navigation.reset (mis. redirect setelah
    // pembayaran sukses dari PaymentInvoiceScreen), tidak ada history buat
    // di-goBack — fallback ke list program (Donations tab), bukan
    // DetailProgram, karena DetailProgramScreen sendiri cuma goBack() polos
    // tanpa fallback juga, jadi kalau dituju bisa dead-end lagi kalau back
    // ditekan sekali lagi dari sana.
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.reset({
      index: 0,
      routes: [{name: 'Home', params: {screen: 'Donations'}}],
    });
  }

  function handleShare(): void {
    shareSheetRef.current?.present();
  }

  function handleSelectShareOption(option: ShareOption): void {
    shareSheetRef.current?.dismiss();
    showToast(`Fitur berbagi ke ${SHARE_OPTION_LABEL[option]} akan segera hadir.`);
  }

  function handlePressProgram(): void {
    if (!tracking) {
      return;
    }
    navigation.navigate('DetailProgram', {link: tracking.program.link});
  }

  function handlePressProjectSalur(): void {
    if (!tracking?.projectSalur) {
      return;
    }
    navigation.navigate('DetailProjectSalur', {projectSalurId: tracking.projectSalur.id});
  }

  function handlePressButuhBantuan(): void {
    openWhatsappCs();
  }

  function handlePressDonasiKeProgramLain(): void {
    navigation.navigate('Home', {screen: 'Donations'});
  }

  const shareButton = (
    <TouchableOpacity
      style={styles.headerIconButton}
      onPress={handleShare}
      accessibilityRole="button"
      accessibilityLabel="Bagikan status donasi">
      <Icon icon={Share} size={22} color={colors.neutral[900]} />
    </TouchableOpacity>
  );

  if (isLoading || !tracking) {
    return (
      <View style={styles.container}>
        <HeaderLight title="Status Donasi" onBack={handleBack} rightSlot={shareButton} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary[500]} />
        </View>
      </View>
    );
  }

  const showCardProgram =
    tracking.paymentStatus !== 'sukses' || tracking.salurStatus === 'menunggu';
  const showCardProjectSalur =
    tracking.paymentStatus === 'sukses' &&
    (tracking.salurStatus === 'persiapan' ||
      tracking.salurStatus === 'proses' ||
      tracking.salurStatus === 'selesai');
  const showReportCarousel =
    tracking.paymentStatus === 'sukses' &&
    (tracking.salurStatus === 'proses' || tracking.salurStatus === 'selesai');

  return (
    <View style={styles.container}>
      <HeaderLight
        title={`Status ${tracking.program.donationLabel}`}
        onBack={handleBack}
        rightSlot={shareButton}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <TrackingTimeline steps={tracking.statusSteps} />
        </View>

        {showCardProgram ? (
          <View style={styles.section}>
            <TrackingProgramCard program={tracking.program} onPress={handlePressProgram} />
          </View>
        ) : null}

        {showCardProjectSalur && tracking.projectSalur ? (
          <View style={styles.section}>
            <TrackingProjectSalurCard
              projectSalur={tracking.projectSalur}
              onPress={handlePressProjectSalur}
            />
          </View>
        ) : null}

        {showReportCarousel && tracking.reports.length > 0 ? (
          <View style={styles.section}>
            <TrackingReportCarousel reports={tracking.reports} />
          </View>
        ) : null}

        <View style={styles.section}>
          <PaymentAccordion
            payment={tracking.payment}
            paymentStatus={tracking.paymentStatus}
            isExpanded={isPaymentExpanded}
            onToggle={togglePaymentExpanded}
          />
        </View>

        <View style={styles.section}>
          <TrackingActionList
            onPressButuhBantuan={handlePressButuhBantuan}
            onPressDonasiKeProgramLain={handlePressDonasiKeProgramLain}
          />
        </View>
      </ScrollView>

      <ShareBottomSheet ref={shareSheetRef} onSelectOption={handleSelectShareOption} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[0],
  },
  headerIconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingBottom: spacing['3xl'],
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
});
