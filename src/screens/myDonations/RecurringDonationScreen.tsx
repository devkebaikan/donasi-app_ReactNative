import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  CalendarDate,
  CardTransfer,
  HeartShine,
  RepeatOne,
} from '@solar-icons/react-native/Linear';
import {Icon, type SolarIconComponent} from '@/components/ui/Icon';
import {AppLogo} from '@/components/ui/AppLogo';
import {SearchField} from '@/components/ui/SearchField';
import {Button} from '@/components/ui/Button';
import {FloatingOrbs} from '@/components/shared/FloatingOrbs';
import {RecurringDonationCard} from '@/components/shared/RecurringDonationCard';
import {RecurringDonationCardSkeleton} from '@/components/shared/RecurringDonationCardSkeleton';
import {RecurringStatusChips} from '@/components/shared/RecurringStatusChips';
import {useRecurringDonationList} from '@/hooks/useRecurringDonationList';
import {useAuthStore} from '@/stores/authStore';
import {
  colors,
  spacing,
  radius,
  fontSize,
  fontWeight,
  lineHeight,
  shadows,
} from '@/theme';
import type {
  MainTabNavigationProp,
  RootStackNavigationProp,
} from '@/types/navigation';
import type {RecurringDonation} from '@/types/recurringDonation';

// Cukup untuk memenuhi layar terkecil yang didukung tanpa perlu diukur.
const SKELETON_KEYS = ['a', 'b', 'c'];

// Bottom tab bar (tinggi 56) plus tombol tengahnya yang menyembul ke atas.
// Tanpa ruang ini kartu terakhir tertutup separuh oleh tab bar.
const BOTTOM_TAB_CLEARANCE = 84;

const FEATURES: {icon: SolarIconComponent; title: string; caption: string; tint: string}[] = [
  {icon: CalendarDate, title: 'Atur Jadwal', caption: 'Fleksibel', tint: colors.semantic.infoLight},
  {icon: CardTransfer, title: 'Auto Debit', caption: 'Mudah', tint: colors.semantic.successLight},
  {icon: HeartShine, title: 'Pahala Rutin', caption: 'Berkah', tint: colors.secondary[100]},
];

type ListRow =
  | {kind: 'routine'; donation: RecurringDonation}
  | {kind: 'skeleton'; id: string};

