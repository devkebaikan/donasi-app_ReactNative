import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ChatRoundLine, DangerTriangle, Heart, Wallet} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {HeaderLight} from '@/components/shared/HeaderLight';
import {Button} from '@/components/ui/Button';
import {PaymentBanner} from '@/components/shared/PaymentBanner';
import {CopyableField} from '@/components/shared/CopyableField';
import {PaymentInstructions} from '@/components/shared/PaymentInstructions';
import {PaymentFailedState} from '@/components/shared/PaymentFailedState';
import {DonationDoaDialog} from '@/components/shared/DonationDoaDialog';
import {usePaymentInvoice} from '@/hooks/usePaymentInvoice';
import {formatCurrency} from '@/utils/formatCurrency';
import {showToast} from '@/utils/toast';
import {openWhatsappCs} from '@/utils/whatsapp';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {PaymentInvoiceScreenProps} from '@/types/navigation';

const HEART_ROW_COUNT = 5;

function formatAccountNumber(value: string): string {
  return value.match(/.{1,4}/g)?.join(' ') ?? value;
}

function splitAmountHighlight(formatted: string): {prefix: string; suffix: string} {
  if (formatted.length <= 3) {
    return {prefix: '', suffix: formatted};
  }
  return {prefix: formatted.slice(0, -3), suffix: formatted.slice(-3)};
}

