import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {BottomSheetModal} from '@gorhom/bottom-sheet';
import {Wallet} from '@solar-icons/react-native/Linear';
import {HeaderLight} from '@/components/shared/HeaderLight';
import {Button} from '@/components/ui/Button';
import {Icon} from '@/components/ui/Icon';
import {TopupAmountInput} from '@/components/shared/TopupAmountInput';
import type {TopupAmountPreset} from '@/components/shared/TopupAmountInput';
import {MetodePembayaranBottomSheet} from '@/components/shared/MetodePembayaranBottomSheet';
import {DonasiRutinTabBar} from '@/components/shared/DonasiRutinTabBar';
import {JadwalPicker} from '@/components/shared/JadwalPicker';
import {RepeatCountSelector} from '@/components/shared/RepeatCountSelector';
import {DonasiRutinSummary} from '@/components/shared/DonasiRutinSummary';
import {DonationOptionToggle} from '@/components/shared/DonationOptionToggle';
import {useDonasiRutinSetup} from '@/hooks/useDonasiRutinSetup';
import {useAuthStore} from '@/stores/authStore';
import {formatCurrency} from '@/utils/formatCurrency';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {DonasiRutinSetupScreenProps} from '@/types/navigation';
import type {PaymentMethod} from '@/types/payment';
import {RECURRING_INTENT} from '@/types/recurringDonation';

const SALDO_PRESETS: TopupAmountPreset[] = [
  {amount: 5_000, label: 'Rp 5rb'},
  {amount: 10_000, label: 'Rp 10rb'},
  {amount: 25_000, label: 'Rp 25rb'},
  {amount: 50_000, label: 'Rp 50rb'},
  {amount: 100_000, label: 'Rp 100rb'},
  {amount: 250_000, label: 'Rp 250rb'},
];

const BAYAR_PRESETS: TopupAmountPreset[] = [
  {amount: 2_000, label: 'Rp 2rb'},
  {amount: 5_000, label: 'Rp 5rb'},
  {amount: 10_000, label: 'Rp 10rb'},
];

