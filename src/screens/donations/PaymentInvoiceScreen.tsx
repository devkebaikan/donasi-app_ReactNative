import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Clipboard from '@react-native-clipboard/clipboard';
import {
  ClockCircle,
  Copy,
  CheckCircle,
  CloseCircle,
  DangerTriangle,
  ChatRoundLine,
  AltArrowLeft,
  RefreshCircle,
} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {DonationDoaDialog} from '@/components/shared/DonationDoaDialog';
import {QrisPaymentCard} from '@/components/shared/QrisPaymentCard';
import {usePaymentInvoice} from '@/hooks/usePaymentInvoice';
import {formatCurrency} from '@/utils/formatCurrency';
import {formatDateTime} from '@/utils/formatDate';
import {showToast} from '@/utils/toast';
import {openWhatsappCs} from '@/utils/whatsapp';
import {colors} from '@/theme';
import type {PaymentInvoiceScreenProps} from '@/types/navigation';

function formatCountdown(totalSeconds: number): string {
  if (totalSeconds <= 0) return '00:00:00';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function PaymentInvoiceScreen({
  route,
  navigation,
}: PaymentInvoiceScreenProps): React.JSX.Element {
  const params = route.params || {};
  const {
    donationId,
    invoiceId,
    paymentMethod,
    paymentMethodType,
    paymentMethodLogoUrl,
    checkoutUrl,
    accountNumber,
    accountHolderName,
    bankName,
    totalAmount,
    amount,
    expiredAt,
    programId,
    programTitle,
    programImageUrl,
    isNewTransaction,
  } = params;

  const insets = useSafeAreaInsets();
  const [isDoaVisible, setIsDoaVisible] = useState(Boolean(isNewTransaction));

  const effectiveInvoiceId = invoiceId || donationId || '';

  const {
    invoice,
    isLoading,
    secondsLeft,
    paymentStatus,
    isCheckingStatus,
    checkStatus,
    refetch,
  } = usePaymentInvoice({
    invoiceId: effectiveInvoiceId,
    donationId,
    initialExpiredAt: expiredAt,
  });

  // Ambil data invoice dari backend live, dengan fallback ke initial route params
  const payment = invoice?.payment_method ?? {};
  const thirdPartyDetail = invoice?.third_party_detail ?? {};
  const donationNominal =
    invoice?.nominal ?? totalAmount ?? amount ?? 0;
  const rawStatus = (invoice?.status ?? '').toString().toLowerCase();

  const isPaid =
    paymentStatus === 'sukses' ||
    rawStatus === 'paid' ||
    rawStatus === 'settlement' ||
    rawStatus === 'sukses';

  const isCanceled =
    paymentStatus === 'expired' ||
    paymentStatus === 'gagal' ||
    rawStatus === 'canceled' ||
    rawStatus === 'cancelled' ||
    rawStatus === 'expired';

  const paymentUrl = invoice?.payment_url || checkoutUrl;
  const firstItem = invoice?.items?.[0];
  const programLink = firstItem?.program?.link;
  const displayProgramTitle =
    firstItem?.program?.title || programTitle || 'Donasi';

  // Deteksi pembayaran QRIS (mengikuti referensi Astro)
  const isQris =
    payment?.bank === 'Qris' ||
    payment?.type === 'qris' ||
    payment?.code?.includes('QRIS') ||
    (paymentMethod && paymentMethod.toLowerCase().includes('qris')) ||
    Boolean(thirdPartyDetail?.qr_string);

  const isOvo =
    payment?.bank === 'OVO' ||
    payment?.code === 'OVO' ||
    paymentMethod === 'OVO';

  const isVA = Boolean(
    thirdPartyDetail?.account_number && thirdPartyDetail?.bank_code,
  );

  // QR Payload untuk render QR Code
  const qrPayload = isQris ? thirdPartyDetail?.qr_string ?? '' : null;

  // VA / Transfer account number & holder
  const vaAccountNumber = isVA
    ? thirdPartyDetail?.account_number ??
      thirdPartyDetail?.raw?.bill_payment?.receiver_bank_account?.account_number
    : null;
  const vaAccountName = isVA
    ? thirdPartyDetail?.account_holder ?? payment?.account_behalf
    : null;

  const displayAccountNumber =
    vaAccountNumber || payment?.account_number || accountNumber;
  const displayAccountName =
    vaAccountName ||
    payment?.account_behalf ||
    accountHolderName ||
    'Sahabat Beramal Bersama';

  const displayBankName =
    payment?.name ||
    payment?.bank ||
    bankName ||
    paymentMethod ||
    'Metode Pembayaran';
  const displayBankImage =
    payment?.image || payment?.image_url || paymentMethodLogoUrl;

  const deadlineTime = invoice?.last_payment_time || expiredAt;

  // Format nominal dengan pemisahan 3 digit terakhir untuk transfer bank
  const formattedNominal = formatCurrency(donationNominal);
  const lastThree = formattedNominal.slice(-3);
  const firstPart = formattedNominal.slice(0, -3);

  // Auto redirect jika payment gateway external (selain Qris, OVO, VA)
  const hasExternalRedirect =
    !isPaid && !isCanceled && !!paymentUrl && !qrPayload && !isOvo && !isVA;

  function handleCopy(text: string | number, label: string): void {
    if (!text) return;
    Clipboard.setString(String(text));
    showToast(`${label} disalin`);
  }

  function handleBackToHome(): void {
    navigation.reset({index: 0, routes: [{name: 'Home'}]});
  }

  function handleGoToTracking(): void {
    navigation.reset({
      index: 0,
      routes: [
        {name: 'Home'},
        {name: 'Tracking', params: {donationId: effectiveInvoiceId}},
      ],
    });
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

  async function openPaymentUrl(): Promise<void> {
    if (!paymentUrl) return;
    try {
      const supported = await Linking.canOpenURL(paymentUrl);
      if (supported) {
        await Linking.openURL(paymentUrl);
      } else {
        showToast('Tidak dapat membuka halaman pembayaran');
      }
    } catch {
      showToast('Gagal membuka URL pembayaran');
    }
  }

  return (
    <View className="flex-1 bg-slate-50" style={{paddingTop: insets.top}}>
      <DonationDoaDialog
        visible={isDoaVisible}
        onDismiss={() => setIsDoaVisible(false)}
      />

      {/* Top Header */}
      <View className="bg-white border-b border-slate-200 px-4 py-3 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => navigation.canGoBack() ? navigation.goBack() : handleBackToHome()}
          className="w-10 h-10 items-center justify-center -ml-2 rounded-full active:bg-slate-100"
          accessibilityRole="button"
          accessibilityLabel="Kembali">
          <Icon icon={AltArrowLeft} size={24} color={colors.neutral[800]} />
        </TouchableOpacity>
        <Text className="text-base font-bold text-slate-900">
          Invoice Pembayaran
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          disabled={isLoading}
          className="w-10 h-10 items-center justify-center -mr-2 rounded-full active:bg-slate-100"
          accessibilityRole="button"
          accessibilityLabel="Muat Ulang">
          <Icon icon={RefreshCircle} size={22} color={colors.neutral[600]} />
        </TouchableOpacity>
      </View>

      {isLoading && !invoice ? (
        <View className="flex-1 items-center justify-center p-6 gap-3">
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text className="text-sm text-slate-500">
            Memuat informasi transaksi...
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{paddingBottom: insets.bottom + 32}}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              colors={[colors.primary[500]]}
            />
          }
          showsVerticalScrollIndicator={false}>
          {/* Status Banner */}
          {isCanceled ? (
            <View className="bg-rose-500 px-5 py-4 flex-row items-center gap-3 shadow-sm">
              <Icon icon={CloseCircle} size={24} color="#ffffff" />
              <View className="flex-1">
                <Text className="text-sm font-bold text-white">
                  Transaksi Dibatalkan / Kedaluwarsa
                </Text>
                <Text className="text-xs text-rose-100 mt-0.5 leading-tight">
                  Waktu pembayaran telah habis atau transaksi dibatalkan.
                </Text>
              </View>
            </View>
          ) : isPaid ? (
            <View className="bg-emerald-600 px-5 py-4 flex-row items-center gap-3 shadow-sm">
              <Icon icon={CheckCircle} size={24} color="#ffffff" />
              <View className="flex-1">
                <Text className="text-sm font-bold text-white">
                  Pembayaran Berhasil!
                </Text>
                <Text className="text-xs text-emerald-100 mt-0.5 leading-tight">
                  Alhamdulillah, donasi Anda telah kami terima.
                </Text>
              </View>
            </View>
          ) : (
            <View className="bg-primary-500 px-5 py-4 shadow-sm">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-xs text-primary-100 font-medium">
                    Batas Waktu Pembayaran
                  </Text>
                  <Text className="text-sm font-bold text-white mt-0.5">
                    {deadlineTime ? formatDateTime(deadlineTime) : '24 Jam'}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1.5 bg-primary-600/60 px-3 py-1.5 rounded-full border border-primary-400/40">
                  <Icon icon={ClockCircle} size={16} color="#ffffff" />
                  <Text className="text-xs font-mono font-bold text-white">
                    {formatCountdown(secondsLeft)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          <View className="p-4 gap-4">
            {/* KONDISI 1: SUKSES */}
            {isPaid ? (
              <View className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm items-center text-center gap-4">
                <View className="w-16 h-16 rounded-full bg-emerald-50 items-center justify-center">
                  <Icon icon={CheckCircle} size={36} color="#059669" />
                </View>
                <View className="items-center">
                  <Text className="text-lg font-bold text-slate-900">
                    Donasi Berhasil Diterima
                  </Text>
                  <Text className="text-xs text-slate-500 text-center mt-1 leading-relaxed">
                    Terima kasih atas kebaikan Anda. Semoga Allah membalas dengan kebaikan yang berlipat ganda.
                  </Text>
                </View>

                {/* Detail Box */}
                <View className="w-full bg-slate-50 rounded-xl p-4 border border-slate-100 gap-2.5">
                  <View className="flex-row justify-between items-center text-xs">
                    <Text className="text-xs text-slate-500">Nomor Invoice</Text>
                    <Text className="text-xs font-mono font-semibold text-slate-800">
                      {effectiveInvoiceId}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center text-xs">
                    <Text className="text-xs text-slate-500">Program</Text>
                    <Text
                      className="text-xs font-semibold text-slate-800 max-w-[200px]"
                      numberOfLines={1}>
                      {displayProgramTitle}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center text-xs">
                    <Text className="text-xs text-slate-500">Jumlah Donasi</Text>
                    <Text className="text-sm font-bold text-emerald-600">
                      {formatCurrency(donationNominal)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center text-xs">
                    <Text className="text-xs text-slate-500">Status</Text>
                    <View className="px-2 py-0.5 rounded bg-emerald-100">
                      <Text className="text-[11px] font-bold text-emerald-700">
                        Lunas
                      </Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleGoToTracking}
                  className="w-full py-3.5 rounded-xl bg-primary-500 active:bg-primary-600 items-center justify-center shadow-sm">
                  <Text className="text-sm font-bold text-white">
                    Lacak Donasi Anda
                  </Text>
                </TouchableOpacity>
              </View>
            ) : isCanceled ? (
              /* KONDISI 2: BATAL / EXPIRED */
              <View className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm items-center text-center gap-4">
                <View className="w-16 h-16 rounded-full bg-rose-50 items-center justify-center">
                  <Icon icon={CloseCircle} size={36} color="#e11d48" />
                </View>
                <View className="items-center">
                  <Text className="text-lg font-bold text-slate-900">
                    Transaksi Gagal / Kedaluwarsa
                  </Text>
                  <Text className="text-xs text-slate-500 text-center mt-1 leading-relaxed">
                    Pembayaran tidak dapat dilanjutkan karena telah melewati batas waktu pembayaran. Silakan buat transaksi baru.
                  </Text>
                </View>

                {/* Detail Box */}
                <View className="w-full bg-slate-50 rounded-xl p-4 border border-slate-100 gap-2.5">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xs text-slate-500">Nomor Invoice</Text>
                    <Text className="text-xs font-mono font-semibold text-slate-800">
                      {effectiveInvoiceId}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xs text-slate-500">Metode</Text>
                    <Text className="text-xs font-semibold text-slate-800">
                      {displayBankName}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xs text-slate-500">Jumlah Donasi</Text>
                    <Text className="text-xs font-bold text-slate-800">
                      {formatCurrency(donationNominal)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xs text-slate-500">Status</Text>
                    <Text className="text-xs font-bold text-rose-600">
                      Dibatalkan
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleDonateAgain}
                  className="w-full py-3.5 rounded-xl bg-primary-500 active:bg-primary-600 items-center justify-center shadow-sm">
                  <Text className="text-sm font-bold text-white">
                    Ulangi Donasi
                  </Text>
                </TouchableOpacity>
              </View>
            ) : isQris ? (
              /* KONDISI 3: QRIS PAYMENT (DENGAN QR CODE SVG) */
              <QrisPaymentCard
                qrPayload={qrPayload || effectiveInvoiceId}
                donationAmount={donationNominal}
                accountBehalf={displayAccountName}
                imgUrl={displayBankImage}
              />
            ) : (
              /* KONDISI 4: BANK TRANSFER / VA / EWALLET */
              <View className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Header Bank */}
                <View className="bg-slate-50 p-4 border-b border-slate-100 flex-row items-center justify-between">
                  <View>
                    <Text className="text-xs text-slate-500">Transfer via</Text>
                    <Text className="text-base font-bold text-slate-900 mt-0.5">
                      {displayBankName}
                    </Text>
                  </View>
                  {displayBankImage ? (
                    <Image
                      source={{uri: displayBankImage}}
                      className="w-16 h-8"
                      resizeMode="contain"
                    />
                  ) : null}
                </View>

                {/* Account Number Box (jika ada nomor rekening atau VA) */}
                {displayAccountNumber && Number(displayAccountNumber) !== 0 ? (
                  <View className="p-4 border-b border-slate-100">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 pr-2">
                        <Text className="text-xs text-slate-500">
                          {isVA ? 'Nomor Virtual Account' : 'Nomor Rekening'}
                        </Text>
                        <Text className="text-xs font-semibold text-slate-700 mt-0.5">
                          {displayAccountName}
                        </Text>
                        <Text className="text-lg font-mono font-bold text-slate-900 mt-1">
                          {displayAccountNumber}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleCopy(displayAccountNumber, 'Nomor Rekening')}
                        className="py-1.5 px-3.5 rounded-full bg-primary-50 active:bg-primary-100 border border-primary-200 flex-row items-center gap-1.5"
                        accessibilityRole="button"
                        accessibilityLabel="Salin Nomor Rekening">
                        <Icon icon={Copy} size={14} color={colors.primary[600]} />
                        <Text className="text-xs font-bold text-primary-600">
                          Salin
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : null}

                {/* Nominal Section */}
                {!isOvo ? (
                  <View className="p-4 border-b border-slate-100">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 pr-2">
                        <Text className="text-xs text-slate-500">
                          Jumlah Donasi
                        </Text>
                        <Text className="text-xl font-bold text-slate-900 mt-0.5">
                          {firstPart}
                          <Text className="text-primary-600 font-extrabold">
                            {lastThree}
                          </Text>
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleCopy(donationNominal, 'Nominal Donasi')}
                        className="py-1.5 px-3.5 rounded-full bg-primary-50 active:bg-primary-100 border border-primary-200 flex-row items-center gap-1.5"
                        accessibilityRole="button"
                        accessibilityLabel="Salin Nominal">
                        <Icon icon={Copy} size={14} color={colors.primary[600]} />
                        <Text className="text-xs font-bold text-primary-600">
                          Salin
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : null}

                {/* Notice Penting */}
                <View className="p-4 bg-amber-50/70 border-t border-amber-100 flex-row items-start gap-2.5">
                  <Icon
                    icon={DangerTriangle}
                    size={18}
                    color="#d97706"
                  />
                  <Text className="flex-1 text-xs text-amber-900 leading-relaxed">
                    {isOvo ? (
                      <Text>
                        <Text className="font-bold">PENTING!</Text> Silakan buka aplikasi{' '}
                        <Text className="font-bold">OVO</Text> Anda dan selesaikan pembayaran melalui notifikasi yang muncul.
                      </Text>
                    ) : (
                      <Text>
                        <Text className="font-bold">PENTING!</Text> Mohon transfer tepat sampai 3 angka terakhir agar donasi terverifikasi secara otomatis oleh sistem.
                      </Text>
                    )}
                  </Text>
                </View>
              </View>
            )}

            {/* External Payment Gateway Redirect Button (jika ada checkout URL) */}
            {hasExternalRedirect ? (
              <TouchableOpacity
                onPress={openPaymentUrl}
                className="w-full py-3.5 rounded-xl bg-primary-500 active:bg-primary-600 items-center justify-center shadow-sm">
                <Text className="text-sm font-bold text-white">
                  Buka Halaman Pembayaran
                </Text>
              </TouchableOpacity>
            ) : null}

            {/* Tombol Cek Status Pembayaran (Realtime Verification) */}
            {!isPaid && !isCanceled ? (
              <TouchableOpacity
                onPress={checkStatus}
                disabled={isCheckingStatus}
                className="w-full py-3.5 rounded-xl bg-white border border-primary-500 active:bg-primary-50 flex-row items-center justify-center gap-2 shadow-xs"
                accessibilityRole="button"
                accessibilityLabel="Cek Status Pembayaran">
                {isCheckingStatus ? (
                  <ActivityIndicator size="small" color={colors.primary[500]} />
                ) : (
                  <Icon
                    icon={RefreshCircle}
                    size={18}
                    color={colors.primary[500]}
                  />
                )}
                <Text className="text-sm font-bold text-primary-600">
                  {isCheckingStatus
                    ? 'Memeriksa status...'
                    : 'Cek Status Pembayaran'}
                </Text>
              </TouchableOpacity>
            ) : null}

            {/* Link Lacak Donasimu (Jika belum lunas tapi ingin melacak) */}
            {!isPaid && !isCanceled ? (
              <TouchableOpacity
                onPress={handleGoToTracking}
                className="w-full py-3 rounded-xl bg-slate-100 active:bg-slate-200 items-center justify-center">
                <Text className="text-xs font-semibold text-slate-700">
                  Lihat Riwayat Donasi
                </Text>
              </TouchableOpacity>
            ) : null}

            {/* Help / WhatsApp Section */}
            <View className="items-center pt-2">
              <TouchableOpacity
                onPress={openWhatsappCs}
                className="flex-row items-center gap-1.5 py-2 px-3 rounded-full active:bg-slate-100"
                accessibilityRole="button"
                accessibilityLabel="Chat Admin WhatsApp">
                <Icon icon={ChatRoundLine} size={16} color={colors.neutral[500]} />
                <Text className="text-xs text-slate-500">
                  Butuh bantuan seputar donasi?{' '}
                  <Text className="font-bold text-primary-600 underline">
                    Chat Admin
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>

            {/* Back to Home Button */}
            <TouchableOpacity
              onPress={handleBackToHome}
              className="self-center py-2 px-4 active:opacity-70 mt-1"
              accessibilityRole="button"
              accessibilityLabel="Kembali ke Beranda">
              <Text className="text-sm font-semibold text-slate-500">
                Kembali ke Beranda
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
