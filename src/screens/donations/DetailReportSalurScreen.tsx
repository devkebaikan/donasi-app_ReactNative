import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {Path} from 'react-native-svg';
import {
  AltArrowLeft,
  MapPoint,
  Share,
} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {HtmlContent} from '@/components/shared/HtmlContent';
import {
  getReportDetailById,
  type ApiReportItem,
} from '@/services/donationService';
import {formatDate} from '@/utils/formatDate';
import {showToast} from '@/utils/toast';
import {colors} from '@/theme';
import type {DetailReportSalurScreenProps} from '@/types/navigation';

function InstagramIcon({size = 16, color = '#e1306c'}: {size?: number; color?: string}): React.JSX.Element {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </Svg>
  );
}

export default function DetailReportSalurScreen({
  route,
  navigation,
}: DetailReportSalurScreenProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const {reportId, programLink, programTitle, programImageUrl} = route.params;

  const [report, setReport] = useState<ApiReportItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchDetail(): Promise<void> {
      setIsLoading(true);
      try {
        const response = await getReportDetailById(reportId);
        if (isMounted) {
          if (response.success && response.data) {
            setReport(response.data);
          } else {
            showToast(response.message || 'Laporan tidak ditemukan');
          }
        }
      } catch {
        if (isMounted) {
          showToast('Tidak dapat memuat detail laporan');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchDetail();
    return () => {
      isMounted = false;
    };
  }, [reportId]);

  const mitra = report?.mitra?.[0];
  const mitraName = mitra?.name || 'Beramalbersama';
  const mitraImage = mitra?.image_url || mitra?.image;

  const displayImage =
    report?.wa_image ||
    report?.kegiatan?.image ||
    report?.image ||
    report?.program?.image ||
    programImageUrl;

  const title =
    report?.title ||
    report?.kegiatan?.title ||
    report?.project?.title ||
    'Detail Penyaluran';

  const htmlContent =
    report?.content ||
    report?.kegiatan?.deskripsi ||
    (typeof report?.wa_caption === 'string' && report.wa_caption.trim()
      ? `<p>${report.wa_caption.replace(/\r\n/g, '<br/>').replace(/\n/g, '<br/>')}</p>`
      : '');

  const statusLabel =
    report?.type === 'Final' ? 'Selesai' : report?.type || 'Penyaluran';

  const effectiveProgramLink =
    report?.program?.link || programLink || '';
  const effectiveProgramId =
    report?.program?.id ? String(report.program.id) : '';
  const effectiveProgramTitle =
    report?.program?.title || programTitle || 'Donasi';
  const effectiveProgramImage =
    report?.program?.image || programImageUrl || '';

  const projectTitle = report?.project?.title || report?.project?.name;
  const projectLocation =
    report?.project?.location || report?.project?.lokasi_penyaluran;

  async function handleOpenInstagram(): Promise<void> {
    if (!report?.ig_link || report.ig_link === '-') return;
    try {
      const supported = await Linking.canOpenURL(report.ig_link);
      if (supported) {
        await Linking.openURL(report.ig_link);
      } else {
        showToast('Tidak dapat membuka tautan Instagram');
      }
    } catch {
      showToast('Gagal membuka tautan');
    }
  }

  function handleDonateNow(): void {
    if (effectiveProgramId || effectiveProgramLink) {
      navigation.navigate('AlurDonasi', {
        programId: effectiveProgramId || '0',
        programTitle: effectiveProgramTitle,
        programImageUrl: effectiveProgramImage,
        programLink: effectiveProgramLink,
      });
    } else {
      navigation.goBack();
    }
  }

  return (
    <View className="flex-1 bg-white" style={{paddingTop: insets.top}}>
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
          Detail Laporan
        </Text>
        <View className="w-10" />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center p-6 gap-3">
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text className="text-sm text-slate-500">Memuat detail laporan...</Text>
        </View>
      ) : !report ? (
        <View className="flex-1 items-center justify-center p-6 gap-4">
          <Text className="text-sm font-semibold text-slate-700">
            Laporan tidak ditemukan
          </Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="px-4 py-2 bg-primary-500 rounded-xl">
            <Text className="text-xs font-bold text-white">Kembali</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="flex-1">
          <ScrollView
            className="flex-1"
            contentContainerStyle={{paddingBottom: 100}}
            showsVerticalScrollIndicator={false}>
            {/* Main Featured Image */}
            {displayImage ? (
              <View className="w-full bg-slate-100 overflow-hidden">
                <Image
                  source={{uri: displayImage}}
                  className="w-full h-64"
                  resizeMode="cover"
                />
              </View>
            ) : null}

            <View className="p-4 gap-4">
              {/* Mitra Meta Header */}
              <View className="flex-row items-center justify-between pb-3 border-b border-slate-100">
                <View className="flex-row items-center gap-3 flex-1 min-w-0 pr-2">
                  {mitraImage ? (
                    <Image
                      source={{uri: mitraImage}}
                      className="w-10 h-10 rounded-full border border-slate-200 bg-white"
                      resizeMode="contain"
                    />
                  ) : (
                    <View className="w-10 h-10 rounded-full bg-primary-500 items-center justify-center shadow-xs">
                      <Text className="text-white font-bold text-sm">
                        {(mitraName || 'B').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View className="flex-1 min-w-0">
                    <Text
                      className="text-sm font-bold text-slate-900"
                      numberOfLines={1}>
                      {mitraName}
                    </Text>
                    <Text className="text-[11px] text-slate-400 mt-0.5">
                      {report.date ? formatDate(report.date) : '-'}
                    </Text>
                  </View>
                </View>

                {/* Status Badge */}
                <View className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                  <Text className="text-xs font-semibold text-emerald-600">
                    {statusLabel}
                  </Text>
                </View>
              </View>

              {/* Project Badge & Location */}
              {projectTitle ? (
                <View className="p-3 bg-primary-50/70 rounded-xl gap-1">
                  <Text className="text-[11px] font-semibold text-primary-800">
                    Proyek Penyaluran:
                  </Text>
                  <Text className="text-xs text-primary-900 font-medium">
                    {projectTitle}
                  </Text>
                  {typeof projectLocation === 'string' && projectLocation.trim() !== '' ? (
                    <View className="flex-row items-center gap-1 pt-1">
                      <Icon
                        icon={MapPoint}
                        size={14}
                        color={colors.semantic.error}
                      />
                      <Text className="text-[11px] text-slate-500 flex-1" numberOfLines={1}>
                        {projectLocation}
                      </Text>
                    </View>
                  ) : null}
                </View>
              ) : null}

              {/* Title */}
              <Text className="text-base font-bold text-slate-900 leading-snug">
                {title}
              </Text>

              {/* Rendered HTML Content */}
              {htmlContent ? (
                <View className="pt-1">
                  <HtmlContent html={htmlContent} />
                </View>
              ) : null}

              {/* Instagram Documentation Button */}
              {report.ig_link &&
              report.ig_link !== '-' &&
              report.ig_link !== '' ? (
                <View className="pt-3 border-t border-slate-100">
                  <TouchableOpacity
                    onPress={handleOpenInstagram}
                    className="flex-row items-center justify-center gap-2 px-4 py-3 rounded-xl bg-pink-50 border border-pink-100 active:bg-pink-100"
                    accessibilityRole="button"
                    accessibilityLabel="Lihat Dokumentasi di Instagram">
                    <InstagramIcon size={18} color="#e1306c" />
                    <Text className="text-xs font-bold text-pink-600">
                      Lihat Dokumentasi di Instagram
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          </ScrollView>

          {/* Sticky Bottom CTA */}
          <View
            className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-3"
            style={{paddingBottom: Math.max(insets.bottom, 12)}}>
            <TouchableOpacity
              onPress={handleDonateNow}
              className="w-full py-3.5 bg-primary-500 active:bg-primary-600 rounded-xl items-center justify-center shadow-md shadow-primary-500/20"
              accessibilityRole="button"
              accessibilityLabel="Donasi Sekarang">
              <Text className="text-sm font-bold text-white">
                Donasi Sekarang
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
