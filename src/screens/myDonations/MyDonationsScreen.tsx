import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {
  AltArrowDown,
  HandMoney,
  HandHeart,
} from '@solar-icons/react-native/Linear';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { MyDonationsTopBar } from '@/components/shared/MyDonationsTopBar';
import { MyDonationsHeroBanner } from '@/components/shared/MyDonationsHeroBanner';
import { FloatingOrbs } from '@/components/shared/FloatingOrbs';
import { TrackingStatusBar } from '@/components/shared/TrackingStatusBar';
import { MyDonationsTabBar } from '@/components/shared/MyDonationsTabBar';
import { DonationHistoryItem } from '@/components/shared/DonationHistoryItem';
import {
  DonasiRekapPieChart,
  type DonasiRekapChartSlice,
} from '@/components/shared/DonasiRekapPieChart';
import { CategorySummaryRow } from '@/components/shared/CategorySummaryRow';
import { useMyDonations } from '@/hooks/useMyDonations';
import { useAuthStore } from '@/stores/authStore';
import { getCategoryIconBySlug } from '@/utils/categoryIcons';
import { formatCurrency } from '@/utils/formatCurrency';
import { showToast } from '@/utils/toast';
import {
  colors,
  spacing,
  radius,
  fontSize,
  fontWeight,
  lineHeight,
  shadows,
} from '@/theme';
import type { MainTabNavigationProp, RootStackNavigationProp } from '@/types/navigation';
import type {
  CategorySummary,
  DistributedDonation,
  Donation,
} from '@/types/myDonations';
import type { DonationPaymentStatus, DonationSalurStatus } from '@/types/tracking';

const DONATION_STATUS_LABEL: Record<DonationPaymentStatus, string> = {
  menunggu: 'MENUNGGU PEMBAYARAN',
  gagal: 'GAGAL',
  expired: 'EXPIRED',
  sukses: 'SUKSES',
};

const DONATION_STATUS_COLOR: Record<DonationPaymentStatus, { bg: string; text: string }> = {
  menunggu: { bg: colors.semantic.warningLight, text: colors.semantic.warning },
  gagal: { bg: colors.semantic.errorLight, text: colors.semantic.error },
  expired: { bg: colors.semantic.errorLight, text: colors.semantic.error },
  sukses: { bg: colors.semantic.successLight, text: colors.semantic.success },
};

const DISTRIBUTION_STATUS_LABEL: Record<DonationSalurStatus, string> = {
  menunggu: 'MENUNGGU SALUR',
  persiapan: 'PERSIAPAN SALUR',
  proses: 'PROSES SALUR',
  selesai: 'SELESAI SALUR',
};

const DISTRIBUTION_STATUS_COLOR: Record<
  DonationSalurStatus,
  { bg: string; text: string }
> = {
  menunggu: { bg: colors.semantic.warningLight, text: colors.semantic.warning },
  persiapan: { bg: colors.primary[100], text: colors.primary[600] },
  proses: { bg: colors.semantic.infoLight, text: colors.semantic.info },
  selesai: { bg: colors.semantic.successLight, text: colors.semantic.success },
};

const DEFAULT_TRACKING_SUMMARY = {
  waitingPayment: 0,
  waitingDistribution: 0,
  inProgress: 0,
  completed: 0,
};

const MAX_CHART_SLICES = 5;

function buildChartSlices(categories: CategorySummary[]): DonasiRekapChartSlice[] {
  const sorted = [...categories].sort((a, b) => b.totalAmount - a.totalAmount);
  const top = sorted.slice(0, MAX_CHART_SLICES);
  const rest = sorted.slice(MAX_CHART_SLICES);
  const restTotal = rest.reduce((sum, category) => sum + category.totalAmount, 0);
  const slices: DonasiRekapChartSlice[] = top.map(category => ({
    label: category.name,
    value: category.totalAmount,
  }));
  if (restTotal > 0) {
    slices.push({ label: 'Lainnya', value: restTotal });
  }
  return slices;
}

function showComingSoon(): void {
  showToast('Segera hadir');
}

