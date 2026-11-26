import React, {useCallback, useEffect, useRef, useState} from 'react';
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
import {
  AltArrowLeft,
  AltArrowRight,
  Buildings,
  ClockCircle,
  FileText,
  MapPoint,
  Share,
} from '@solar-icons/react-native/Linear';
import type {BottomSheetModal} from '@gorhom/bottom-sheet';
import {Icon} from '@/components/ui/Icon';
import {ShareBottomSheet, type ShareOption} from '@/components/shared/ShareBottomSheet';
import {
  getAllReportsByLink,
  getProgramDetail,
  type ApiReportItem,
} from '@/services/donationService';
import {formatDate} from '@/utils/formatDate';
import {showToast} from '@/utils/toast';
import {colors} from '@/theme';
import type {AllReportSalurScreenProps} from '@/types/navigation';

function InstagramIcon({size = 14, color = '#e1306c'}: {size?: number; color?: string}): React.JSX.Element {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </Svg>
  );
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

export default function AllReportSalurScreen({
  route,
  navigation,
}: AllReportSalurScreenProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const {programId, programLink, programTitle, programImageUrl} = route.params;

  const [reports, setReports] = useState<ApiReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const shareSheetRef = useRef<BottomSheetModal>(null);

  const fetchReports = useCallback(async (): Promise<void> => {
    let slug = programLink || '';
    if (!slug && programId) {
      if (/^\d+$/.test(programId)) {
        try {
          const detailRes = await getProgramDetail(programId);
          if (detailRes.success && detailRes.data?.link) {
            slug = detailRes.data.link;
          } else {
            slug = programId;
          }
        } catch {
          slug = programId;
        }
      } else {
        slug = programId;
      }
    }

    if (!slug) {
      setIsLoading(false);
      return;
    }
    try {
      const response = await getAllReportsByLink(slug);
      if (response.success && response.data) {
        setReports(response.data);
      } else {
        showToast(response.message || 'Gagal memuat laporan');
      }
    } catch {
      showToast('Tidak dapat memuat laporan penyaluran');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [programLink, programId]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  function handleRefresh(): void {
    setIsRefreshing(true);
    fetchReports();
  }

  function handleShare(): void {
    shareSheetRef.current?.present();
  }

  function handleSelectShareOption(option: ShareOption): void {
    shareSheetRef.current?.dismiss();
    showToast(`Fitur berbagi ke ${SHARE_OPTION_LABEL[option]} akan segera hadir.`);
  }

  function handleDonateNow(): void {
    const firstItem = reports[0];
    const targetLink = programLink || firstItem?.program?.link || '';
    const targetId = programId || (firstItem?.program?.id ? String(firstItem.program.id) : '');
    const targetTitle = programTitle || firstItem?.program?.title || 'Donasi';
    const targetImage = programImageUrl || firstItem?.program?.image || '';

    navigation.navigate('AlurDonasi', {
      programId: targetId || '0',
      programTitle: targetTitle,
      programImageUrl: targetImage,
      programLink: targetLink,
    });
  }

  function handlePressDetail(item: ApiReportItem): void {
    navigation.navigate('DetailReportSalur', {
      reportId: item.id,
      programLink: programLink || item.program?.link,
      programTitle: programTitle || item.program?.title,
      programImageUrl: programImageUrl || item.program?.image,
    });
  }

  async function handleOpenInstagram(url?: string): Promise<void> {
    if (!url || url === '-') return;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        showToast('Tidak dapat membuka tautan Instagram');
      }
    } catch {
      showToast('Gagal membuka tautan');
    }
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
          Laporan Penyaluran
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
          <Text className="text-sm text-slate-500">Memuat laporan penyaluran...</Text>
        </View>
      ) : (
        <View className="flex-1">
          <ScrollView
            className="flex-1 px-4 pt-4"
            contentContainerStyle={{paddingBottom: 100}}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={[colors.primary[500]]}
              />
            }
            showsVerticalScrollIndicator={false}>
            {/* Empty State */}
            {reports.length === 0 ? (
              <View className="bg-white rounded-2xl p-8 border border-slate-100 shadow-xs items-center text-center my-6">
                <View className="w-14 h-14 rounded-full bg-primary-50 items-center justify-center mb-3">
                  <Icon icon={FileText} size={28} color={colors.primary[500]} />
                </View>
                <Text className="text-sm font-bold text-slate-800 mb-1">
                  Belum Ada Laporan
                </Text>
                <Text className="text-xs text-slate-500 text-center max-w-xs mb-5 leading-relaxed">
                  Penyaluran untuk program ini sedang dipersiapkan dan akan diperbarui secara berkala.
                </Text>
                <TouchableOpacity
                  onPress={handleDonateNow}
                  className="px-5 py-2.5 rounded-xl bg-primary-500 active:bg-primary-600 shadow-sm">
                  <Text className="text-white text-xs font-semibold">
                    Donasi Sekarang
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="pb-6">
                {/* Timeline Header */}
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-sm font-bold text-slate-800">
                    Riwayat Penyaluran
                  </Text>
                  <Text className="text-xs text-slate-400 font-medium">
                    {reports.length} update
                  </Text>
                </View>

                {/* Timeline List */}
                <View className="relative ml-2 pl-4 border-l-2 border-primary-200/80 gap-6">
                  {reports.map((item, index) => {
                    const mitra = item.mitra?.[0];
                    const mitraName = mitra?.name || 'Beramalbersama';
                    const mitraImage = mitra?.image_url || mitra?.image;

                    const cardImage =
                      item.wa_image ||
                      item.kegiatan?.image ||
                      item.image ||
                      item.program?.image;

                    const title =
                      item.title ||
                      item.kegiatan?.title ||
                      item.project?.title ||
                      'Penyaluran Donasi';

                    const projectTitle = item.project?.title || item.project?.name;
                    const projectLocation =
                      item.project?.location || item.project?.lokasi_penyaluran;
                    const isInstagramSource =
                      item.source?.toLowerCase() === 'instagram';
                    const isKegiatanSource =
                      item.source?.toLowerCase() === 'kegiatan';

                    const description = cleanText(
                      item.content ||
                        item.kegiatan?.deskripsi ||
                        item.wa_caption,
                    );

                    const statusBadgeLabel =
                      item.type === 'Final' ? 'Selesai' : item.type || 'Penyaluran';

                    return (
                      <View key={`${item.id ?? 'report'}-${index}`} className="relative">
                        {/* Timeline Dot */}
                        <View className="absolute -left-[23px] top-4 w-3.5 h-3.5 rounded-full bg-primary-500 border-2 border-white shadow-xs z-10" />

                        {/* Report Card */}
                        <View className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                          {/* Card Meta Header */}
                          <View className="flex-row items-center justify-between p-3.5 pb-3 border-b border-slate-50 gap-2">
                            <View className="flex-row items-center gap-2.5 flex-1 min-w-0">
                              {mitraImage ? (
                                <Image
                                  source={{uri: mitraImage}}
                                  className="w-8 h-8 rounded-full border border-slate-200 bg-white"
                                  resizeMode="contain"
                                />
                              ) : (
                                <View className="w-8 h-8 rounded-full bg-primary-500 items-center justify-center shadow-xs">
                                  <Text className="text-white font-bold text-xs">
                                    {(mitraName || 'B').charAt(0).toUpperCase()}
                                  </Text>
                                </View>
                              )}
                              <View className="flex-1 min-w-0">
                                <Text
                                  className="text-xs font-bold text-slate-800"
                                  numberOfLines={1}>
                                  {mitraName}
                                </Text>
                                <Text className="text-[11px] text-slate-400 mt-0.5">
                                  {item.date ? formatDate(item.date) : '-'}
                                </Text>
                              </View>
                            </View>

                            {/* Status Badge */}
                            <View className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                              <Text className="text-[11px] font-semibold text-emerald-600">
                                {statusBadgeLabel}
                              </Text>
                            </View>
                          </View>

                          {/* Featured Image */}
                          {cardImage ? (
                            <TouchableOpacity
                              activeOpacity={0.9}
                              onPress={() => handlePressDetail(item)}
                              className="w-full bg-slate-100 overflow-hidden">
                              <Image
                                source={{uri: cardImage}}
                                className="w-full h-44"
                                resizeMode="cover"
                              />
                            </TouchableOpacity>
                          ) : null}

                          {/* Card Body */}
                          <View className="p-4 gap-2.5">
                            {/* Project Tag (if any) */}
                            {projectTitle && projectTitle !== title ? (
                              <View className="self-start flex-row items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-50/80">
                                <Icon
                                  icon={Buildings}
                                  size={13}
                                  color={colors.primary[600]}
                                />
                                <Text
                                  className="text-[11px] font-medium text-primary-700"
                                  numberOfLines={1}>
                                  {projectTitle}
                                </Text>
                              </View>
                            ) : null}

                            {/* Location */}
                            {typeof projectLocation === 'string' && projectLocation.trim() !== '' ? (
                              <View className="flex-row items-center gap-1">
                                <Icon
                                  icon={MapPoint}
                                  size={13}
                                  color={colors.semantic.error}
                                />
                                <Text
                                  className="text-[11px] text-slate-500 flex-1"
                                  numberOfLines={1}>
                                  {projectLocation}
                                </Text>
                              </View>
                            ) : null}

                            {/* Source Row */}
                            <View className="flex-row items-center gap-1.5">
                              {isInstagramSource ? (
                                <InstagramIcon size={13} color="#e1306c" />
                              ) : (
                                <Icon
                                  icon={ClockCircle}
                                  size={13}
                                  color={colors.neutral[400]}
                                />
                              )}
                              <Text className="text-[11px] text-slate-400">
                                Salur: {isKegiatanSource ? 'Progres' : 'Laporan'}
                              </Text>
                            </View>

                            {/* Title */}
                            <TouchableOpacity
                              activeOpacity={0.8}
                              onPress={() => handlePressDetail(item)}>
                              <Text className="text-sm font-bold text-slate-900 leading-snug">
                                {title}
                              </Text>
                            </TouchableOpacity>

                            {/* Description Preview */}
                            {description ? (
                              <Text
                                className="text-xs text-slate-600 leading-relaxed"
                                numberOfLines={3}>
                                {description}
                              </Text>
                            ) : null}

                            {/* Footer Action */}
                            <View className="pt-2 border-t border-slate-50 flex-row items-center justify-between gap-2">
                              {item.ig_link && item.ig_link !== '-' ? (
                                <TouchableOpacity
                                  onPress={() => handleOpenInstagram(item.ig_link)}
                                  className="flex-row items-center gap-1.5 py-1 px-1.5 rounded active:opacity-70"
                                  accessibilityRole="button"
                                  accessibilityLabel="Lihat di Instagram">
                                  <InstagramIcon size={14} color="#e1306c" />
                                  <Text className="text-[11px] font-semibold text-pink-600">
                                    Lihat di Instagram
                                  </Text>
                                </TouchableOpacity>
                              ) : (
                                <View />
                              )}

                              <TouchableOpacity
                                onPress={() => handlePressDetail(item)}
                                className="flex-row items-center gap-1 py-1 px-1.5 rounded active:opacity-70"
                                accessibilityRole="button"
                                accessibilityLabel={isKegiatanSource ? 'Detail Progres' : 'Detail Laporan'}>
                                <Text className="text-xs font-semibold text-primary-600">
                                  {isKegiatanSource ? 'Detail Progres' : 'Detail Laporan'}
                                </Text>
                                <Icon
                                  icon={AltArrowRight}
                                  size={13}
                                  color={colors.primary[600]}
                                />
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
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

      {/* Share BottomSheet */}
      <ShareBottomSheet
        ref={shareSheetRef}
        onSelectOption={handleSelectShareOption}
      />
    </View>
  );
}
