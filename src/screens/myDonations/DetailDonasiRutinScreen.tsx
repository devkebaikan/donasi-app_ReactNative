import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  RefreshControl,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  AltArrowLeft,
  CheckCircle,
  ClockCircle,
  CloseCircle,
  DangerCircle,
  StopCircle,
} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {
  getRutinDetail,
  stopMyRutin,
  type RutinDetailData,
} from '@/services/recurringDonationService';
import {formatCurrency} from '@/utils/formatCurrency';
import {formatDate} from '@/utils/formatDate';
import {showToast} from '@/utils/toast';
import {colors} from '@/theme';
import type {DetailDonasiRutinScreenProps} from '@/types/navigation';

export default function DetailDonasiRutinScreen({
  route,
  navigation,
}: DetailDonasiRutinScreenProps): React.JSX.Element {
  const {recurringId} = route.params;
  const insets = useSafeAreaInsets();

  const [detail, setDetail] = useState<RutinDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [isStopModalVisible, setIsStopModalVisible] = useState(false);

  const fetchDetail = useCallback(async () => {
    try {
      const res = await getRutinDetail(recurringId);
      if (res.success && res.data) {
        setDetail(res.data);
      }
    } catch {
      showToast('Gagal memuat detail donasi rutin');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [recurringId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  function handleRefresh(): void {
    setIsRefreshing(true);
    fetchDetail();
  }

  async function handleConfirmStop(): Promise<void> {
    setIsStopping(true);
    try {
      const res = await stopMyRutin(recurringId);
      if (res.success) {
        showToast('Donasi rutin berhasil dihentikan');
        setIsStopModalVisible(false);
        fetchDetail();
      } else {
        showToast(res.message || 'Gagal menghentikan donasi rutin');
      }
    } catch {
      showToast('Terjadi kesalahan saat menghentikan donasi rutin');
    } finally {
      setIsStopping(false);
    }
  }

  const status = detail?.status ?? '';
  const invoicing = detail?.invoicing ?? null;
  const isPending = Boolean(invoicing && invoicing.status === 'Pending');
  const isActive = status === 'active';

  // Banner status
  let bannerBg = 'bg-primary-500';
  let bannerTitle = 'Pembayaran Donasi Rutin Sukses';
  let bannerStatusText = 'Berhasil Dilakukan';
  let bannerTextColor = 'text-primary-600';
  let StatusIconComponent = CheckCircle;

  if (isActive) {
    bannerBg = 'bg-primary-500';
    bannerTitle = 'Donasi Rutin Aktif';
    bannerStatusText = 'Berhasil Terjadwal';
    bannerTextColor = 'text-primary-600';
    StatusIconComponent = CheckCircle;
  } else if (isPending) {
    bannerBg = 'bg-amber-500';
    bannerTitle = 'Menunggu Pembayaran';
    bannerStatusText = 'Sedang Diproses';
    bannerTextColor = 'text-amber-500';
    StatusIconComponent = ClockCircle;
  } else if (invoicing === null && !isActive) {
    bannerBg = 'bg-rose-500';
    bannerTitle = 'Donasi Rutin Dihentikan';
    bannerStatusText = 'Sudah Dihentikan';
    bannerTextColor = 'text-rose-500';
    StatusIconComponent = StopCircle;
  } else {
    bannerBg = 'bg-rose-500';
    bannerTitle = 'Pembayaran Donasi Rutin Gagal';
    bannerStatusText = 'Gagal Dilakukan';
    bannerTextColor = 'text-rose-500';
    StatusIconComponent = CloseCircle;
  }

  const frequencyLabel =
    detail?.range_type === 'monthly'
      ? 'Bulanan'
      : detail?.range_type === 'weekly'
      ? 'Mingguan'
      : 'Harian';

  const timeFormatted = detail?.time ? detail.time.slice(0, 5) : '08:00';

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header Bar */}
      <View
        style={{paddingTop: insets.top}}
        className="bg-white border-b border-slate-100 flex-row items-center px-4 py-3">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center -ml-2 rounded-full active:bg-slate-100"
          accessibilityRole="button"
          accessibilityLabel="Kembali">
          <Icon icon={AltArrowLeft} size={22} color={colors.neutral[800]} />
        </TouchableOpacity>
        <Text className="text-base font-bold text-slate-900 ml-2">
          Detail Donasi Rutin
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      ) : !detail ? (
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-sm font-semibold text-slate-700">
            Data donasi rutin tidak ditemukan
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: 40}}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary[500]]}
            />
          }>
          <View className="p-4 gap-4">
            {/* Status Banner Card */}
            <View className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs">
              <View className={`px-4 py-3 ${bannerBg}`}>
                <Text className="text-white text-xs font-bold text-center">
                  {bannerTitle}
                </Text>
              </View>

              <View className="p-6 items-center text-center">
                <View className="w-20 h-20 rounded-full bg-slate-50 items-center justify-center mb-4 border border-slate-100">
                  <Icon
                    icon={StatusIconComponent}
                    size={42}
                    color={
                      isActive
                        ? colors.primary[500]
                        : isPending
                        ? '#f59e0b'
                        : '#f43f5e'
                    }
                  />
                </View>

                <Text className="text-xs text-slate-600 leading-relaxed text-center">
                  Penjadwalan donasi rutin untuk program{' '}
                  <Text className="font-bold text-slate-900">
                    {detail.program?.title || 'Donasi Rutin'}
                  </Text>{' '}
                  <Text className={`font-bold ${bannerTextColor}`}>
                    {bannerStatusText}
                  </Text>
                </Text>
              </View>
            </View>

            {/* Detail Info Card */}
            <View className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs">
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                Informasi Jadwal
              </Text>

              <View className="gap-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs text-slate-500 font-medium">
                    Dijadwalkan mulai
                  </Text>
                  <Text className="text-xs font-semibold text-slate-800">
                    {detail.created_at ? formatDate(detail.created_at) : '-'}
                  </Text>
                </View>

                <View className="flex-row items-center justify-between">
                  <Text className="text-xs text-slate-500 font-medium">Frekuensi</Text>
                  <Text className="text-xs font-semibold text-slate-800">
                    {frequencyLabel}
                  </Text>
                </View>

                <View className="flex-row items-center justify-between">
                  <Text className="text-xs text-slate-500 font-medium">Tiap Pukul</Text>
                  <Text className="text-xs font-semibold text-slate-800">
                    {timeFormatted} WIB
                  </Text>
                </View>

                <View className="flex-row items-center justify-between">
                  <Text className="text-xs text-slate-500 font-medium">
                    Metode Pembayaran
                  </Text>
                  <Text className="text-xs font-semibold text-slate-800">
                    {detail.commitment == null ? 'Saku Kebaikan' : 'Bayar Langsung'}
                  </Text>
                </View>

                <View className="flex-row items-center justify-between">
                  <Text className="text-xs text-slate-500 font-medium">
                    Nominal per Periode
                  </Text>
                  <Text className="text-xs font-bold text-primary-600">
                    {formatCurrency(detail.nominal)}
                  </Text>
                </View>

                <View className="flex-row items-center justify-between">
                  <Text className="text-xs text-slate-500 font-medium">
                    Sudah Berjalan
                  </Text>
                  <Text className="text-xs font-semibold text-slate-800">
                    {detail.summary?.frekuensi_donasi ?? 0} Hari
                  </Text>
                </View>

                <View className="flex-row items-center justify-between">
                  <Text className="text-xs text-slate-500 font-medium">Status</Text>
                  <View
                    className={`px-2.5 py-0.5 rounded-full ${
                      isActive ? 'bg-primary-50' : 'bg-rose-50'
                    }`}>
                    <Text
                      className={`text-[10px] font-bold ${
                        isActive ? 'text-primary-600' : 'text-rose-600'
                      }`}>
                      {isActive ? 'Aktif' : 'Nonaktif'}
                    </Text>
                  </View>
                </View>

                <View className="border-t border-dashed border-slate-200 pt-3 mt-1 flex-row items-center justify-between">
                  <Text className="text-xs font-bold text-slate-700">
                    {isPending ? 'Total Perlu Dibayar:' : 'Total Didonasikan:'}
                  </Text>
                  <Text className="text-sm font-bold text-slate-900">
                    {isPending
                      ? formatCurrency(invoicing?.total ?? 0)
                      : formatCurrency(detail.summary?.total_donasi ?? 0)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            {isPending && invoicing?.invoice && (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('PaymentInvoice', {
                    donationId: invoicing.invoice,
                    invoiceId: invoicing.invoice,
                    programTitle: detail.program?.title || 'Donasi Rutin',
                    amount: invoicing.total,
                    adminFee: 0,
                    totalAmount: invoicing.total,
                    expiredAt: '',
                    paymentMethod: 'TRANSFER',
                  })
                }
                activeOpacity={0.85}
                className="w-full bg-orange-500 active:bg-orange-600 py-3.5 rounded-2xl items-center justify-center shadow-md">
                <Text className="text-xs font-bold text-white">Bayar Sekarang</Text>
              </TouchableOpacity>
            )}

            {!isPending && !isActive && (
              <TouchableOpacity
                onPress={() => navigation.navigate('DonasiRutinJenis')}
                activeOpacity={0.85}
                className="w-full bg-primary-500 active:bg-primary-600 py-3.5 rounded-2xl items-center justify-center shadow-md">
                <Text className="text-xs font-bold text-white">
                  Pilih Donasi Rutin Lainnya
                </Text>
              </TouchableOpacity>
            )}

            {!isPending && isActive && (
              <TouchableOpacity
                onPress={() => setIsStopModalVisible(true)}
                activeOpacity={0.85}
                className="w-full bg-rose-500 active:bg-rose-600 py-3.5 rounded-2xl items-center justify-center shadow-md">
                <Text className="text-xs font-bold text-white">
                  Hentikan Donasi Rutin
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      )}

      {/* Stop Confirmation Modal */}
      <Modal
        visible={isStopModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsStopModalVisible(false)}>
        <View className="flex-1 bg-black/40 items-center justify-center p-6">
          <View className="bg-white rounded-3xl p-6 w-full max-w-sm items-center shadow-xl">
            <View className="w-14 h-14 bg-rose-50 rounded-full items-center justify-center mb-3">
              <Icon icon={DangerCircle} size={30} color="#e11d48" />
            </View>

            <Text className="text-base font-bold text-slate-900 mb-1">
              Hentikan Donasi Rutin?
            </Text>
            <Text className="text-xs text-slate-500 text-center leading-relaxed mb-6">
              Apakah kamu yakin ingin menghentikan donasi rutin ini? Anda dapat mengaktifkannya kembali sewaktu-waktu.
            </Text>

            <View className="flex-row gap-3 w-full">
              <TouchableOpacity
                onPress={() => setIsStopModalVisible(false)}
                disabled={isStopping}
                className="flex-1 border border-slate-200 py-3 rounded-xl items-center justify-center">
                <Text className="text-xs font-semibold text-slate-600">Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirmStop}
                disabled={isStopping}
                className="flex-1 bg-rose-500 active:bg-rose-600 py-3 rounded-xl items-center justify-center shadow-sm">
                {isStopping ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-xs font-bold text-white">Ya, Hentikan</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
