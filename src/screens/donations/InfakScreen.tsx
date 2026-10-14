import React, {useEffect, useRef} from 'react';
import {View, Text, Image, ScrollView, TextInput, TouchableOpacity, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {BottomSheetModal} from '@gorhom/bottom-sheet';
import {HeaderLight} from '@/components/shared/HeaderLight';
import {Button} from '@/components/ui/Button';
import {TopupAmountInput} from '@/components/shared/TopupAmountInput';
import type {TopupAmountPreset} from '@/components/shared/TopupAmountInput';
import {MetodePembayaranBottomSheet} from '@/components/shared/MetodePembayaranBottomSheet';
import {InfakTabBar} from '@/components/shared/InfakTabBar';
import {DonaturCard} from '@/components/shared/DonaturCard';
import {DonationOptionToggle} from '@/components/shared/DonationOptionToggle';
import {useInfak} from '@/hooks/useInfak';
import {showToast} from '@/utils/toast';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {InfakScreenProps} from '@/types/navigation';
import type {PaymentMethod} from '@/types/payment';

const INFAK_BANNER_URL =
  'https://cdn.aksiberbagi.com/settings/home-banner-1777532258.jpeg';

const INFAK_PRESETS: TopupAmountPreset[] = [
  {amount: 10_000, label: 'Rp 10rb'},
  {amount: 25_000, label: 'Rp 25rb'},
  {amount: 50_000, label: 'Rp 50rb'},
  {amount: 100_000, label: 'Rp 100rb'},
];

export default function InfakScreen({
  navigation,
}: InfakScreenProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const methodSheetRef = useRef<BottomSheetModal>(null);

  const {
    activeTab,
    amount,
    selectedPreset,
    amountError,
    paymentMethods,
    isLoadingMethods,
    selectedMethod,
    methodError,
    donaturName,
    isEditingDonatur,
    prayer,
    isForOther,
    otherName,
    isSubmitting,
    setActiveTab,
    selectPreset,
    setCustomAmount,
    loadPaymentMethods,
    selectMethod,
    setDonaturName,
    setIsEditingDonatur,
    setPrayer,
    setIsForOther,
    setOtherName,
    submitInfak,
  } = useInfak();

  const isOnlineTab = activeTab === 'online';

  useEffect(() => {
    loadPaymentMethods();
    // Hanya dijalankan sekali saat screen mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChangeTab(tab: typeof activeTab): void {
    setActiveTab(tab);
    if (tab !== 'online') {
      showToast('Segera hadir');
    }
  }

  function openMethodSheet(): void {
    methodSheetRef.current?.present();
  }

  function handleSelectMethod(method: PaymentMethod): void {
    selectMethod(method);
  }

  function handleConfirmMethod(): void {
    methodSheetRef.current?.dismiss();
  }

  async function handleSubmit(): Promise<void> {
    const result = await submitInfak();
    if (result) {
      navigation.replace('PaymentInvoice', {
        donationId: result.donationId,
        invoiceId: result.invoiceId,
        paymentMethod: result.paymentMethod,
        accountNumber: result.accountNumber,
        bankName: result.bankName,
        amount: result.amount,
        adminFee: result.adminFee,
        totalAmount: result.totalAmount,
        expiredAt: result.expiredAt,
        paymentInstructions: result.paymentInstructions,
        isNewTransaction: true,
      });
    }
  }

  return (
    <View style={styles.container}>
      <HeaderLight title="Infak" onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <Image source={{uri: INFAK_BANNER_URL}} style={styles.banner} />

        <InfakTabBar activeTab={activeTab} onChange={handleChangeTab} />

        {isOnlineTab ? (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Nominal Infak</Text>
              <TopupAmountInput
                amount={amount}
                selectedPreset={selectedPreset}
                presets={INFAK_PRESETS}
                error={amountError}
                accessibilityLabel="Input nominal infak"
                onSelectPreset={selectPreset}
                onChangeAmount={setCustomAmount}
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Metode Pembayaran</Text>
              <TouchableOpacity
                style={styles.methodRow}
                onPress={openMethodSheet}
                accessibilityRole="button"
                accessibilityLabel="Pilih metode pembayaran">
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

            <DonaturCard
              name={donaturName}
              isEditing={isEditingDonatur}
              onChangeName={setDonaturName}
              onToggleEdit={() => setIsEditingDonatur(!isEditingDonatur)}
            />

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Doa & Pesan (opsional)</Text>
              <TextInput
                style={styles.prayerInput}
                value={prayer}
                onChangeText={setPrayer}
                placeholder="Tulis do'a atau pesan"
                placeholderTextColor={colors.neutral[400]}
                multiline
                accessibilityLabel="Doa dan pesan"
              />
            </View>

            <View style={styles.card}>
              <DonationOptionToggle
                label="Donasi untuk Orang Lain"
                value={isForOther}
                onValueChange={setIsForOther}
                inputValue={otherName}
                onInputChange={setOtherName}
                inputPlaceholder="Nama orang lain"
              />
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Fitur ini akan segera hadir.
            </Text>
          </View>
        )}
      </ScrollView>

      {isOnlineTab ? (
        <View style={[styles.footer, {paddingBottom: insets.bottom + spacing.md}]}>
          <Button
            label="Lanjutkan Pembayaran"
            onPress={handleSubmit}
            isLoading={isSubmitting}
            isDisabled={isSubmitting}
            size="lg"
          />
        </View>
      ) : null}

      <MetodePembayaranBottomSheet
        ref={methodSheetRef}
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
  banner: {
    width: '100%',
    height: 140,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[200],
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
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  methodValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
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
  prayerInput: {
    height: 88,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    fontSize: fontSize.md,
    color: colors.neutral[900],
    textAlignVertical: 'top',
  },
  emptyState: {
    paddingVertical: spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: fontSize.md,
    color: colors.neutral[500],
    textAlign: 'center',
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.neutral[0],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.neutral[200],
  },
});
