import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {Path} from 'react-native-svg';
import type {BottomSheetModal} from '@gorhom/bottom-sheet';
import {
  AltArrowDown,
  AltArrowLeft,
  AltArrowRight,
  Share,
} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {ShareBottomSheet, type ShareOption} from '@/components/shared/ShareBottomSheet';
import {HtmlContent} from '@/components/shared/HtmlContent';
import {useTrackingDetail} from '@/hooks/useTrackingDetail';
import {formatCurrency} from '@/utils/formatCurrency';
import {formatDate} from '@/utils/formatDate';
import {showToast} from '@/utils/toast';
import {colors} from '@/theme';
import type {TrackingScreenProps} from '@/types/navigation';

function InstagramIcon({size = 16, color = '#ffffff'}: {size?: number; color?: string}): React.JSX.Element {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </Svg>
  );
}

const STEPS = ['Pembayaran', 'Menunggu Salur', 'Proses Salur', 'Selesai Salur'];

const IMAGE_STEPS = [
  {
    title: 'Pembayaran',
    imageActive: require('@/assets/images/lacak/menunggu-pembayaran-active.png'),
    image: require('@/assets/images/lacak/menunggu-pembayaran-inactive.png'),
  },
  {
    title: 'Menunggu Salur',
    imageActive: require('@/assets/images/lacak/menunggu-salur-active.png'),
    image: require('@/assets/images/lacak/menunggu-salur-inactive.png'),
  },
  {
    title: 'Proses Salur',
    imageActive: require('@/assets/images/lacak/proses-salur-active.png'),
    image: require('@/assets/images/lacak/proses-salur-inactive.png'),
  },
  {
    title: 'Selesai Salur',
    imageActive: require('@/assets/images/lacak/selesai-salur-active.png'),
    image: require('@/assets/images/lacak/selesai-salur-inactive.png'),
  },
];

function getStepStatuses(activity?: string, hasProject = false) {
  return STEPS.map((_, i) => {
    let isActive = false;
    let isPending = false;
    let isFailed = false;

    switch (activity) {
      case 'Waiting for payment':
        isPending = i === 0;
        break;
      case 'Refunding':
        isActive = i === 0;
        break;
      case 'Pending':
        if (hasProject) {
          isActive = i <= 1;
          isPending = i === 2;
        } else {
          isActive = i === 0;
          isPending = i === 1;
        }
        break;
      case 'Process':
        isActive = i <= 2;
        isPending = i === 3;
        break;
      case 'Done':
        isActive = true;
        break;
      default:
        isFailed = true;
        break;
    }
    return {isActive, isPending, isFailed};
  });
}

