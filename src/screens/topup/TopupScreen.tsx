import React, {useRef} from 'react';
import {View, Text, ScrollView, TouchableOpacity, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {BottomSheetModal} from '@gorhom/bottom-sheet';
import {HeaderLight} from '@/components/shared/HeaderLight';
import {Button} from '@/components/ui/Button';
import {TopupAmountInput} from '@/components/shared/TopupAmountInput';
import type {TopupAmountPreset} from '@/components/shared/TopupAmountInput';
import {VoucherBottomSheet} from '@/components/shared/VoucherBottomSheet';
import {MetodePembayaranBottomSheet} from '@/components/shared/MetodePembayaranBottomSheet';
import {useTopup} from '@/hooks/useTopup';
import {formatCurrency} from '@/utils/formatCurrency';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {TopupScreenProps} from '@/types/navigation';
import type {PaymentMethod} from '@/types/payment';

const TOPUP_PRESETS: TopupAmountPreset[] = [
  {amount: 50_000, label: 'Rp 50rb'},
  {amount: 100_000, label: 'Rp 100rb'},
  {amount: 150_000, label: 'Rp 150rb'},
  {amount: 250_000, label: 'Rp 250rb'},
  {amount: 500_000, label: 'Rp 500rb'},
  {amount: 1_000_000, label: 'Rp 1jt'},
];

export default function TopupScreen({
  navigation,
}: TopupScreenProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const voucherSheetRef = useRef<BottomSheetModal>(null);
  const methodSheetRef = useRef<BottomSheetModal>(null);

  const {
    amount,
    selectedPreset,
    voucherCode,
    voucherDiscount,
    appliedVoucherCode,
    isClaimingVoucher,
    voucherError,
    paymentMethods,
    isLoadingMethods,
    selectedMethod,
    methodError,
    amountError,
    isSubmitting,
    selectPreset,
    setCustomAmount,
    setVoucherCode,
    claimVoucher,
    loadPaymentMethods,
    selectMethod,
    submitTopup,
  } = useTopup();

  function openVoucherSheet(): void {
    voucherSheetRef.current?.present();
  }

  function openMethodSheet(): void {
    loadPaymentMethods();
    methodSheetRef.current?.present();
  }

  function handleSelectMethod(method: PaymentMethod): void {
    selectMethod(method);
  }

  function handleConfirmMethod(): void {
    methodSheetRef.current?.dismiss();
  }

  async function handleClaimVoucher(): Promise<void> {
    const success = await claimVoucher();
    if (success) {
      voucherSheetRef.current?.dismiss();
    }
  }

  async function handleSubmit(): Promise<void> {
    const result = await submitTopup();
    if (result) {
      navigation.replace('PaymentInvoice', {
        donationId: result.topupId,
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
      <HeaderLight
        title="Isi Saldo Kebaikan"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Masukkan Nominal Saldo</Text>
          <TouchableOpacity
            onPress={openVoucherSheet}
            accessibilityRole="button"
            accessibilityLabel="Punya voucher?">
            <Text style={styles.voucherLink}>Punya voucher?</Text>
          </TouchableOpacity>
        </View>

        <TopupAmountInput
          amount={amount}
          selectedPreset={selectedPreset}
          presets={TOPUP_PRESETS}
          error={amountError}
          onSelectPreset={selectPreset}
          onChangeAmount={setCustomAmount}
        />

        {voucherDiscount > 0 ? (
          <View style={styles.voucherSummary}>
            <Text style={styles.voucherSummaryLabel}>
              Voucher {appliedVoucherCode} diterapkan
            </Text>
            <Text style={styles.voucherSummaryValue}>
              -{formatCurrency(voucherDiscount)}
            </Text>
          </View>
        ) : null}

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
      </ScrollView>

      <View style={[styles.footer, {paddingBottom: insets.bottom + spacing.md}]}>
        <Button
          label="Lanjutkan Pembayaran"
          onPress={handleSubmit}
          isLoading={isSubmitting}
          isDisabled={isSubmitting}
          size="lg"
        />
      </View>

      <VoucherBottomSheet
        ref={voucherSheetRef}
        voucherCode={voucherCode}
        onChangeCode={setVoucherCode}
        onClaim={handleClaimVoucher}
        isClaiming={isClaimingVoucher}
        error={voucherError}
      />
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[700],
  },
  voucherLink: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.primary[500],
  },
  voucherSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.semantic.successLight,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  voucherSummaryLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.semantic.success,
  },
  voucherSummaryValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.semantic.success,
  },
  card: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
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
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.neutral[0],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.neutral[200],
  },
});