export default function MyDonationsScreen(): React.JSX.Element {
  const navigation = useNavigation<MainTabNavigationProp>();
  const scrollViewRef = useRef<ScrollView>(null);
  const historySectionRef = useRef<View>(null);
  const isAuthenticated = useAuthStore(s => s.accessToken != null);
  const [scrollY, setScrollY] = useState(0);

  const {
    trackingSummary,
    isLoading,
    isRefreshing,
    activeTab,
    transactions,
    isTransactionsLoading,
    distributions,
    isDistributionsLoading,
    categorySummary,
    isRekapLoading,
    isDownloadingRecap,
    setActiveTab,
    refresh,
    downloadRecap,
  } = useMyDonations(isAuthenticated);

  function handlePressSearch(): void {
    navigation.getParent<RootStackNavigationProp>()?.navigate('Search');
  }

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>): void {
    setScrollY(event.nativeEvent.contentOffset.y);
  }

  function handlePressLogin(): void {
    navigation.getParent<RootStackNavigationProp>()?.navigate('Login', {
      redirectTo: { screen: 'Home', params: { screen: 'MyDonations' } },
    });
  }

  function handlePressRegister(): void {
    navigation.getParent<RootStackNavigationProp>()?.navigate('Register');
  }

  function handlePressDonateAgain(): void {
    navigation.navigate('Donations');
  }

  function handlePressTransaction(donation: Donation): void {
    navigation
      .getParent<RootStackNavigationProp>()
      ?.navigate('Tracking', { donationId: donation.id });
  }

  function handlePressDistribution(distribution: DistributedDonation): void {
    navigation
      .getParent<RootStackNavigationProp>()
      ?.navigate('Tracking', { donationId: distribution.id });
  }

  function handlePressCategory(_category: CategorySummary): void {
    showComingSoon();
  }

  async function handleDownloadRecap(): Promise<void> {
    await downloadRecap();
  }

  const summary = trackingSummary ?? DEFAULT_TRACKING_SUMMARY;
  const totalDonationAmount = categorySummary.reduce(
    (sum, category) => sum + category.totalAmount,
    0,
  );
  const chartSlices = buildChartSlices(categorySummary);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary[200], colors.primary[50], colors.neutral[0]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      />
      <FloatingOrbs />

      <MyDonationsTopBar onPressSearch={handlePressSearch} isScrolled={scrollY > 0} />

      {!isAuthenticated ? (
        <View style={styles.authGateWrapper}>
          <View style={styles.authGateCard}>
            <View style={styles.authGateIconWrapper}>
              <Icon icon={HandHeart} size={40} color={colors.primary[500]} />
            </View>
            <Text style={styles.authGateTitle}>
              Catat Jejak Kebaikanmu di Sini
            </Text>
            <Text style={styles.authGateSubtitle}>
              Masuk untuk melihat riwayat donasi dan status penyalurannya
              dalam satu tempat.
            </Text>
            <View style={styles.authGateButtonWrapper}>
              <Button label="Masuk Sekarang" onPress={handlePressLogin} />
            </View>
            <TouchableOpacity
              onPress={handlePressRegister}
              accessibilityRole="button"
              accessibilityLabel="Belum punya akun? Daftar">
              <Text style={styles.authGateRegisterText}>
                Belum punya akun?{' '}
                <Text style={styles.authGateRegisterLink}>Daftar</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary[500]} />
        </View>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              tintColor={colors.primary[500]}
              colors={[colors.primary[500]]}
            />
          }>
          <MyDonationsHeroBanner onPressDonateAgain={handlePressDonateAgain} />

          <View ref={historySectionRef} style={styles.statsCard}>
            {/* <TouchableOpacity
              style={styles.seeAllLink}
              onPress={handlePressSeeAllHistory}
              accessibilityRole="button"
              accessibilityLabel="Lihat semua riwayat">
              <Text style={styles.seeAllText}>Lihat Semua Riwayat</Text>
              <Icon icon={AltArrowRight} size={16} color={colors.primary[600]} />
            </TouchableOpacity> */}
            <TrackingStatusBar summary={summary} />
          </View>

          <View style={styles.tabBarWrapper}>
            <MyDonationsTabBar activeTab={activeTab} onChange={setActiveTab} />
          </View>

          <View style={styles.tabContent}>
            {activeTab === 'donasi' &&
              (isTransactionsLoading ? (
                <View style={styles.tabLoading}>
                  <ActivityIndicator color={colors.primary[500]} />
                </View>
              ) : transactions.length === 0 ? (
                <View style={styles.emptyWrapper}>
                  <EmptyState
                    icon={HandMoney}
                    title="Belum ada donasi"
                    description="Yuk mulai berdonasi dan lihat jejak kebaikanmu di sini."
                  />
                  <Button label="Mulai Donasi" onPress={handlePressDonateAgain} />
                </View>
              ) : (
                <View style={styles.listSection}>
                  {transactions.map(item => (
                    <DonationHistoryItem
                      key={item.id}
                      imageUrl={item.programImageUrl}
                      title={item.programTitle}
                      date={item.date}
                      amount={item.amount}
                      statusLabel={DONATION_STATUS_LABEL[item.status]}
                      statusColor={DONATION_STATUS_COLOR[item.status]}
                      onPress={() => handlePressTransaction(item)}
                    />
                  ))}
                </View>
              ))}

            {activeTab === 'penyaluran' &&
              (isDistributionsLoading ? (
                <View style={styles.tabLoading}>
                  <ActivityIndicator color={colors.primary[500]} />
                </View>
              ) : distributions.length === 0 ? (
                <EmptyState
                  icon={HandMoney}
                  title="Belum ada penyaluran"
                  description="Donasi kamu yang sudah disalurkan akan muncul di sini."
                />
              ) : (
                <View style={styles.listSection}>
                  {distributions.map(item => (
                    <DonationHistoryItem
                      key={item.id}
                      imageUrl={item.programImageUrl}
                      title={item.programTitle}
                      date={item.date}
                      amount={item.amount}
                      statusLabel={DISTRIBUTION_STATUS_LABEL[item.salurStatus]}
                      statusColor={DISTRIBUTION_STATUS_COLOR[item.salurStatus]}
                      onPress={() => handlePressDistribution(item)}
                    />
                  ))}
                </View>
              ))}

            {activeTab === 'rekap' &&
              (isRekapLoading ? (
                <View style={styles.tabLoading}>
                  <ActivityIndicator color={colors.primary[500]} />
                </View>
              ) : (
                <View style={styles.rekapSection}>
                  <View style={styles.rekapCard}>
                    <Text style={styles.rekapCardTitle}>Persentase Donasi</Text>
                    <View style={styles.rekapFilterRow}>
                      <Text style={styles.rekapFilterLabel}>Semua Transaksi</Text>
                      <Icon
                        icon={AltArrowDown}
                        size={16}
                        color={colors.neutral[500]}
                      />
                    </View>

                    <View style={styles.chartWrapper}>
                      <DonasiRekapPieChart data={chartSlices} />
                    </View>

                    <Text style={styles.totalAmountText}>
                      {totalDonationAmount > 0
                        ? `${formatCurrency(totalDonationAmount)} Total Donasi`
                        : 'Belum ada donasi'}
                    </Text>

                    <Button
                      label="Download Rekapan"
                      variant="secondary"
                      isLoading={isDownloadingRecap}
                      onPress={handleDownloadRecap}
                    />
                  </View>

                  <View style={styles.categoryListSection}>
                    <Text style={styles.sectionLabel}>Donasi per Kategori</Text>
                    {categorySummary.map(category => (
                      <CategorySummaryRow
                        key={category.id}
                        icon={getCategoryIconBySlug(category.slug)}
                        name={category.name}
                        donationCount={category.donationCount}
                        totalAmount={category.totalAmount}
                        onPress={() => handlePressCategory(category)}
                      />
                    ))}
                  </View>
                </View>
              ))}
          </View>
        </ScrollView>
      )}
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
    height: 420,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authGateWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  authGateCard: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    borderRadius: radius['2xl'],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['2xl'],
    gap: spacing.md,
    ...shadows.sm,
  },
  authGateIconWrapper: {
    width: 88,
    height: 88,
    borderRadius: radius.full,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  authGateTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
    textAlign: 'center',
  },
  authGateSubtitle: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
    color: colors.neutral[600],
    textAlign: 'center',
  },
  authGateButtonWrapper: {
    alignSelf: 'stretch',
    marginTop: spacing.xs,
  },
  authGateRegisterText: {
    fontSize: fontSize.sm,
    color: colors.neutral[600],
  },
  authGateRegisterLink: {
    fontWeight: fontWeight.semiBold,
    color: colors.primary[600],
  },
  scrollContent: {
    paddingBottom: spacing['3xl'],
  },
  statsCard: {
    marginHorizontal: spacing.lg,
    marginTop: -spacing['2xl'],
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.neutral[0],
    gap: spacing.md,
    ...shadows.md,
  },
  seeAllLink: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: spacing.xs,
  },
  seeAllText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.primary[600],
  },
  sectionLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  tabBarWrapper: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    backgroundColor: colors.neutral[0]
  },
  tabContent: {
    paddingTop: spacing.lg,
    backgroundColor: colors.neutral[0]
  },
  tabLoading: {
    paddingVertical: spacing['2xl'],
    alignItems: 'center',
  },
  emptyWrapper: {
    alignItems: 'center',
    gap: spacing.md,
  },
  listSection: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  rekapSection: {
    gap: spacing.lg,
  },
  rekapCard: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.neutral[50],
    alignItems: 'center',
    gap: spacing.sm,
  },
  rekapCardTitle: {
    alignSelf: 'flex-start',
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  rekapFilterRow: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rekapFilterLabel: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
  },
  chartWrapper: {
    paddingVertical: spacing.md,
  },
  totalAmountText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  categoryListSection: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
});