export default function DonasiRutinSetupScreen({
  route,
  navigation,
}: DonasiRutinSetupScreenProps): React.JSX.Element {
  // Form ini dibuka dari dua arah: dari sebuah program (punya id, judul,
  // foto), atau dari pilihan jenis di DonasiRutinJenisScreen (tanpa program —
  // programnya ditentukan `intent`). Lihat RECURRING_INTENT.
  const params = route.params ?? {};
  const intent = params.intent ?? 'program';
  const intentConfig = intent === 'program' ? null : RECURRING_INTENT[intent];

  const programId = intentConfig ? intentConfig.programId : params.programId ?? '';
  const programTitle = intentConfig ? intentConfig.title : params.programTitle ?? '';
  const programImageUrl = params.programImageUrl;

  const insets = useSafeAreaInsets();
  const isAuthenticated = useAuthStore(s => s.accessToken != null);

  const metodeSheetRef = useRef<BottomSheetModal>(null);

  const {
    activeTab,
    amount,
    selectedPreset,
    frequency,
    scheduleHour,
    scheduleMinute,
    isOnBehalfEnabled,
    onBehalfOf,
    isPrayerEnabled,
    prayer,
    repeatCount,
    repeatCountError,
    amountError,
    adminFee,
    donaturName,
    donaturPhone,
    paymentMethods,
    isLoadingMethods,
    selectedMethod,
    methodError,
    walletBalance,
    isLoadingWalletBalance,
    isWalletInsufficient,
    isSubmitting,
    setActiveTab,
    selectPreset,
    setCustomAmount,
    setFrequency,
    setScheduleHour,
    setScheduleMinute,
    setIsOnBehalfEnabled,
    setOnBehalfOf,
    setIsPrayerEnabled,
    setPrayer,
    setRepeatCount,
    setDonaturName,
    setDonaturPhone,
    loadPaymentMethods,
    loadWalletBalance,
    selectMethod,
    submitSaldo,
    submitBayar,
  } = useDonasiRutinSetup({programId});

  const isBayarTab = activeTab === 'bayar';
  const walletShortfall = Math.max(0, amount - walletBalance);

  function openMetodeSheet(): void {
    loadPaymentMethods();
    metodeSheetRef.current?.present();
  }

  useEffect(() => {
    loadWalletBalance();
    // Hanya dijalankan sekali saat screen mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Nominal & metode pembayaran diisi langsung di form ini (pola sama dengan
  // TopupScreen) — tidak ada lagi bottom sheet nominal yang menyambut user
  // begitu screen terbuka.
  function handleChangeTab(tab: typeof activeTab): void {
    setActiveTab(tab);
    if (tab === 'saldo') {
      loadWalletBalance();
    }
  }

  function handleSelectMethod(method: PaymentMethod): void {
    selectMethod(method);
  }

  function handleConfirmMethod(): void {
    metodeSheetRef.current?.dismiss();
  }

  function handlePressTopup(): void {
    navigation.navigate('Topup', {redirectAfter: 'donasi-rutin'});
  }

  // Gerbang login untuk seluruh alur rutin ada DI SINI. Screen pilih jenis
  // sengaja terbuka untuk tamu supaya mereka bisa melihat pilihannya dulu.
  function requireLogin(): boolean {
    if (isAuthenticated) {
      return false;
    }
    navigation.navigate('Login', {
      redirectTo: {screen: 'DonasiRutinSetup', params: route.params},
    });
    return true;
  }

  async function handleSubmitSaldo(): Promise<void> {
    if (requireLogin()) {
      return;
    }
    const result = await submitSaldo();
    if (result) {
      navigation.replace('DonasiRutinSukses', {
        programTitle,
        amount,
        frequency,
      });
    }
  }

  async function handleSubmitBayar(): Promise<void> {
    if (requireLogin()) {
      return;
    }
    const result = await submitBayar();
    if (result) {
      navigation.replace('PaymentInvoice', {...result, isNewTransaction: true});
    }
  }

  return (
    <View style={styles.container}>
      <HeaderLight title="Donasi Rutin" onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {programImageUrl ? (
          <Image source={{uri: programImageUrl}} style={styles.programImage} />
        ) : null}
        <Text
          style={[styles.programTitle, !programImageUrl && styles.programTitleAlone]}
          numberOfLines={2}>
          {programTitle}
        </Text>
        {intentConfig ? (
          <Text style={styles.intentDescription}>{intentConfig.description}</Text>
        ) : null}

        <DonasiRutinTabBar activeTab={activeTab} onChange={handleChangeTab} />

        <Text style={styles.sectionTitle}>
          {isBayarTab ? 'Nominal Donasi Rutin' : 'Nominal donasi'}
        </Text>
        <TopupAmountInput
          amount={amount}
          selectedPreset={selectedPreset}
          presets={isBayarTab ? BAYAR_PRESETS : SALDO_PRESETS}
          error={amountError}
          accessibilityLabel="Input nominal donasi rutin"
          onSelectPreset={selectPreset}
          onChangeAmount={setCustomAmount}
        />

        {isBayarTab ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Metode Pembayaran</Text>
            <TouchableOpacity
              style={styles.methodRow}
              onPress={openMetodeSheet}
              accessibilityRole="button"
              accessibilityLabel="Pilih metode pembayaran">
              {selectedMethod?.logoUrl ? (
                <Image
                  source={{uri: selectedMethod.logoUrl}}
                  style={styles.methodLogo}
                  resizeMode="contain"
                  accessibilityRole="image"
                  accessibilityLabel={`Logo ${selectedMethod.name}`}
                />
              ) : null}
              <Text style={styles.methodValue}>
                {selectedMethod ? selectedMethod.name : 'Pilih metode pembayaran'}
              </Text>
              <Text style={styles.methodAction}>
                {selectedMethod ? 'Ubah' : 'Pilih'}
              </Text>
            </TouchableOpacity>
            {methodError ? (
              <Text style={styles.errorText} accessibilityLiveRegion="polite">
                {methodError}
              </Text>
            ) : null}
          </View>
        ) : null}

        {!isBayarTab ? (
          <View style={styles.card}>
            {/* Susunan baris ini mengikuti SaldoCard di Home: ikon dompet,
                judul + saldo, lalu tombol Top Up di ujung kanan. Tombol di
                sini muncul terus — bukan cuma saat saldo kurang seperti
                tombol di kotak peringatan di bawahnya. */}
            <View style={styles.balanceHeader}>
              <View style={styles.balanceHeaderLeft}>
                <View style={styles.balanceIconWrapper}>
                  <Icon icon={Wallet} size={24} color={colors.primary[500]} />
                </View>
                <View style={styles.balanceTextWrapper}>
                  <Text style={styles.cardTitle}>Saldo Saku Berbagi</Text>
                  <Text style={styles.balanceValue}>
                    {isLoadingWalletBalance
                      ? 'Memuat saldo...'
                      : formatCurrency(walletBalance)}
                  </Text>
                </View>
              </View>
              <Button
                label="Top Up"
                size="smWide"
                onPress={handlePressTopup}
                accessibilityLabel="Top up saldo Saku Berbagi"
              />
            </View>
            {isWalletInsufficient ? (
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>
                  ⚠ Saldo tidak mencukupi untuk nominal ini
                </Text>
                <Text style={styles.shortfallText}>
                  Kurang {formatCurrency(walletShortfall)}
                </Text>
                <TouchableOpacity
                  style={styles.topupButton}
                  onPress={handlePressTopup}
                  accessibilityRole="button"
                  accessibilityLabel="Top up sekarang">
                  <Text style={styles.topupButtonText}>Top up sekarang</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Jadwal donasi</Text>
          <JadwalPicker
            frequency={frequency}
            onChangeFrequency={setFrequency}
            scheduleHour={scheduleHour}
            scheduleMinute={scheduleMinute}
            onChangeHour={setScheduleHour}
            onChangeMinute={setScheduleMinute}
          />
        </View>

        {isBayarTab ? (
          <View style={styles.card}>
            <RepeatCountSelector
              value={repeatCount}
              onChange={setRepeatCount}
              error={repeatCountError}
            />
          </View>
        ) : null}

        {/* Informasi donatur sengaja di bawah jadwal & jumlah pengulangan:
            yang menentukan bentuk donasinya diisi dulu, identitas belakangan. */}
        {isBayarTab ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Informasi Donatur</Text>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Nama Lengkap</Text>
              <TextInput
                style={styles.textInput}
                value={donaturName}
                onChangeText={setDonaturName}
                placeholder="Hamba Allah"
                placeholderTextColor={colors.neutral[400]}
                accessibilityLabel="Nama lengkap donatur"
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Nomor HP (WA)</Text>
              <TextInput
                style={styles.textInput}
                value={donaturPhone}
                onChangeText={setDonaturPhone}
                placeholder="Nomor Telepon"
                placeholderTextColor={colors.neutral[400]}
                keyboardType="phone-pad"
                accessibilityLabel="Nomor HP donatur"
              />
            </View>
          </View>
        ) : null}

        {isBayarTab ? (
          <DonasiRutinSummary
            amount={amount}
            repeatCount={repeatCount}
            adminFee={adminFee}
          />
        ) : (
          <View style={styles.card}>
            <DonationOptionToggle
              label="Donasi atas nama orang lain"
              value={isOnBehalfEnabled}
              onValueChange={setIsOnBehalfEnabled}
              inputValue={onBehalfOf}
              onInputChange={setOnBehalfOf}
              inputPlaceholder="Nama penerima manfaat"
            />
            <DonationOptionToggle
              label="Tulis do'a dan pesan"
              value={isPrayerEnabled}
              onValueChange={setIsPrayerEnabled}
              inputValue={prayer}
              onInputChange={setPrayer}
              inputPlaceholder="Tulis do'a atau pesan"
              multiline
            />
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, {paddingBottom: insets.bottom + spacing.md}]}>
        {isBayarTab ? (
          <Button
            label="Bismillah, Mulai Sedekah Rutin"
            onPress={handleSubmitBayar}
            isLoading={isSubmitting}
            isDisabled={isSubmitting}
            size="lg"
          />
        ) : (
          <View style={styles.saldoFooterRow}>
            <View>
              <Text style={styles.footerTotalLabel}>Total</Text>
              <Text style={styles.footerTotalValue}>{formatCurrency(amount)}</Text>
            </View>
            <View style={styles.saldoFooterButton}>
              <Button
                label="Konfirmasi"
                onPress={handleSubmitSaldo}
                isLoading={isSubmitting}
                isDisabled={isSubmitting}
                size="lg"
              />
            </View>
          </View>
        )}
      </View>

      <MetodePembayaranBottomSheet
        ref={metodeSheetRef}
        paymentMethods={paymentMethods}
        isLoadingMethods={isLoadingMethods}
        selectedMethod={selectedMethod}
        onSelectMethod={handleSelectMethod}
        onConfirm={handleConfirmMethod}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  programImage: {
    width: '100%',
    height: 140,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[200],
  },
  programTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
    marginTop: -spacing.sm,
  },
  // Tanpa foto program di atasnya, judul tidak perlu ditarik naik.
  programTitleAlone: {
    marginTop: 0,
  },
  intentDescription: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
    marginTop: -spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[700],
    marginBottom: -spacing.sm,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    gap: spacing.md,
  },
  // Ukuran logo disamakan dengan baris metode pembayaran di
  // PaymentInvoiceScreen supaya metode yang sama tidak tampil beda besar
  // antara form dan invoice.
  methodLogo: {
    width: 32,
    height: 24,
  },
  methodValue: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.neutral[900],
  },
  methodAction: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.primary[500],
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.semantic.error,
  },
  card: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[700],
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    color: colors.neutral[600],
  },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.md,
    color: colors.neutral[900],
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  balanceHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  balanceIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceTextWrapper: {
    flex: 1,
    gap: 2,
  },
  balanceValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
  warningBox: {
    backgroundColor: colors.semantic.warningLight,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  warningText: {
    fontSize: fontSize.sm,
    color: colors.semantic.warning,
    fontWeight: fontWeight.medium,
  },
  shortfallText: {
    fontSize: fontSize.sm,
    color: colors.semantic.error,
    fontWeight: fontWeight.semiBold,
  },
  topupButton: {
    alignSelf: 'flex-start',
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.primary[500],
  },
  topupButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[0],
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.neutral[0],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.neutral[200],
  },
  saldoFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  footerTotalLabel: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
  },
  footerTotalValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
  saldoFooterButton: {
    minWidth: 160,
  },
});