function cleanText(htmlString?: string | null): string {
  if (!htmlString || typeof htmlString !== 'string') {
    return '';
  }
  return htmlString
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\r\n/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const SHARE_OPTION_LABEL: Record<ShareOption, string> = {
  facebook: 'Facebook',
  twitter: 'Twitter',
  whatsapp: 'Whatsapp',
  'copy-url': 'Salin URL',
};

export default function TrackingScreen({
  route,
  navigation,
}: TrackingScreenProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const {donationId} = route.params;

  const {invoice, reportsMap, isLoading, isError, refetch} =
    useTrackingDetail(donationId);

  const [isInstruksiOpen, setIsInstruksiOpen] = useState(false);
  const shareSheetRef = useRef<BottomSheetModal>(null);

  const items = invoice?.items ?? [];
  const payment = invoice?.payment_method ?? {};
  const status = invoice?.status ?? '';
  const isPending = status.toLowerCase() === 'pending';

  const statusLabel =
    status.toLowerCase() === 'canceled' || status.toLowerCase() === 'cancelled'
      ? 'Transaksi Dibatalkan'
      : isPending
      ? 'Menunggu Pembayaran'
      : 'Sudah Dibayar';

  function handleBack(): void {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.reset({
      index: 0,
      routes: [{name: 'Home'}],
    });
  }

  function handleShare(): void {
    shareSheetRef.current?.present();
  }

  function handleSelectShareOption(option: ShareOption): void {
    shareSheetRef.current?.dismiss();
    showToast(`Fitur berbagi ke ${SHARE_OPTION_LABEL[option]} akan segera hadir.`);
  }

  async function handleOpenInstagram(): Promise<void> {
    try {
      const url = 'https://www.instagram.com/beramalbersama/';
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        showToast('Tidak dapat membuka Instagram');
      }
    } catch {
      showToast('Gagal membuka tautan');
    }
  }

  function handleDonateOther(): void {
    navigation.navigate('Home');
  }

  return (
    <View className="flex-1 bg-slate-50" style={{paddingTop: insets.top}}>
      {/* Top Header */}
      <View className="bg-white border-b border-slate-100 px-4 py-3 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={handleBack}
          className="w-10 h-10 items-center justify-center -ml-2 rounded-full active:bg-slate-100"
          accessibilityRole="button"
          accessibilityLabel="Kembali">
          <Icon icon={AltArrowLeft} size={24} color={colors.neutral[800]} />
        </TouchableOpacity>
        <Text className="text-base font-bold text-slate-900">
          Status Donasi
        </Text>
        <TouchableOpacity
          onPress={handleShare}
          className="w-10 h-10 items-center justify-center -mr-2 rounded-full active:bg-slate-100"
          accessibilityRole="button"
          accessibilityLabel="Bagikan">
          <Icon icon={Share} size={20} color={colors.neutral[800]} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center p-6 gap-3">
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text className="text-sm text-slate-500">Memuat status donasi...</Text>
        </View>
      ) : isError || !invoice ? (
        <View className="flex-1 items-center justify-center p-6 gap-4">
          <Text className="text-sm font-semibold text-slate-700">
            Status donasi tidak ditemukan
          </Text>
          <TouchableOpacity
            onPress={handleBack}
            className="px-5 py-2.5 bg-primary-500 rounded-xl">
            <Text className="text-xs font-bold text-white">Kembali</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4 pt-4"
          contentContainerStyle={{paddingBottom: insets.bottom + 32}}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              colors={[colors.primary[500]]}
            />
          }
          showsVerticalScrollIndicator={false}>
          <View className="gap-3">
            {/* Render Each Item */}
            {items.map((item, index) => {
              const statuses = getStepStatuses(
                item.activity,
                Boolean(item.project),
              );
              const report = item.project?.id
                ? reportsMap[String(item.project.id)]
                : null;

              return (
                <View key={`${item.id ?? 'item'}-${index}`} className="gap-3">
                  {/* ── Stepper Card ── */}
                  <View className="bg-white rounded-xl shadow-xs p-4 gap-4 border border-slate-100">
                    <View>
                      <Text className="text-sm font-bold text-primary-600 leading-snug">
                        {item.program?.title || 'Program Donasi'}
                      </Text>
                      <Text className="text-base font-bold text-slate-800 mt-1">
                        {formatCurrency(item.nominal_donasi || invoice.nominal)}
                      </Text>
                    </View>

                    {/* Step Icons */}
                    <View className="flex-row justify-between px-2 pt-1">
                      {IMAGE_STEPS.map((step, i) => {
                        const s = statuses[i] || {isActive: false, isPending: false, isFailed: false};
                        const isActive = s.isActive || s.isPending;
                        return (
                          <View key={step.title} className="w-8 h-8 items-center justify-center">
                            <Image
                              source={isActive ? step.imageActive : step.image}
                              className="w-7 h-7"
                              resizeMode="contain"
                            />
                          </View>
                        );
                      })}
                    </View>

                    {/* Step Dots + Connectors */}
                    <View className="flex-row items-center px-1">
                      {statuses.map((s, i) => {
                        const isLast = i === statuses.length - 1;
                        const dotBg = s.isFailed
                          ? 'bg-rose-500'
                          : s.isActive
                          ? 'bg-primary-500'
                          : s.isPending
                          ? 'bg-amber-400'
                          : 'bg-slate-200';

                        const connectorBg = s.isFailed
                          ? 'bg-rose-400'
                          : s.isActive
                          ? 'bg-primary-400'
                          : s.isPending
                          ? 'bg-amber-300'
                          : 'bg-slate-200';

                        return (
                          <View
                            key={i}
                            className={`flex-row items-center ${
                              !isLast ? 'flex-1' : ''
                            }`}>
                            {/* Dot */}
                            <View
                              className={`w-7 h-7 rounded-full items-center justify-center shrink-0 ${dotBg}`}>
                              {(s.isActive || s.isFailed) && (
                                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                                  <Path
                                    d="M5 13l4 4L19 7"
                                    stroke="#ffffff"
                                    strokeWidth={3}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </Svg>
                              )}
                              {s.isPending && (
                                <View className="w-2 h-2 rounded-full bg-white opacity-90" />
                              )}
                            </View>

                            {/* Connector line */}
                            {!isLast && (
                              <View className={`flex-1 h-0.5 mx-0.5 ${connectorBg}`} />
                            )}
                          </View>
                        );
                      })}
                    </View>

                    {/* Step Labels */}
                    <View className="flex-row justify-between">
                      {STEPS.map(label => (
                        <View key={label} className="w-16 items-center">
                          <Text className="text-[10px] text-center text-slate-500 leading-tight">
                            {label}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* ── Program Card ── */}
                  {item.program ? (
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => {
                        if (item.program?.link) {
                          navigation.navigate('DetailProgram', {
                            link: item.program.link,
                          });
                        }
                      }}
                      className="bg-white rounded-xl shadow-xs p-3.5 border border-slate-100">
                      <View className="rounded-lg border border-slate-100 overflow-hidden">
                        {item.program.image ? (
                          <Image
                            source={{uri: item.program.image}}
                            className="w-full h-36"
                            resizeMode="cover"
                          />
                        ) : null}
                        <View className="flex-row justify-between items-start p-3">
                          <View className="flex-1 pr-2">
                            <Text
                              className="text-sm font-bold text-slate-800 leading-snug"
                              numberOfLines={2}>
                              {item.program.title}
                            </Text>
                            <Text className="text-xs text-slate-400 mt-1">
                              {item.program.mitra?.name ?? 'Beramal Bersama'}
                            </Text>
                          </View>
                          <Icon
                            icon={AltArrowRight}
                            size={16}
                            color={colors.primary[500]}
                          />
                        </View>
                      </View>
                    </TouchableOpacity>
                  ) : null}

                  {/* ── Detail Projek (jika ada) ── */}
                  {item.project ? (
                    <View className="bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden">
                      <View className="flex-row items-center justify-between px-4 py-3 border-b border-slate-100">
                        <Text className="text-sm font-semibold text-slate-800">
                          Detail Projek
                        </Text>
                        {item.project.id ? (
                          <TouchableOpacity
                            onPress={() =>
                              navigation.navigate('DetailProjectSalur', {
                                projectSalurId: String(item.project?.id),
                              })
                            }
                            className="flex-row items-center gap-1">
                            <Text className="text-xs font-medium text-primary-600">
                              Lihat Projek
                            </Text>
                            <Icon
                              icon={AltArrowRight}
                              size={13}
                              color={colors.primary[600]}
                            />
                          </TouchableOpacity>
                        ) : null}
                      </View>

                      <View className="px-4 py-3 divide-y divide-slate-50 gap-2">
                        <View className="flex-row justify-between py-1">
                          <Text className="text-xs text-slate-500">Nama Projek</Text>
                          <Text
                            className="text-xs font-medium text-slate-700 text-right max-w-[55%]"
                            numberOfLines={2}>
                            {item.project.judul ?? item.project.name ?? '-'}
                          </Text>
                        </View>
                        <View className="flex-row justify-between py-1">
                          <Text className="text-xs text-slate-500">Tanggal Project</Text>
                          <Text className="text-xs font-medium text-slate-700 text-right">
                            {item.project.waktu_pelaksanaan
                              ? formatDate(item.project.waktu_pelaksanaan)
                              : '-'}
                          </Text>
                        </View>
                        <View className="flex-row justify-between py-1">
                          <Text className="text-xs text-slate-500">Jumlah Penerima</Text>
                          <Text className="text-xs font-medium text-slate-700 text-right">
                            {`${item.project.jumlah_pm ?? '0'} Orang`}
                          </Text>
                        </View>
                      </View>

                      {item.project.activity !== 'selesai' && item.project.image ? (
                        <View className="px-4 pb-3">
                          <Image
                            source={{uri: item.project.image}}
                            className="w-full h-40 rounded-xl"
                            resizeMode="cover"
                          />
                        </View>
                      ) : null}

                      {item.project.activity !== 'selesai' && item.project.description ? (
                        <View className="px-4 pb-4">
                          <HtmlContent html={item.project.description} />
                        </View>
                      ) : null}

                      {item.project.id ? (
                        <View className="px-4 pb-3 pt-1">
                          <TouchableOpacity
                            onPress={() =>
                              navigation.navigate('DetailProjectSalur', {
                                projectSalurId: String(item.project?.id),
                              })
                            }
                            className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg flex-row items-center justify-center gap-1.5 active:bg-slate-100">
                            <Text className="text-xs font-medium text-slate-700">
                              Buka Detail Projek
                            </Text>
                            <Icon
                              icon={AltArrowRight}
                              size={14}
                              color={colors.neutral[700]}
                            />
                          </TouchableOpacity>
                        </View>
                      ) : null}
                    </View>
                  ) : null}

                  {/* ── Update Salur (jika ada report) ── */}
                  {report ? (
                    <View className="bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden">
                      <View className="px-4 py-3 border-b border-slate-100">
                        <Text className="text-sm font-semibold text-slate-800">
                          Update Salur
                        </Text>
                      </View>
                      <View className="p-4 gap-3">
                        <View className="flex-row items-center gap-3">
                          {report.mitra?.[0]?.image_url ? (
                            <Image
                              source={{uri: report.mitra[0].image_url}}
                              className="w-10 h-10 rounded-full border border-slate-200 bg-white"
                              resizeMode="contain"
                            />
                          ) : (
                            <View className="w-10 h-10 rounded-full bg-primary-100 items-center justify-center shadow-xs">
                              <Text className="text-xs font-bold text-primary-700">
                                {(report.mitra?.[0]?.name || 'B').charAt(0).toUpperCase()}
                              </Text>
                            </View>
                          )}
                          <View className="flex-1 min-w-0">
                            <Text
                              className="text-sm font-semibold text-slate-800"
                              numberOfLines={1}>
                              {report.mitra?.[0]?.name ?? 'Beramal Bersama'}
                            </Text>
                            <Text className="text-xs text-slate-400 mt-0.5">
                              {report.date ? formatDate(report.date) : '-'}
                            </Text>
                          </View>
                        </View>

                        {report.wa_image || report.kegiatan?.image || report.image ? (
                          <Image
                            source={{
                              uri:
                                report.wa_image ||
                                report.kegiatan?.image ||
                                report.image,
                            }}
                            className="w-full h-44 rounded-xl"
                            resizeMode="cover"
                          />
                        ) : null}

                        {report.title || report.kegiatan?.title ? (
                          <Text className="text-sm font-semibold text-slate-800">
                            {report.title ?? report.kegiatan?.title}
                          </Text>
                        ) : null}

                        {report.wa_caption || report.kegiatan?.deskripsi || report.content ? (
                          <Text
                            className="text-xs text-slate-600 leading-relaxed"
                            numberOfLines={3}>
                            {cleanText(
                              report.wa_caption ||
                                report.kegiatan?.deskripsi ||
                                report.content,
                            )}
                          </Text>
                        ) : null}

                        {report.id ? (
                          <TouchableOpacity
                            onPress={() =>
                              navigation.navigate('DetailReportSalur', {
                                reportId: report.id,
                                programLink: item.program?.link,
                                programTitle: item.program?.title,
                              })
                            }
                            className="pt-2 flex-row items-center justify-end gap-1">
                            <Text className="text-xs font-semibold text-primary-600">
                              Detail Laporan
                            </Text>
                            <Icon
                              icon={AltArrowRight}
                              size={13}
                              color={colors.primary[600]}
                            />
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    </View>
                  ) : null}
                </View>
              );
            })}

            {/* ── Detail Pembayaran Card ── */}
            <View className="bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden">
              <View className="px-4 py-3 border-b border-slate-100">
                <Text className="text-sm font-semibold text-slate-800">
                  Detail Pembayaran
                </Text>
              </View>
              <View className="px-4 py-3 divide-y divide-slate-50 gap-2">
                <View className="flex-row justify-between py-1">
                  <Text className="text-xs text-slate-500">Metode Pembayaran</Text>
                  <Text className="text-xs font-medium text-slate-700 text-right">
                    {`${payment.name || payment.bank || '-'} ${
                      payment.account_number && payment.account_number !== '0'
                        ? payment.account_number
                        : ''
                    }`.trim()}
                  </Text>
                </View>
                <View className="flex-row justify-between py-1">
                  <Text className="text-xs text-slate-500">Nominal</Text>
                  <Text className="text-xs font-bold text-slate-900">
                    {formatCurrency(invoice.nominal)}
                  </Text>
                </View>
                <View className="flex-row justify-between py-1">
                  <Text className="text-xs text-slate-500">Tanggal Donasi</Text>
                  <Text className="text-xs font-medium text-slate-700">
                    {invoice.date
                      ? formatDate(invoice.date)
                      : invoice.created_at
                      ? formatDate(invoice.created_at)
                      : '-'}
                  </Text>
                </View>
                <View className="flex-row justify-between py-1">
                  <Text className="text-xs text-slate-500">Status Pembayaran</Text>
                  <Text
                    className={`text-xs font-semibold ${
                      isPending || status.toLowerCase() === 'canceled'
                        ? 'text-rose-500'
                        : 'text-primary-600'
                    }`}>
                    {statusLabel}
                  </Text>
                </View>
              </View>
            </View>

            {/* ── Instruksi Pembayaran (Pending only) ── */}
            {isPending ? (
              <View className="bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden">
                <TouchableOpacity
                  onPress={() => setIsInstruksiOpen(prev => !prev)}
                  className="w-full flex-row items-center justify-between px-4 py-3"
                  accessibilityRole="button"
                  accessibilityLabel="Instruksi Pembayaran">
                  <Text className="text-sm font-semibold text-slate-800">
                    Instruksi Pembayaran
                  </Text>
                  <View
                    style={{
                      transform: [{rotate: isInstruksiOpen ? '180deg' : '0deg'}],
                    }}>
                    <Icon
                      icon={AltArrowDown}
                      size={16}
                      color={colors.neutral[500]}
                    />
                  </View>
                </TouchableOpacity>

                {isInstruksiOpen ? (
                  <View className="border-t border-slate-100 px-4 py-4 gap-2 text-xs text-slate-600">
                    <Text className="text-xs text-slate-600 leading-relaxed">
                      Silakan lakukan pembayaran sebesar{' '}
                      <Text className="font-bold text-slate-800">
                        {formatCurrency(invoice.nominal)}
                      </Text>{' '}
                      melalui metode yang kamu pilih.
                    </Text>
                    <Text className="text-xs text-slate-600 leading-relaxed">
                      Setelah pembayaran berhasil, status donasi akan diperbarui secara otomatis.
                    </Text>
                    <Text className="text-xs text-slate-600 leading-relaxed">
                      Jika dalam 1×24 jam status belum berubah, silakan hubungi tim kami.
                    </Text>

                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate('PaymentInvoice', {
                          donationId,
                          invoiceId: donationId,
                          paymentMethod: payment.name || payment.bank || 'Transfer',
                          amount: invoice.nominal,
                          adminFee: 0,
                          totalAmount: invoice.nominal,
                          expiredAt:
                            invoice.last_payment_time ||
                            new Date().toISOString(),
                        })
                      }
                      className="mt-2 py-2.5 px-4 rounded-xl bg-primary-500 items-center justify-center">
                      <Text className="text-xs font-bold text-white">
                        Buka Halaman Pembayaran
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            ) : null}

            {/* ── CTA Bawah ── */}
            <View className="bg-white rounded-xl shadow-xs border border-slate-100 p-4 gap-3">
              <TouchableOpacity
                onPress={handleOpenInstagram}
                className="flex-row items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 active:opacity-90 shadow-sm"
                style={{backgroundColor: '#e1306c'}}
                accessibilityRole="button"
                accessibilityLabel="Follow Instagram Kami">
                <InstagramIcon size={18} color="#ffffff" />
                <Text className="text-white text-sm font-semibold">
                  Follow Instagram Kami
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDonateOther}
                className="flex-row items-center justify-center w-full py-3 rounded-xl border border-primary-400 bg-white active:bg-primary-50"
                accessibilityRole="button"
                accessibilityLabel="Donasi ke Program Lain">
                <Text className="text-primary-600 text-sm font-semibold">
                  Donasi ke Program Lain
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Share BottomSheet */}
      <ShareBottomSheet
        ref={shareSheetRef}
        onSelectOption={handleSelectShareOption}
      />
    </View>
  );
}
