import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  AltArrowLeft,
  FileText,
  User,
  Heart,
} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {useAuthStore} from '@/stores/authStore';
import {
  getMyDonationsList,
  type MyDonationHistoryItem,
} from '@/services/donationService';
import {formatCurrency} from '@/utils/formatCurrency';
import {formatDate} from '@/utils/formatDate';
import {colors} from '@/theme';
import type {RiwayatDonasiScreenProps} from '@/types/navigation';

const STATUS_TABS = [
  {value: '', label: 'Semua'},
  {value: 'menunggu-pembayaran', label: 'Menunggu Pembayaran'},
  {value: 'menunggu-salur', label: 'Menunggu Salur'},
  {value: 'proses', label: 'Proses Salur'},
  {value: 'selesai', label: 'Selesai Salur'},
];

const STATUS_CONFIG: Record<string, {bg: string; text: string; label: string}> = {
  'menunggu-pembayaran': {bg: 'bg-amber-50', text: 'text-amber-600', label: 'Menunggu Pembayaran'},
  'menunggu-salur': {bg: 'bg-sky-50', text: 'text-sky-600', label: 'Menunggu Salur'},
  'proses': {bg: 'bg-purple-50', text: 'text-purple-600', label: 'Proses Salur'},
  'proses-salur': {bg: 'bg-purple-50', text: 'text-purple-600', label: 'Proses Salur'},
  'selesai': {bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'Selesai'},
  'success': {bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'Selesai'},
  'dibatalkan': {bg: 'bg-rose-50', text: 'text-rose-600', label: 'Dibatalkan'},
  'canceled': {bg: 'bg-rose-50', text: 'text-rose-600', label: 'Dibatalkan'},
  'cancelled': {bg: 'bg-rose-50', text: 'text-rose-600', label: 'Dibatalkan'},
  'proses-refund': {bg: 'bg-orange-50', text: 'text-orange-600', label: 'Proses Refund'},
  'refund': {bg: 'bg-orange-50', text: 'text-orange-600', label: 'Proses Refund'},
  'pending': {bg: 'bg-amber-50', text: 'text-amber-600', label: 'Menunggu Pembayaran'},
  'paid': {bg: 'bg-sky-50', text: 'text-sky-600', label: 'Menunggu Salur'},
};

function getStatusBadge(item: MyDonationHistoryItem) {
  const rawPosisi = (item.posisi || '').toString().toLowerCase().trim();
  const rawPayment = (item.payment_status || item.status || '').toString().toLowerCase().trim();

  if (rawPosisi && STATUS_CONFIG[rawPosisi]) {
    return STATUS_CONFIG[rawPosisi];
  }
  if (rawPayment && STATUS_CONFIG[rawPayment]) {
    return STATUS_CONFIG[rawPayment];
  }
  return {
    bg: 'bg-slate-100',
    text: 'text-slate-500',
    label: item.posisi || item.payment_status || item.status || '-',
  };
}