// Screen ini SEKARANG cuma menampilkan rutinitas milik user. Katalog program
// rutin pindah ke DonasiRutinProgramScreen, dan pintu masuknya adalah tombol
// "Mulai Donasi Rutin" -> DonasiRutinJenisScreen. Karena itu tidak ada lagi
// tab bar di sini. Lihat docs/08-features/donasi-rutin/README.md.
export default function RecurringDonationScreen(): React.JSX.Element {
  const navigation = useNavigation<MainTabNavigationProp>();
  const insets = useSafeAreaInsets();
  const isAuthenticated = useAuthStore(s => s.accessToken != null);

  // searchInput: isi field, berubah tiap ketukan. searchQuery: nilai yang sudah
  // di-submit — hanya ini yang memicu fetch/penyaringan. Tanpa debounce:
  // pencarian di menu ini aksi eksplisit pengguna.
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const routineList = useRecurringDonationList(isAuthenticated, searchQuery);

  // Rutinitas bisa diubah, dijeda, atau dihentikan di screen detail. Refresh
  // saat fokus kembali lebih sederhana daripada mengoper param balik, dan
  // tidak bisa terlewat. Fokus pertama dilewati: hook-nya sudah memuat sendiri.
  const hasFocusedRef = useRef(false);
  useFocusEffect(
    React.useCallback(() => {
      if (!isAuthenticated) {
        return;
      }
      if (!hasFocusedRef.current) {
        hasFocusedRef.current = true;
        return;
      }
      routineList.reload();
      // routineList.reload identitasnya berubah tiap render; sengaja tidak
      // dimasukkan ke deps supaya efek ini hanya jalan saat fokus berubah.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]),
  );

  function handlePressRoutine(donation: RecurringDonation): void {
    navigation
      .getParent<RootStackNavigationProp>()
      ?.navigate('DetailDonasiRutin', {recurringId: donation.id});
  }

  // Memilih jenis donasi rutin boleh tanpa login — gerbang login ada di form.
  function handlePressStart(): void {
    navigation.getParent<RootStackNavigationProp>()?.navigate('DonasiRutinJenis');
  }

  function handlePressLogin(): void {
    navigation.getParent<RootStackNavigationProp>()?.navigate('Login', {
      redirectTo: {screen: 'Home', params: {screen: 'RecurringDonation'}},
    });
  }

  function buildRows(): ListRow[] {
    if (!isAuthenticated) {
      return [];
    }
    if (routineList.isLoading) {
      return SKELETON_KEYS.map(id => ({kind: 'skeleton', id}));
    }
    return routineList.donations.map(donation => ({kind: 'routine', donation}));
  }

  // Padding tepi ditempel per baris, BUKAN lewat contentContainerStyle —
  // blok hero + gradient harus penuh selebar layar.
  function renderRow({item}: {item: ListRow}): React.JSX.Element {
    return (
      <View style={styles.itemWrapper}>
        {item.kind === 'skeleton' ? (
          <RecurringDonationCardSkeleton />
        ) : (
          <RecurringDonationCard
            donation={item.donation}
            onPress={() => handlePressRoutine(item.donation)}
          />
        )}
      </View>
    );
  }

  function renderFeatureCard(): React.JSX.Element {
    return (
      <View style={styles.featureCard}>
        {FEATURES.map(feature => (
          <View key={feature.title} style={styles.feature}>
            <View style={[styles.featureIcon, {backgroundColor: feature.tint}]}>
              <Icon icon={feature.icon} size={22} color={colors.neutral[700]} />
            </View>
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureCaption}>{feature.caption}</Text>
          </View>
        ))}
      </View>
    );
  }

  function renderAuthGate(): React.JSX.Element {
    return (
      <View style={styles.authGateCard}>
        <View style={styles.authGateIconWrapper}>
          <Icon icon={RepeatOne} size={40} color={colors.primary[500]} />
        </View>
        <Text style={styles.authGateTitle}>Masuk untuk melihat donasi rutin</Text>
        <Text style={styles.authGateSubtitle}>
          Kelola jadwal donasi otomatis kamu.
        </Text>
        <View style={styles.authGateButtonWrapper}>
          <Button label="Masuk Sekarang" onPress={handlePressLogin} />
        </View>
      </View>
    );
  }

  function renderEmpty(): React.JSX.Element | null {
    if (!isAuthenticated) {
      return renderAuthGate();
    }
    if (routineList.isLoading) {
      return null;
    }
    // Tanpa EmptyState, tanpa ilustrasi, tanpa tombol — cuma satu baris yang
    // memberi tahu keadaannya. Lihat spec donasi-rutin-list.md.
    return <Text style={styles.emptyText}>Belum ada rutinitas.</Text>;
  }

  // Gradient, orb, hero, tombol mulai, dan baris kontrol semuanya hidup DI
  // DALAM header daftar supaya ikut menggulir. Blok ini juga yang membatasi
  // FloatingOrbs (tingginya 999) lewat overflow: 'hidden'.
  function renderListHeader(): React.JSX.Element {
    return (
      <View>
        <View style={styles.heroBlock}>
          <LinearGradient
            colors={[colors.primary[200], colors.primary[50], colors.neutral[0]]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.heroGradient}
          />
          <FloatingOrbs />

          <View style={styles.hero}>
            <Text style={styles.heroTitle}>Kebaikan yang Jalan Sendiri</Text>
            <Text style={styles.heroSubtitle}>
              Atur sekali, donasimu berjalan otomatis setiap periode.
            </Text>
          </View>

          {/* Menggantikan tab bar yang dulu berdiri di posisi ini. */}
          <View style={styles.startButtonWrapper}>
            <Button
              label="Mulai Donasi Rutin"
              size="lg"
              onPress={handlePressStart}
            />
          </View>
        </View>

        {!isAuthenticated ? (
          <View style={styles.featureWrapper}>{renderFeatureCard()}</View>
        ) : null}

        {isAuthenticated ? (
          <View style={styles.controlRow}>
            <RecurringStatusChips
              value={routineList.statusFilter}
              onChange={routineList.setStatusFilter}
            />
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.neutral[0]} barStyle="dark-content" />

      {/* Satu baris: logo + field pencarian, tanpa judul — persis susunan
          HomeHeader. Field pencarian hanya berguna kalau ada daftar rutinitas
          untuk disaring, jadi tamu cuma melihat logonya. */}
      <View style={[styles.header, {paddingTop: insets.top + spacing.md}]}>
        <AppLogo />
        {isAuthenticated ? (
          <View style={styles.searchWrapper}>
            <SearchField
              value={searchInput}
              onChangeText={setSearchInput}
              onSubmit={() => setSearchQuery(searchInput.trim())}
              onClear={() => {
                setSearchInput('');
                setSearchQuery('');
              }}
              placeholder="Cari donasi rutin"
              accessibilityLabel="Cari donasi rutin"
            />
          </View>
        ) : null}
      </View>

      <FlatList
        data={buildRows()}
        keyExtractor={item =>
          item.kind === 'skeleton'
            ? `skeleton-${item.id}`
            : `routine-${item.donation.id}`
        }
        renderItem={renderRow}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          {paddingBottom: insets.bottom + BOTTOM_TAB_CLEARANCE},
        ]}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={routineList.isRefreshing}
            onRefresh={routineList.refresh}
            tintColor={colors.primary[500]}
            colors={[colors.primary[500]]}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[0],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.neutral[0],
  },
  searchWrapper: {
    flex: 1,
  },
  heroBlock: {
    overflow: 'hidden',
    paddingBottom: spacing.md,
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  hero: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  heroTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.primary[800],
    lineHeight: fontSize['2xl'] * lineHeight.tight,
  },
  heroSubtitle: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
    color: colors.neutral[600],
  },
  startButtonWrapper: {
    // alignItems flex-start bikin tombolnya selebar isinya saja, tidak
    // memanjang selebar layar seperti tombol submit di form.
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  featureWrapper: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[0],
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    ...shadows.sm,
  },
  feature: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  featureCaption: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  listContent: {
    // Tanpa padding horizontal supaya blok hero + gradient penuh selebar layar;
    // jarak tepi kartu diatur itemWrapper.
    gap: spacing.md,
  },
  itemWrapper: {
    paddingHorizontal: spacing.lg,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
    textAlign: 'center',
    paddingVertical: spacing['3xl'],
  },
  authGateCard: {
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[0],
    gap: spacing.sm,
    ...shadows.sm,
  },
  authGateIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  authGateTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
    textAlign: 'center',
  },
  authGateSubtitle: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
    color: colors.neutral[500],
    textAlign: 'center',
  },
  authGateButtonWrapper: {
    marginTop: spacing.sm,
    minWidth: 180,
  },
});
