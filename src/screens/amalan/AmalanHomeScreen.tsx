import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {ChecklistMinimalistic} from '@solar-icons/react-native/Linear';
import {AddCircle} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {Button} from '@/components/ui/Button';
import {EmptyState} from '@/components/ui/EmptyState';
import {SafeAreaFooter} from '@/components/ui/SafeAreaFooter';
import {HeaderLight} from '@/components/shared/HeaderLight';
import {HeaderTransparent} from '@/components/shared/HeaderTransparent';
import {FloatingOrbs} from '@/components/shared/FloatingOrbs';
import {AmalanDateStrip} from '@/components/shared/AmalanDateStrip';
import {AmalanProgressCard} from '@/components/shared/AmalanProgressCard';
import {AmalanRow} from '@/components/shared/AmalanRow';
import {AmalanRowSkeleton} from '@/components/shared/AmalanRowSkeleton';
import {AmalanActionSheet} from '@/components/shared/AmalanActionSheet';
import {AmalanFormSheet} from '@/components/shared/AmalanFormSheet';
import {QuranConfirmDialog} from '@/components/shared/QuranConfirmDialog';
import {useAmalanHome, resolveInitialDate} from '@/hooks/useAmalanHome';
import {useAmalanForm} from '@/hooks/useAmalanForm';
import {useAuthStore} from '@/stores/authStore';
import {formatFullDate, toLocalDate} from '@/utils/formatDate';
import {getHijriDateLabel} from '@/utils/hijriDate';
import {
  colors,
  spacing,
  radius,
  shadows,
  fontWeight,
  fontSize,
  lineHeight,
} from '@/theme';
import type {
  RootStackNavigationProp,
  RootStackParamList,
} from '@/types/navigation';
import type {Amalan, AmalanPayload, AmalanSheetMode} from '@/types/amalan';

// Tiga cukup untuk mengisi layar terkecil yang didukung tanpa perlu diukur.
const SKELETON_KEYS = ['a', 'b', 'c'];