export default function PaymentInvoiceScreen({
  route,
  navigation,
}: PaymentInvoiceScreenProps): React.JSX.Element {
  const {
    donationId,
    paymentMethod,
    paymentMethodType,
    paymentMethodLogoUrl,
    checkoutUrl,
    accountNumber,
    accountHolderName,
    totalAmount,
    expiredAt,
    paymentInstructions,
    programId,
    programTitle,
    programImageUrl,
    isNewTransaction,
  } = route.params;
  const insets = useSafeAreaInsets();
  // Muncul cuma sekali, dan cuma kalau screen ini dibuka lewat redirect
  // langsung setelah transaksi berhasil dibuat (`isNewTransaction: true`
  // dikirim eksplisit oleh pemanggil). Kalau screen ini dibuka ulang untuk
  // invoice yang sudah ada sebelumnya (mis. dari riwayat donasi yang belum
  // dibayar), param ini tidak terkirim sehingga do'a tidak muncul lagi.
  const [isDoaVisible, setIsDoaVisible] = useState(Boolean(isNewTransaction));

  const {secondsLeft, paymentStatus, isCheckingStatus, checkStatus} = usePaymentInvoice({
    donationId,
    expiredAt,
  });
  const isExpired = paymentStatus === 'expired';

  useEffect(() => {
    if (paymentStatus === 'sukses') {
      navigation.reset({index: 0, routes: [{name: 'Tracking', params: {donationId}}]});
    }
  }, [paymentStatus, navigation, donationId]);

  async function openCheckout(): Promise<void> {
    if (!checkoutUrl) {
      return;
    }
    try {
      await Linking.openURL(checkoutUrl);
    } catch {
      showToast('Tidak dapat membuka halaman pembayaran.');
    }
  }

  // Tunggu transisi navigasi ke screen ini benar-benar selesai dulu sebelum
  // buka app lain — kalau checkoutUrl langsung dibuka pas transisi
  // navigation.replace() dari screen sebelumnya masih berjalan, tombol
  // back dari app lain bisa nyangkut di state transisi/konfirmasi yang
  // belum kelar, bukan balik ke PaymentInvoiceScreen yang sudah settle.
  const [isScreenSettled, setIsScreenSettled] = useState(false);
  useEffect(() => {
    const unsubscribe = navigation.addListener('transitionEnd', () => {
      setIsScreenSettled(true);
    });
    return unsubscribe;
  }, [navigation]);

  const hasOpenedCheckoutRef = useRef(false);
  useEffect(() => {
    if (
      !checkoutUrl ||
      paymentStatus !== 'menunggu' ||
      hasOpenedCheckoutRef.current ||
      !isScreenSettled
    ) {
      return;
    }
    hasOpenedCheckoutRef.current = true;
    openCheckout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScreenSettled]);

  const canActivateRecurring = Boolean(programId && programTitle && programImageUrl);

  function handleActivateRecurring(): void {
    if (!programId || !programTitle || !programImageUrl) {
      return;
    }
    navigation.navigate('DonasiRutinSetup', {
      programId,
      programTitle,
      programImageUrl,
    });
  }

  function handleBackToHome(): void {
    navigation.reset({index: 0, routes: [{name: 'Home'}]});
  }

  function handleDonateAgain(): void {
    navigation.reset({
      index: 0,
      routes: [{name: 'Home', params: {screen: 'Donations'}}],
    });
  }

  const amountFormatted = formatCurrency(totalAmount);
  const {prefix: amountPrefix, suffix: amountSuffix} =
    splitAmountHighlight(amountFormatted);
  const amountDisplay = accountNumber ? (
    <>
      {amountPrefix}
      <Text style={styles.amountHighlight}>{amountSuffix}</Text>
    </>
  ) : (
    amountFormatted
  );

  const csHelpBlock = (
    <View style={styles.csCard}>
      <Text style={styles.csTitle}>Ada kendala dengan transaksi ini?</Text>
      <TouchableOpacity
        style={styles.csButton}
        onPress={openWhatsappCs}
        accessibilityRole="button"
        accessibilityLabel="Hubungi kami lewat WhatsApp">
        <Icon icon={ChatRoundLine} size={20} color={colors.neutral[700]} />
        <Text style={styles.csButtonText}>Hubungi kami lewat WhatsApp</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <DonationDoaDialog
        visible={isDoaVisible}
        onDismiss={() => setIsDoaVisible(false)}
      />
      <HeaderLight
        title="Instruksi Pembayaran"
        onBack={() => navigation.goBack()}
      />

      {paymentStatus === 'gagal' || paymentStatus === 'expired' ? (
        <ScrollView
          contentContainerStyle={{paddingBottom: insets.bottom + spacing.xl}}
          showsVerticalScrollIndicator={false}>
          <PaymentFailedState
            status={paymentStatus}
            paymentMethod={paymentMethod}
            totalAmount={totalAmount}
            onDonateAgain={handleDonateAgain}
          />
          {csHelpBlock}
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={{paddingBottom: insets.bottom + spacing.xl}}
          showsVerticalScrollIndicator={false}>
          <PaymentBanner
            expiredAt={expiredAt}
            secondsLeft={secondsLeft}
            isExpired={isExpired}
          />

          <View style={styles.section}>
            <View style={styles.methodRow}>
              <Text style={styles.fieldLabel}>Metode Pembayaran</Text>
              <View style={styles.methodValueRow}>
                {paymentMethodType === 'wallet' ? (
                  <View style={styles.methodIconWrapper}>
                    <Icon icon={Wallet} size={16} color={colors.primary[500]} />
                  </View>
                ) : paymentMethodLogoUrl ? (
                  <Image
                    source={{uri: paymentMethodLogoUrl}}
                    style={styles.methodLogo}
                    resizeMode="contain"
                  />
                ) : null}
                <Text style={styles.methodName}>{paymentMethod}</Text>
              </View>
            </View>

            {paymentMethodType === 'bank_transfer' && accountNumber ? (
              <View style={styles.accountNumberBox}>
                <Text style={styles.fieldLabel}>Atas Nama</Text>
                <Text style={styles.accountHolderName}>{accountHolderName}</Text>
                <View style={styles.accountDivider} />
                <CopyableField
                  label="Nomor Rekening"
                  value={accountNumber}
                  displayValue={formatAccountNumber(accountNumber)}
                />
              </View>
            ) : null}

            <CopyableField
              label="Jumlah donasi"
              value={String(totalAmount)}
              displayValue={amountDisplay}
            />

            {accountNumber ? (
              <>
                <View style={styles.warningCard}>
                  <View style={styles.warningRow}>
                    <Icon
                      icon={DangerTriangle}
                      size={16}
                      color={colors.semantic.warning}
                    />
                    <Text style={styles.warningText}>
                      <Text style={styles.warningBold}>PENTING! </Text>
                      Pastikan transfer tepat sampai 3 digit terakhir agar donasi
                      terverifikasi otomatis.
                    </Text>
                  </View>
                </View>
                <Text style={styles.warningNote}>
                  *Jumlah akan didonasikan hingga 3 digit terakhir
                </Text>
              </>
            ) : null}
          </View>

          <View style={styles.actionsWrapper}>
            {checkoutUrl ? (
              <Button label="Bayar Sekarang" onPress={openCheckout} isDisabled={isExpired} />
            ) : null}
            <Button
              label="Cek status pembayaran"
              onPress={checkStatus}
              isLoading={isCheckingStatus}
              isDisabled={isExpired}
              variant='secondary'
            />
          </View>

          {paymentInstructions && paymentInstructions.length > 0 ? (
            <PaymentInstructions steps={paymentInstructions} />
          ) : null}

          {canActivateRecurring ? (
            <View style={styles.upsellSection}>
              <Text style={styles.upsellTitle}>
                Mudahnya donasi tiap hari tanpa harus transfer
              </Text>
              <View style={styles.heartsRow}>
                {Array.from({length: HEART_ROW_COUNT}).map((_, index) => (
                  <View key={index} style={styles.heartBadge}>
                    <Icon icon={Heart} size={14} color={colors.secondary[500]} />
                  </View>
                ))}
              </View>
              <Text style={styles.upsellSubtitle}>Yuk aktifkan Donasi Otomatis</Text>
              <View style={styles.upsellButtonWrapper}>
                <Button label="Aktifkan Sekarang!" onPress={handleActivateRecurring} />
              </View>
            </View>
          ) : null}

          {csHelpBlock}

          <TouchableOpacity
            style={styles.backHomeLink}
            onPress={handleBackToHome}
            accessibilityRole="button"
            accessibilityLabel="Kembali ke Beranda">
            <Text style={styles.backHomeLinkText}>Kembali ke Beranda</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  section: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.neutral[0],
    gap: spacing.lg,
  },
  methodRow: {
    gap: spacing.xs,
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
  },
  methodValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  methodName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
  methodLogo: {
    width: 32,
    height: 24,
  },
  methodIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountNumberBox: {
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[100],
    gap: spacing.sm,
  },
  accountHolderName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
  accountDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.neutral[200],
  },
  amountHighlight: {
    color: colors.primary[600],
  },
  warningCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.semantic.warningLight,
    borderWidth: 1,
    borderColor: colors.semantic.warning,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  warningText: {
    flex: 1,
    fontSize: fontSize.xs,
    lineHeight: fontSize.xs * 1.5,
    color: colors.semantic.warning,
  },
  warningBold: {
    fontWeight: fontWeight.bold,
  },
  warningNote: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
  actionsWrapper: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  upsellSection: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    padding: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[300],
    alignItems: 'center',
    gap: spacing.md,
  },
  upsellTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
    textAlign: 'center',
  },
  heartsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  heartBadge: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.secondary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  upsellSubtitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  upsellButtonWrapper: {
    alignSelf: 'stretch',
  },
  csCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  csTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  csButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 44,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[0],
  },
  csButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[700],
  },
  backHomeLink: {
    alignSelf: 'center',
    minHeight: 44,
    justifyContent: 'center',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  backHomeLinkText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.primary[500],
  },
});
