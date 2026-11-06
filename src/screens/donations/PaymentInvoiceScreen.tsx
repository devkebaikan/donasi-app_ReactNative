import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Linking,
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
import {colors} from '@/theme';
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

  function handleBackToHome(): void {
    navigation.reset({index: 0, routes: [{name: 'Home'}]});
  }

  function handleDonateAgain(): void {
    if (programId && programTitle && programImageUrl) {
      navigation.replace('AlurDonasi', {
        programId,
        programTitle,
        programImageUrl,
      });
    } else {
      handleBackToHome();
    }
  }

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

  async function openCheckout(): Promise<void> {
    if (!checkoutUrl) {
      return;
    }
    const supported = await Linking.canOpenURL(checkoutUrl);
    if (!supported) {
      showToast('Tidak dapat membuka halaman pembayaran');
      return;
    }
    await Linking.openURL(checkoutUrl);
  }

  const canActivateRecurring = Boolean(programId && programTitle && programImageUrl);
  const amountFormatted = formatCurrency(totalAmount);
  const {prefix: amountPrefix, suffix: amountSuffix} = splitAmountHighlight(amountFormatted);

  const amountDisplay = (
    <>
      <Text>{amountPrefix}</Text>
      <Text className="text-secondary-500 font-bold">{amountSuffix}</Text>
    </>
  );

  const csHelpBlock = (
    <View className="mx-4 mt-6 gap-2">
      <Text className="text-base font-semibold text-neutral-900">Ada kendala dengan transaksi ini?</Text>
      <TouchableOpacity
        className="flex-row items-center gap-3 min-h-[44px] p-3 rounded-lg border border-neutral-200 bg-white"
        onPress={openWhatsappCs}
        accessibilityRole="button"
        accessibilityLabel="Hubungi kami lewat WhatsApp">
        <Icon icon={ChatRoundLine} size={20} color={colors.neutral[700]} />
        <Text className="text-sm font-semibold text-neutral-700">Hubungi kami lewat WhatsApp</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-neutral-50" style={{paddingTop: insets.top}}>
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
          contentContainerStyle={{paddingBottom: insets.bottom + 24}}
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
          contentContainerStyle={{paddingBottom: insets.bottom + 24}}
          showsVerticalScrollIndicator={false}>
          <PaymentBanner
            expiredAt={expiredAt}
            secondsLeft={secondsLeft}
            isExpired={isExpired}
          />

          <View className="mx-4 mt-4 p-4 rounded-2xl bg-white gap-4 border border-neutral-100 shadow-sm">
            <View className="gap-1">
              <Text className="text-sm text-neutral-500">Metode Pembayaran</Text>
              <View className="flex-row items-center gap-2">
                {paymentMethodType === 'wallet' ? (
                  <View className="w-7 h-7 rounded-sm bg-primary-50 items-center justify-center">
                    <Icon icon={Wallet} size={16} color={colors.primary[500]} />
                  </View>
                ) : paymentMethodLogoUrl ? (
                  <Image
                    source={{uri: paymentMethodLogoUrl}}
                    className="w-8 h-6"
                    resizeMode="contain"
                  />
                ) : null}
                <Text className="text-lg font-bold text-neutral-900">{paymentMethod}</Text>
              </View>
            </View>

            {paymentMethodType === 'bank_transfer' && accountNumber ? (
              <View className="p-3 rounded-lg bg-neutral-100 gap-2">
                <Text className="text-sm text-neutral-500">Atas Nama</Text>
                <Text className="text-base font-semibold text-neutral-900">{accountHolderName}</Text>
                <View className="h-px bg-neutral-200 my-1" />
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
                <View className="p-3 rounded-lg bg-semantic-warningLight">
                  <View className="flex-row items-start gap-2">
                    <Icon
                      icon={DangerTriangle}
                      size={16}
                      color={colors.semantic.warning}
                    />
                    <Text className="flex-1 text-xs text-neutral-700 leading-tight">
                      <Text className="font-bold text-neutral-900">PENTING! </Text>
                      Pastikan transfer tepat sampai 3 digit terakhir agar donasi
                      terverifikasi otomatis.
                    </Text>
                  </View>
                </View>
                <Text className="text-xs text-neutral-400 -mt-2">
                  *Jumlah akan didonasikan hingga 3 digit terakhir
                </Text>
              </>
            ) : null}
          </View>

          <View className="mx-4 mt-4 gap-2">
            {checkoutUrl ? (
              <Button label="Bayar Sekarang" onPress={openCheckout} isDisabled={isExpired} />
            ) : null}
            <Button
              label="Cek status pembayaran"
              onPress={checkStatus}
              isLoading={isCheckingStatus}
              isDisabled={isExpired}
              variant="secondary"
            />
          </View>

          {paymentInstructions && paymentInstructions.length > 0 ? (
            <PaymentInstructions steps={paymentInstructions} />
          ) : null}

          {canActivateRecurring ? (
            <View className="mx-4 mt-6 p-6 rounded-2xl bg-primary-50 border border-primary-300 items-center gap-3">
              <Text className="text-base font-bold text-neutral-900 text-center">
                Mudahnya donasi tiap hari tanpa harus transfer
              </Text>
              <View className="flex-row gap-1">
                {Array.from({length: HEART_ROW_COUNT}).map((_, index) => (
                  <View key={index} className="w-7 h-7 rounded-full bg-secondary-50 items-center justify-center">
                    <Icon icon={Heart} size={14} color={colors.secondary[500]} />
                  </View>
                ))}
              </View>
              <Text className="text-base font-semibold text-neutral-900">Yuk aktifkan Donasi Otomatis</Text>
              <View className="self-stretch">
                <Button label="Aktifkan Sekarang!" onPress={handleActivateRecurring} />
              </View>
            </View>
          ) : null}

          {csHelpBlock}

          <TouchableOpacity
            className="self-center min-h-[44px] justify-center mt-4 px-4"
            onPress={handleBackToHome}
            accessibilityRole="button"
            accessibilityLabel="Kembali ke Beranda">
            <Text className="text-base font-semibold text-primary-500">Kembali ke Beranda</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}
