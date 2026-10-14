import React, {useMemo, useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {
  AltArrowRight,
  InfoCircle,
  MagniferZoomIn,
} from '@solar-icons/react-native/Linear';
import {HeaderLight} from '@/components/shared/HeaderLight';
import {FloatingOrbs} from '@/components/shared/FloatingOrbs';
import {ImpactSummaryRow} from '@/components/shared/ImpactSummaryRow';
import {ImpactMapCanvas} from '@/components/shared/ImpactMapCanvas';
import {ImpactMapLegend} from '@/components/shared/ImpactMapLegend';
import {ImpactMapFullscreen} from '@/components/shared/ImpactMapFullscreen';
import {ImpactProvinceListSheet} from '@/components/shared/ImpactProvinceListSheet';
import {ImpactProvinceSheet} from '@/components/shared/ImpactProvinceSheet';
import {ImpactAsnafGrid} from '@/components/shared/ImpactAsnafGrid';
import {ImpactDataNoteSheet} from '@/components/shared/ImpactDataNoteSheet';
import {ImpactMapSkeleton} from '@/components/shared/ImpactMapSkeleton';
import {Icon} from '@/components/ui/Icon';
import {Button} from '@/components/ui/Button';
import {SafeAreaFooter} from '@/components/ui/SafeAreaFooter';
import {useImpactMap} from '@/hooks/useImpactMap';
import {formatNumberWithSeparator} from '@/utils/formatCurrency';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {RootStackNavigationProp} from '@/types/navigation';

export default function ImpactMapScreen(): React.JSX.Element {
  const navigation = useNavigation<RootStackNavigationProp>();
  const {
    data,
    shapes,
    provinceRows,
    isLoading,
    isRefreshing,
    refresh,
  } = useImpactMap();

  const [selectedProvinceCode, setSelectedProvinceCode] = useState<
    string | null
  >(null);
  const [isProvinceListOpen, setIsProvinceListOpen] = useState(false);
  const [isDataNoteOpen, setIsDataNoteOpen] = useState(false);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  // Tinggi gradient diukur, bukan ditebak: ia harus turun sampai melewati
  // baris "Luar Negeri", dan posisi baris itu bergeser mengikuti tinggi peta
  // dan ukuran layar. Dua pengukuran karena gradient hidup di luar ScrollView
  // (posisinya relatif ke container), sedangkan barisnya di dalam.
  const [scrollTop, setScrollTop] = useState(0);
  const [overseasBottom, setOverseasBottom] = useState<number | null>(null);

  const selectedShape = useMemo(
    () =>
      shapes.find(shape => shape.geometry.code === selectedProvinceCode) ?? null,
    [shapes, selectedProvinceCode],
  );

  function handleScrollLayout(event: LayoutChangeEvent): void {
    setScrollTop(event.nativeEvent.layout.y);
  }

  function handleOverseasLayout(event: LayoutChangeEvent): void {
    const {y, height} = event.nativeEvent.layout;
    setOverseasBottom(y + height);
  }

  const gradientStyle = useMemo(
    () => [
      styles.backgroundGradient,
      overseasBottom === null
        ? null
        : {height: scrollTop + overseasBottom + spacing.xl},
    ],
    [scrollTop, overseasBottom],
  );

  function handleOpenReport(): void {
    navigation.navigate('DistributionReport');
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary[200], colors.primary[50], colors.neutral[0]]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={gradientStyle}
      />
      <FloatingOrbs />

      <HeaderLight title="Jejak Kebaikan" onBack={() => navigation.goBack()} />

      <ScrollView
        onLayout={handleScrollLayout}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={colors.primary[500]}
          />
        }>
        <Text style={styles.heroTitle}>Peta Sebaran Manfaat</Text>

        {isLoading ? (
          <ImpactMapSkeleton />
        ) : (
          <>
            {/* Ringkasan dan asnaf hanya dirender saat datanya ada. Peta tetap
                digambar walau API gagal — geometrinya aset lokal, jadi halaman
                tidak pernah jadi layar kosong. */}
            {data ? (
              <ImpactSummaryRow
                countryName={data.countryName}
                participantCount={data.participantCount}
                serviceCount={data.serviceCount}
              />
            ) : null}

            <View style={styles.mapBlock}>
              <ImpactMapCanvas
                shapes={shapes}
                onSelectProvince={setSelectedProvinceCode}
              />
            </View>
            <ImpactMapLegend />

            {/* Satu baris: pill "Luar Negeri" rata tengah, tombol perbesar
                menempel di ujung kanan baris yang sama. Barisnya tetap
                dirender walau overseas kosong, supaya tombolnya tidak ikut
                hilang. */}
            <View
              style={styles.overseasPillRow}
              onLayout={handleOverseasLayout}>
              {data?.overseas ? (
                <View style={styles.overseasPill} accessibilityRole="text">
                  <Text style={styles.overseasLabel}>
                    {data.overseas.name}
                  </Text>
                  <Text style={styles.overseasValue}>
                    {formatNumberWithSeparator(
                      data.overseas.participantCount,
                    )}
                  </Text>
                </View>
              ) : null}
              <TouchableOpacity
                style={styles.zoomButton}
                onPress={() => setIsFullscreenOpen(true)}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Perbesar peta ke layar penuh">
                <Icon
                  icon={MagniferZoomIn}
                  size={24}
                  color={colors.neutral[600]}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.provinceListRow}
              onPress={() => setIsProvinceListOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="Buka rincian per provinsi">
              <Text style={styles.provinceListLabel}>
                Rincian per Provinsi
              </Text>
              <Icon
                icon={AltArrowRight}
                size={22}
                color={colors.neutral[500]}
              />
            </TouchableOpacity>

            {data && data.asnaf.length > 0 ? (
              <ImpactAsnafGrid asnaf={data.asnaf} />
            ) : null}

            {data ? (
              <TouchableOpacity
                style={styles.dataNoteRow}
                onPress={() => setIsDataNoteOpen(true)}
                accessibilityRole="button"
                accessibilityLabel={`Tentang Data Ini. Data per ${data.dataPeriodLabel}`}>
                <Icon
                  icon={InfoCircle}
                  size={18}
                  color={colors.secondary[500]}
                />
                <Text style={styles.dataNoteText}>
                  Data per {data.dataPeriodLabel}
                </Text>
              </TouchableOpacity>
            ) : null}
          </>
        )}
      </ScrollView>

      <SafeAreaFooter>
        <Text style={styles.footerTitle}>Laporan Penyaluran</Text>
        <Button
          label="Lihat Laporan Penyaluran"
          onPress={handleOpenReport}
          variant="primary"
        />
      </SafeAreaFooter>

      <ImpactProvinceSheet
        shape={selectedShape}
        onClose={() => setSelectedProvinceCode(null)}
      />
      <ImpactProvinceListSheet
        isOpen={isProvinceListOpen}
        provinces={provinceRows}
        onClose={() => setIsProvinceListOpen(false)}
      />
      <ImpactMapFullscreen
        isOpen={isFullscreenOpen}
        shapes={shapes}
        onClose={() => setIsFullscreenOpen(false)}
      />
      <ImpactDataNoteSheet
        isOpen={isDataNoteOpen}
        note={data?.dataNote ?? ''}
        onClose={() => setIsDataNoteOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[0],
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    // Cadangan sebelum pengukuran selesai (mis. saat masih skeleton).
    // Nilai sebenarnya dihitung dari posisi baris "Luar Negeri".
    height: 420,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  heroTitle: {
    marginTop: spacing.lg,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.neutral[800],
    textAlign: 'center',
  },
  overseasPillRow: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    marginTop: spacing.sm,
  },
  overseasPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  overseasLabel: {
    fontSize: fontSize.xs,
    color: colors.neutral[600],
  },
  overseasValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.secondary[500],
  },
  mapBlock: {
    marginTop: spacing.md,
  },
  // Icon saja, tanpa latar dan tanpa label. Ditaruh absolut di ujung kanan
  // baris "Luar Negeri" supaya sejajar dengannya tanpa menggeser pill yang
  // rata tengah. Target sentuhnya dijaga lewat hitSlop.
  zoomButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  provinceListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  provinceListLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  dataNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: spacing.xs,
    minHeight: 44,
    paddingHorizontal: spacing.xs,
  },
  dataNoteText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.secondary[500],
  },
  footerTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
    marginBottom: spacing.sm,
  },
});