export default function RiwayatDonasiScreen({
  route,
  navigation,
}: RiwayatDonasiScreenProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const initialPosisi = route.params?.posisi ?? '';
  const [activeFilter, setActiveFilter] = useState(initialPosisi);

  const isAuthenticated = useAuthStore(state => Boolean(state.accessToken));

  const [items, setItems] = useState<MyDonationHistoryItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isError, setIsError] = useState(false);

  const fetchItems = useCallback(
    async (targetPage = 1, filter = activeFilter, isRefresh = false) => {
      if (!isAuthenticated) {
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }
      if (targetPage === 1 && !isRefresh) {
        setIsLoading(true);
      }
      setIsError(false);

      try {
        const res = await getMyDonationsList({
          page: targetPage,
          limit: 10,
          posisi: filter || undefined,
        });

        if (res.success && res.data) {
          if (targetPage === 1) {
            setItems(res.data.items);
          } else {
            setItems(prev => [...prev, ...res.data.items]);
          }
          setHasMore(res.data.hasMore);
          setPage(targetPage);
        } else {
          if (targetPage === 1) setIsError(true);
        }
      } catch {
        if (targetPage === 1) setIsError(true);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [isAuthenticated, activeFilter],
  );

  useEffect(() => {
    fetchItems(1, activeFilter);
  }, [fetchItems, activeFilter]);

  function handleFilterChange(filterValue: string): void {
    setActiveFilter(filterValue);
  }

  function handleRefresh(): void {
    setIsRefreshing(true);
    fetchItems(1, activeFilter, true);
  }

  function handleLoadMore(): void {
    if (hasMore && !isLoading && !isLoadingMore && !isRefreshing) {
      setIsLoadingMore(true);
      fetchItems(page + 1, activeFilter);
    }
  }

  function handleItemPress(item: MyDonationHistoryItem): void {
    const rawPosisi = (item.posisi || '').toString().toLowerCase().trim();
    const rawPayment = (item.payment_status || item.status || '').toString().toLowerCase().trim();

    if (
      rawPosisi === 'menunggu-pembayaran' ||
      rawPosisi === 'pending' ||
      rawPayment === 'pending'
    ) {
      navigation.navigate('PaymentInvoice', {
        invoiceId: item.invoice,
        donationId: item.invoice,
        paymentMethod: item.payment_method?.name || 'Metode Pembayaran',
        amount: item.nominal_donasi || item.total || 0,
        adminFee: 0,
        totalAmount: item.nominal_donasi || item.total || 0,
        expiredAt: item.last_payment_time || new Date().toISOString(),
      });
    } else {
      navigation.navigate('Tracking', {
        donationId: item.invoice,
      });
    }
  }

  function renderHistoryItem({item}: {item: MyDonationHistoryItem}): React.JSX.Element {
    const isRutin = (item.source || '').toString().toUpperCase().trim() === 'RUTIN';
    const badge = getStatusBadge(item);
    const dateStr = item.date ? formatDate(item.date) : '-';
    const timeStr =
      typeof item.time === 'string' && item.time.includes('T')
        ? item.time.split('T')[1]?.slice(0, 5) ?? ''
        : typeof item.time === 'string'
        ? item.time.slice(0, 5)
        : '';

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => handleItemPress(item)}
        className="mx-4 mb-3 flex-row bg-white rounded-xl border border-slate-100 overflow-hidden shadow-xs p-3 gap-3">
        {/* Thumbnail Image */}
        <View className="w-28 h-20 rounded-lg overflow-hidden bg-slate-100">
          {item.image_url ? (
            <Image
              source={{uri: item.image_url}}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center bg-primary-50">
              <Icon icon={Heart} size={20} color={colors.primary[400]} />
            </View>
          )}
        </View>

        {/* Content Info */}
        <View className="flex-1 justify-between py-0.5">
          <View>
            <View className="flex-row items-start justify-between gap-1.5 mb-1">
              <Text
                className="text-xs font-bold text-slate-800 leading-snug flex-1"
                numberOfLines={2}>
                {item.judul || item.title || '-'}
              </Text>
              {isRutin ? (
                <View className="px-1.5 py-0.5 rounded-full bg-orange-50 border border-orange-200">
                  <Text className="text-[10px] font-bold text-orange-600">
                    Rutin
                  </Text>
                </View>
              ) : null}
            </View>

            <Text className="text-[11px] text-slate-400">
              {dateStr}
              {timeStr ? ` · ${timeStr}` : ''}
            </Text>
          </View>

          <View className="flex-row items-center justify-between pt-1">
            <Text className="text-xs font-bold text-primary-600">
              {formatCurrency(item.nominal_donasi || item.total || 0)}
            </Text>

            <View className={`px-2 py-0.5 rounded-full ${badge.bg}`}>
              <Text className={`text-[10px] font-semibold ${badge.text}`}>
                {badge.label}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View className="flex-1 bg-slate-50" style={{paddingTop: insets.top}}>
      {/* Top Header */}
      <View className="bg-white border-b border-slate-100 px-4 py-3 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center -ml-2 rounded-full active:bg-slate-100"
          accessibilityRole="button"
          accessibilityLabel="Kembali">
          <Icon icon={AltArrowLeft} size={24} color={colors.neutral[800]} />
        </TouchableOpacity>
        <Text className="text-base font-bold text-slate-900">
          Riwayat Donasi Saya
        </Text>
        <View className="w-10" />
      </View>

      {/* Horizontal Filter Tabs */}
      <View className="bg-white px-4 py-2.5 border-b border-slate-100">
        <FlatList
          data={STATUS_TABS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={tab => tab.value}
          contentContainerStyle={{gap: 8}}
          renderItem={({item: tab}) => {
            const isActive = activeFilter === tab.value;
            return (
              <TouchableOpacity
                onPress={() => handleFilterChange(tab.value)}
                className={`px-4 py-1.5 rounded-full border ${
                  isActive
                    ? 'bg-primary-500 border-primary-500 shadow-2xs'
                    : 'bg-white border-slate-200 active:bg-slate-50'
                }`}>
                <Text
                  className={`text-xs font-semibold ${
                    isActive ? 'text-white' : 'text-slate-600'
                  }`}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Main Content Area */}
      {!isAuthenticated ? (
        /* State: Belum Login */
        <View className="flex-1 items-center justify-center p-6 text-center">
          <View className="w-16 h-16 rounded-full bg-slate-100 items-center justify-center mb-4">
            <Icon icon={User} size={32} color={colors.neutral[400]} />
          </View>
          <Text className="text-base font-bold text-slate-800 text-center">
            Masuk untuk melihat riwayat donasi
          </Text>
          <Text className="text-xs text-slate-500 text-center mt-1 mb-6 leading-relaxed max-w-xs">
            Lacak setiap jejak kebaikan yang telah kamu lakukan bersama Beramal Bersama.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            className="px-6 py-3 rounded-xl bg-primary-500 active:bg-primary-600 shadow-sm">
            <Text className="text-xs font-bold text-white">
              Masuk Sekarang
            </Text>
          </TouchableOpacity>
        </View>
      ) : isLoading ? (
        /* State: Skeleton Loading */
        <View className="p-4 gap-3">
          {[1, 2, 3, 4].map(idx => (
            <View
              key={idx}
              className="bg-white rounded-xl border border-slate-100 p-3 flex-row gap-3">
              <View className="w-28 h-20 rounded-lg bg-slate-200 animate-pulse" />
              <View className="flex-1 justify-between py-1">
                <View className="gap-2">
                  <View className="w-3/4 h-3 rounded bg-slate-200 animate-pulse" />
                  <View className="w-1/2 h-2.5 rounded bg-slate-200 animate-pulse" />
                </View>
                <View className="flex-row justify-between items-center">
                  <View className="w-20 h-3 rounded bg-slate-200 animate-pulse" />
                  <View className="w-16 h-4 rounded-full bg-slate-200 animate-pulse" />
                </View>
              </View>
            </View>
          ))}
        </View>
      ) : isError ? (
        /* State: Error */
        <View className="flex-1 items-center justify-center p-6 gap-3">
          <Text className="text-sm font-semibold text-slate-700">
            Gagal memuat riwayat donasi
          </Text>
          <TouchableOpacity
            onPress={() => fetchItems(1, activeFilter)}
            className="px-4 py-2 border border-primary-500 rounded-xl">
            <Text className="text-xs font-semibold text-primary-600">
              Coba Lagi
            </Text>
          </TouchableOpacity>
        </View>
      ) : items.length === 0 ? (
        /* State: Empty */
        <View className="flex-1 items-center justify-center p-6">
          <View className="w-16 h-16 rounded-full bg-primary-50 items-center justify-center mb-3">
            <Icon icon={FileText} size={30} color={colors.primary[500]} />
          </View>
          <Text className="text-sm font-bold text-slate-800">
            Belum ada riwayat donasi
          </Text>
          <Text className="text-xs text-slate-500 text-center mt-1 mb-5">
            Yuk mulai berdonasi dan tinggalkan jejak kebaikan.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            className="px-5 py-2.5 rounded-xl bg-primary-500 active:bg-primary-600 shadow-sm">
            <Text className="text-xs font-bold text-white">Mulai Donasi</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* State: Items List */
        <FlatList
          data={items}
          keyExtractor={(item, index) => `${item.id || item.invoice || index}`}
          renderItem={renderHistoryItem}
          contentContainerStyle={{paddingVertical: 12}}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary[500]]}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isLoadingMore ? (
              <View className="py-4 items-center justify-center">
                <ActivityIndicator size="small" color={colors.primary[500]} />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}