export default function AmalanHomeScreen(): React.JSX.Element {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'AmalanHome'>>();
  const isAuthenticated = useAuthStore(s => s.accessToken != null);
  const userName = useAuthStore(s => s.user?.name);

  const {
    selectedDate,
    summaries,
    summary,
    items,
    presets,
    isPresetsError,
    isLoading,
    isDayLoading,
    isRefreshing,
    isDeleting,
    summaryRange,
    selectDate,
    syncToday,
    toggleComplete,
    removeAmalan,
    retryPresets,
    refresh,
  } = useAmalanHome(isAuthenticated, resolveInitialDate(route.params?.date));

  const {isSubmitting, fieldErrors, save, clearFieldErrors} =
    useAmalanForm(summaryRange);

  const [sheetMode, setSheetMode] = useState<AmalanSheetMode | null>(null);
  const [actionTarget, setActionTarget] = useState<Amalan | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Amalan | null>(null);
  // Sheet aksi harus tertutup DULU sebelum sheet form naik — dua sheet
  // bertumpuk menghasilkan backdrop ganda dan "Batal" yang cuma menutup
  // separuhnya. Niat disimpan di sini, dijalankan di onClose sheet aksi.
  const [pendingEdit, setPendingEdit] = useState<Amalan | null>(null);

  // Tanggal disegarkan saat screen di-focus, bukan lewat timer: memindahkan
  // hari di bawah jari pengguna yang sedang mencatat lebih buruk daripada label
  // tanggal yang telat semenit.
  useFocusEffect(
    useCallback(() => {
      syncToday();
    }, [syncToday]),
  );

  const dateObject = toLocalDate(selectedDate);

  function handleBack(): void {
    navigation.goBack();
  }

  function goToLogin(): void {
    navigation.navigate('Login', {
      redirectTo: {screen: 'AmalanHome', params: undefined},
    });
  }

  function handlePressRegister(): void {
    navigation.navigate('Register');
  }

  function handleOpenCreate(): void {
    clearFieldErrors();
    setSheetMode({type: 'create'});
  }

  function handlePressActions(amalan: Amalan): void {
    setActionTarget(amalan);
  }

  function handleEdit(): void {
    setPendingEdit(actionTarget);
    setActionTarget(null);
  }

  function handleDelete(): void {
    setDeleteTarget(actionTarget);
    setActionTarget(null);
  }

  function handleActionSheetClosed(): void {
    setActionTarget(null);
    if (pendingEdit) {
      clearFieldErrors();
      setSheetMode({type: 'edit', amalan: pendingEdit});
      setPendingEdit(null);
    }
  }

  async function handleConfirmDelete(): Promise<void> {
    if (!deleteTarget) {
      return;
    }
    const target = deleteTarget;
    await removeAmalan(target);
    setDeleteTarget(null);
  }

  async function handleSubmit(payload: AmalanPayload): Promise<void> {
    const editingId = sheetMode?.type === 'edit' ? sheetMode.amalan.id : undefined;
    const result = await save(payload, editingId);
    // 'invalid' menahan sheet tetap terbuka supaya isian pengguna tidak hilang
    // dan error inline-nya terbaca. 'missing' berarti amalannya sudah tidak ada
    // — tidak ada yang bisa diperbaiki di form, jadi sheet ikut ditutup.
    if (result !== 'invalid') {
      setSheetMode(null);
    }
  }

  function renderAuthGate(): React.JSX.Element {
    return (
      <View style={styles.authGateWrapper}>
        <LinearGradient
          colors={[colors.primary[200], colors.primary[50], colors.neutral[0]]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.authGateGradient}
        />
        <FloatingOrbs />
        <View style={styles.authGateCard}>
          <View style={styles.authGateIconWrapper}>
            <Icon
              icon={ChecklistMinimalistic}
              size={40}
              color={colors.primary[500]}
            />
          </View>
          <Text style={styles.authGateTitle}>Masuk untuk Mencatat Amalan</Text>
          <Text style={styles.authGateSubtitle}>
            Catatan amalanmu tersimpan di akunmu dan hanya bisa kamu lihat.
          </Text>
          <View style={styles.authGateButtonWrapper}>
            <Button label="Masuk Sekarang" onPress={goToLogin} />
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
    );
  }

  function renderHeaderBand(): React.JSX.Element {
    return (
      <View style={styles.band}>
        {/* Gradient dan orbs mengisi seluruh band, termasuk area di belakang
            header dan status bar — HeaderTransparent tidak punya background
            sendiri, jadi efeknya terlihat utuh dari tepi atas layar. */}
        <LinearGradient
          colors={[colors.primary[200], colors.primary[50], colors.neutral[0]]}
          start={{x: 0, y: 0}}
          end={{x: 0, y: 1}}
          style={styles.bandGradient}
        />
        <FloatingOrbs />
        <HeaderTransparent onBack={handleBack} tone="dark" />
        <View style={styles.bandContent}>
          <Text style={styles.greeting}>Assalamualaikum,</Text>
          <Text style={styles.userName} numberOfLines={1} ellipsizeMode="tail">
            {userName?.trim() ? userName : 'Sahabat'}
          </Text>
          <Text style={styles.dateLabel}>
            {formatFullDate(dateObject.toISOString())}
          </Text>
          <Text style={styles.hijriLabel}>{getHijriDateLabel(dateObject)}</Text>

          <View style={styles.stripWrapper}>
            <AmalanDateStrip
              summaries={summaries}
              selectedDate={selectedDate}
              onSelectDate={selectDate}
            />
          </View>
        </View>
      </View>
    );
  }

  // `isSkeleton` cuma dipakai saat pemuatan awal: kartu progres diganti kotak
  // kosong. Merender kartu asli dengan ringkasan default akan menampilkan
  // "Belum ada amalan yang dicatat" — klaim yang belum tentu benar karena
  // datanya memang belum datang.
  function renderListHeader(isSkeleton = false): React.JSX.Element {
    return (
      <View style={styles.listHeader}>
        {isSkeleton ? (
          <View style={styles.progressSkeleton} />
        ) : (
          <AmalanProgressCard summary={summary} />
        )}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Amalan Hari Ini</Text>
          {/* <Button
            label="Tambah"
            variant="ghost"
            size="xs"
            onPress={handleOpenCreate}
          /> */}
        </View>
      </View>
    );
  }

  function renderSkeletonList(): React.JSX.Element {
    return (
      <View style={styles.listContent}>
        {renderListHeader(true)}
        {SKELETON_KEYS.map(key => (
          <AmalanRowSkeleton key={key} />
        ))}
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <HeaderLight
          title="Amalan Harian"
          onBack={handleBack}
        />
        {renderAuthGate()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tidak ada HeaderLight di sini: header-nya sudah menyatu di dalam band
          (HeaderTransparent) supaya gradient tidak terpotong kotak putih.
          Judul screen sengaja tidak dirender dua kali — sapaan di band sudah
          jadi judul halaman, mengikuti design ss-1. */}
      {renderHeaderBand()}

      {isLoading ? (
        renderSkeletonList()
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            items.length === 0 ? styles.listContentEmpty : null,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              tintColor={colors.primary[500]}
              colors={[colors.primary[500]]}
            />
          }
          ListHeaderComponent={renderListHeader()}
          renderItem={({item, index}) => (
            <AmalanRow
              amalan={item}
              presets={presets}
              isLast={index === items.length - 1}
              onToggle={toggleComplete}
              onPressActions={handlePressActions}
            />
          )}
          // Daftar lama sengaja tidak dikosongkan saat tanggal berganti
          // (keepPreviousData di useAmalanHome), jadi empty state hanya
          // ditampilkan setelah data tanggal itu benar-benar datang.
          ListEmptyComponent={
            isDayLoading ? null : (
              <EmptyState
                icon={ChecklistMinimalistic}
                title="Belum Ada Amalan"
                description="Catat amalan pertamamu hari ini."
              />
            )
          }
        />
      )}

      {/* Tombol di footer, bukan FAB melayang: FAB menutupi baris terakhir dan
          ikut menghalangi konten saat daftar panjang. */}
      <SafeAreaFooter>
        <Button
          label="Tambah Amalan"
          icon={AddCircle}
          onPress={handleOpenCreate}
        />
      </SafeAreaFooter>

      <AmalanActionSheet
        isOpen={actionTarget != null}
        amalanTitle={actionTarget?.title ?? ''}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onClose={handleActionSheetClosed}
      />

      <AmalanFormSheet
        isOpen={sheetMode != null}
        mode={sheetMode}
        date={selectedDate}
        presets={presets}
        isPresetsError={isPresetsError}
        onRetryPresets={retryPresets}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        fieldErrors={fieldErrors}
        onClose={() => setSheetMode(null)}
      />

      <QuranConfirmDialog
        visible={deleteTarget != null}
        title="Hapus Amalan?"
        description="Amalan ini akan dihapus dari catatan hari ini."
        confirmLabel="Hapus"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  band: {
    overflow: 'hidden',
  },
  bandGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bandContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: 2,
  },
  // Sapaan, nama, dan tanggal semuanya warna primary. Dipakai tingkat 700–800,
  // bukan primary[500], karena teal 500 di atas latar terang cuma ~2.4:1 —
  // di bawah ambang keterbacaan teks (4.5:1).
  greeting: {
    fontWeight: fontWeight.medium,
    fontSize: fontSize.md,
    color: colors.primary[700],
  },
  userName: {
    fontWeight: fontWeight.bold,
    fontSize: fontSize.xl,
    color: colors.primary[800],
  },
  dateLabel: {
    fontWeight: fontWeight.medium,
    fontSize: fontSize.sm,
    color: colors.primary[700],
    marginTop: spacing.sm,
  },
  hijriLabel: {
    fontWeight: fontWeight.regular,
    fontSize: fontSize.sm,
    color: colors.primary[700],
  },
  stripWrapper: {
    marginTop: spacing.lg,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    // TANPA `gap`: jarak antar baris datang dari paddingBottom di dalam
    // AmalanRow, supaya garis timeline vertikalnya menyambung dari satu baris
    // ke baris berikutnya. `gap` di sini memutus garis itu tiap 12px.
    // Tombol tambah sekarang di footer (di luar list), jadi tidak perlu lagi
    // ruang ekstra supaya baris terakhir tidak tertutup.
    paddingBottom: spacing.lg,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  listHeader: {
    gap: spacing.lg,
    // Menggantikan `gap` yang dilepas dari listContent — hanya di antara header
    // dan baris pertama, bukan di antar baris.
    paddingBottom: spacing.lg,
  },
  progressSkeleton: {
    // Setinggi AmalanProgressCard (padding lg x2 + ring 88) supaya daftar tidak
    // melompat saat data datang.
    height: 120,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[200],
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontWeight: fontWeight.bold,
    fontSize: fontSize.lg,
    color: colors.neutral[900],
  },
  authGateWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    overflow: 'hidden',
  },
  authGateGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    fontWeight: fontWeight.bold,
    fontSize: fontSize.xl,
    color: colors.neutral[900],
    textAlign: 'center',
  },
  authGateSubtitle: {
    fontWeight: fontWeight.regular,
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
    fontWeight: fontWeight.regular,
    fontSize: fontSize.sm,
    color: colors.neutral[600],
  },
  authGateRegisterLink: {
    fontWeight: fontWeight.semiBold,
    color: colors.primary[600],
  },
});
