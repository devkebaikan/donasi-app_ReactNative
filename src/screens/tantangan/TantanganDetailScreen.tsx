import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import type {BottomSheetModal} from '@gorhom/bottom-sheet';
import {
  Logout,
  MenuDots,
  Pen,
  Share,
  UserPlus,
} from '@solar-icons/react-native/Linear';
import {
  BookBookmark,
  CheckCircle,
  ClockCircle,
  Flag2,
  HandHeart,
  Ranking,
} from '@solar-icons/react-native/Bold';
import {HeaderLight} from '@/components/shared/HeaderLight';
import {HtmlContent} from '@/components/shared/HtmlContent';
import {ActionSheet} from '@/components/shared/ActionSheet';
import {QuranConfirmDialog} from '@/components/shared/QuranConfirmDialog';
import {
  ShareBottomSheet,
  type ShareOption,
} from '@/components/shared/ShareBottomSheet';
import {DonasiBersamaContributionRowSkeleton} from '@/components/shared/DonasiBersamaContributionRowSkeleton';
import {TantanganProgressCard} from '@/components/shared/TantanganProgressCard';
import {TantanganLeaderboardRow} from '@/components/shared/TantanganLeaderboardRow';
import {Button} from '@/components/ui/Button';
import {Icon, type SolarIconComponent} from '@/components/ui/Icon';
import {SafeAreaFooter} from '@/components/ui/SafeAreaFooter';
import {EmptyState} from '@/components/ui/EmptyState';
import {useTantanganDetail} from '@/hooks/useTantanganDetail';
import {useTantanganLeaderboard} from '@/hooks/useTantanganLeaderboard';
import {useAuthStore} from '@/stores/authStore';
import {showToast} from '@/utils/toast';
import {colors, spacing, radius, fontSize, fontWeight, lineHeight} from '@/theme';
import type {
  RootStackNavigationProp,
  RootStackParamList,
} from '@/types/navigation';
import type {
  TantanganDetail,
  TantanganLeaderboardEntry,
} from '@/types/tantangan';

// Tautan berbagi tantangan — BUKAN tautan undangan ber-kode, yang punya
// screen sendiri (TantanganInvite) dan dirakit server.
const TANTANGAN_SHARE_BASE_URL = 'https://aksiberbagi.com/tantangan/';

const MENU_INVITE = 'invite';
const MENU_SHARE = 'share';
const MENU_EDIT = 'edit';
const MENU_LEAVE = 'leave';

const SKELETON_KEYS = ['a', 'b', 'c'];

const SHARE_OPTION_LABEL: Record<ShareOption, string> = {
  facebook: 'Facebook',
  twitter: 'Twitter',
  whatsapp: 'Whatsapp',
  'copy-url': 'Salin URL',
};

interface MainAction {
  label: string;
  icon: SolarIconComponent;
  isDisabled: boolean;
}

// Label, icon, dan tujuan tombol utama semuanya turunan dari `action` +
// `isJoined` + `status`. Dikumpulkan di satu fungsi supaya ketiganya tidak
// pernah berbeda pendapat.
function getMainAction(challenge: TantanganDetail): MainAction {
  if (challenge.status === 'ended') {
    return {label: 'Sudah Berakhir', icon: ClockCircle, isDisabled: true};
  }
  if (!challenge.isJoined) {
    return {label: 'Ikut Tantangan', icon: Flag2, isDisabled: false};
  }
  switch (challenge.action.type) {
    case 'quran':
      return {label: 'Mulai Baca Hari Ini', icon: BookBookmark, isDisabled: false};
    case 'donation':
    case 'donasiBersama':
      return {label: 'Sedekah Sekarang', icon: HandHeart, isDisabled: false};
    default:
      return {label: 'Catat Hari Ini', icon: CheckCircle, isDisabled: false};
  }
}

export default function TantanganDetailScreen(): React.JSX.Element {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'TantanganDetail'>>();
  const {challengeId} = route.params;
  const isAuthenticated = useAuthStore(s => s.accessToken != null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  // ShareBottomSheet dikendalikan lewat ref (present/dismiss), bukan prop
  // isOpen — kontraknya sudah begitu di seluruh screen yang memakainya.
  const shareSheetRef = useRef<BottomSheetModal>(null);
  const listRef = useRef<FlatList<TantanganLeaderboardEntry>>(null);

  const {
    challenge,
    isLoading,
    isRefreshing,
    isNotFound,
    isJoining,
    isLeaving,
    refresh,
    join,
    leave,
  } = useTantanganDetail(challengeId);

  const isGroup = challenge?.mode === 'group';
  const {entries, me, isLoading: isLoadingBoard, isLoadingMore, loadMore} =
    useTantanganLeaderboard(challengeId, {enabled: isGroup === true});

  function handleBack(): void {
    navigation.goBack();
  }

  function handleSelectMenu(value: string): void {
    setIsMenuOpen(false);
    if (!challenge) {
      return;
    }
    if (value === MENU_INVITE) {
      navigation.navigate('TantanganInvite', {
        challengeId: challenge.id,
        challengeName: challenge.name,
      });
      return;
    }
    if (value === MENU_SHARE) {
      shareSheetRef.current?.present();
      return;
    }
    if (value === MENU_EDIT) {
      navigation.navigate('TantanganCreate', {challengeId: challenge.id});
      return;
    }
    if (value === MENU_LEAVE) {
      setIsLeaveDialogOpen(true);
    }
  }

  function handleSelectShareOption(option: ShareOption): void {
    shareSheetRef.current?.dismiss();
    // "Salin URL" bisa benar-benar dikerjakan sekarang; opsi lain mengikuti
    // perilaku yang sudah ada di DetailProgramScreen.
    if (option === 'copy-url' && challenge) {
      Clipboard.setString(`${TANTANGAN_SHARE_BASE_URL}${challenge.id}`);
      showToast('Tautan tantangan disalin');
      return;
    }
    showToast(
      `Fitur berbagi ke ${SHARE_OPTION_LABEL[option]} akan segera hadir.`,
    );
  }

  // Belum ada screen daftar peserta terpisah — baris "Diikuti n orang"
  // menggulir ke papan kebaikan di screen yang sama. Lihat "Konfirmasi atau
  // Coret" di docs/08-features/tantangan-amal/README.md.
  function handlePressParticipants(): void {
    if (entries.length > 0) {
      listRef.current?.scrollToIndex({index: 0, animated: true});
      return;
    }
    listRef.current?.scrollToEnd({animated: true});
  }

  async function handleConfirmLeave(): Promise<void> {
    const left = await leave();
    if (!left) {
      // Dialog sengaja dibiarkan terbuka: gagal keluar bukan alasan untuk
      // memaksa pengguna membuka menu titik tiga lagi dari awal.
      return;
    }
    setIsLeaveDialogOpen(false);
    navigation.goBack();
  }

  async function handlePressMainAction(): Promise<void> {
    if (!challenge) {
      return;
    }
    if (!challenge.isJoined) {
      if (!isAuthenticated) {
        navigation.navigate('Login', {
          redirectTo: {screen: 'TantanganDetail', params: {challengeId}},
        });
        return;
      }
      await join();
      return;
    }
    switch (challenge.action.type) {
      case 'quran':
        navigation.navigate('QuranMyChallenge', {
          challengeId: challenge.action.quranChallengeId,
        });
        return;
      case 'donation':
        navigation.navigate('DetailProgram', {link: challenge.action.programId});
        return;
      case 'donasiBersama':
        navigation.navigate('DonasiBersamaDetail', {
          groupId: challenge.action.groupId,
        });
        return;
      default:
        navigation.navigate('TantanganJurnal');
    }
  }

  function renderCover(item: TantanganDetail): React.JSX.Element {
    const ribbonLabel =
      item.status === 'ended'
        ? 'Sudah berakhir'
        : `Berakhir dalam ${item.daysLeft} hari`;
    return (
      <View style={styles.cover}>
        {/* Sampul kosong diisi blok warna + icon, bukan ruang kosong yang
            terlihat seperti gambar gagal dimuat. */}
        {item.coverImageUrl ? (
          <Image
            source={{uri: item.coverImageUrl}}
            style={styles.coverImage}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
        ) : (
          <View style={styles.coverFallback}>
            <Icon icon={Flag2} size={48} color={colors.primary[600]} />
          </View>
        )}
        <View style={styles.ribbon}>
          <Icon icon={ClockCircle} size={12} color={colors.neutral[0]} />
          <Text style={styles.ribbonText}>{ribbonLabel}</Text>
        </View>
      </View>
    );
  }

  function renderHeader(): React.JSX.Element | null {
    if (!challenge) {
      return null;
    }
    return (
      <View style={styles.headerBlock}>
        {renderCover(challenge)}

        <Text style={styles.title}>{challenge.name}</Text>

        {/* Deskripsi kosong tidak dirender sama sekali — HtmlContent dengan
            string kosong menyisakan kotak yang tidak jelas maksudnya. */}
        {challenge.descriptionHtml.trim() ? (
          <HtmlContent html={challenge.descriptionHtml} />
        ) : null}

        <TantanganProgressCard
          challenge={challenge}
          onPressParticipants={handlePressParticipants}
        />

        {isGroup ? (
          <Text style={styles.sectionTitle}>Papan Kebaikan</Text>
        ) : null}

        {isGroup && isLoadingBoard
          ? SKELETON_KEYS.map(key => (
              <View key={key} style={styles.skeletonWrapper}>
                <DonasiBersamaContributionRowSkeleton />
              </View>
            ))
          : null}
      </View>
    );
  }

  function renderFooter(): React.JSX.Element | null {
    if (isLoadingMore) {
      return (
        <ActivityIndicator
          style={styles.footerLoading}
          color={colors.primary[500]}
        />
      );
    }
    // Baris sendiri selalu ikut tampil meski peringkatnya jauh di luar halaman
    // yang sudah dimuat — justru baris itu yang paling ingin dilihat.
    if (me) {
      return (
        <View style={styles.itemWrapper}>
          <TantanganLeaderboardRow entry={me} />
        </View>
      );
    }
    return null;
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <HeaderLight title="Detail Tantangan" onBack={handleBack} />
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary[500]} />
        </View>
      </View>
    );
  }

  if (isNotFound || !challenge) {
    return (
      <View style={styles.container}>
        <HeaderLight title="Detail Tantangan" onBack={handleBack} />
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>Tantangan Tidak Ditemukan</Text>
          <Text style={styles.errorDescription}>
            Tantangan ini mungkin sudah dihapus atau bersifat tertutup.
          </Text>
          <Button label="Kembali" onPress={handleBack} />
        </View>
      </View>
    );
  }

  const mainAction = getMainAction(challenge);

  return (
    <View style={styles.container}>
      <HeaderLight
        title="Detail Tantangan"
        onBack={handleBack}
        rightSlot={
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setIsMenuOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Menu tantangan">
            <Icon icon={MenuDots} size={22} color={colors.neutral[900]} />
          </TouchableOpacity>
        }
      />

      {/* Satu FlatList untuk seluruh screen: sampul, judul, deskripsi, dan
          kartu progres hidup di ListHeaderComponent. FlatList di dalam
          ScrollView menghasilkan peringatan VirtualizedLists nested dan
          infinite scroll yang tidak pernah terpicu. */}
      <FlatList
        ref={listRef}
        data={isGroup && !isLoadingBoard ? entries : []}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        onEndReachedThreshold={0.4}
        onEndReached={loadMore}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={colors.primary[500]}
            colors={[colors.primary[500]]}
          />
        }
        ListHeaderComponent={renderHeader()}
        renderItem={({item}) => (
          <View style={styles.itemWrapper}>
            <TantanganLeaderboardRow entry={item} />
          </View>
        )}
        ListEmptyComponent={
          isGroup && !isLoadingBoard && !me ? (
            <View style={styles.itemWrapper}>
              <EmptyState
                icon={Ranking}
                title="Belum Ada Kontribusi"
                description="Jadilah yang pertama mencatat kebaikan."
              />
            </View>
          ) : null
        }
        ListFooterComponent={renderFooter()}
      />

      <SafeAreaFooter>
        <Button
          label={mainAction.label}
          icon={mainAction.icon}
          onPress={handlePressMainAction}
          isLoading={isJoining}
          isDisabled={mainAction.isDisabled || isJoining}
        />
      </SafeAreaFooter>

      <ActionSheet
        isOpen={isMenuOpen}
        title="Menu Tantangan"
        actions={[
          // Mengajak orang cuma masuk akal untuk tantangan berjamaah yang
          // sudah diikuti — tantangan personal tidak punya pintu ke sana.
          ...(challenge.mode === 'group' && challenge.isJoined
            ? [{value: MENU_INVITE, label: 'Ajak Teman', icon: UserPlus}]
            : []),
          {value: MENU_SHARE, label: 'Bagikan', icon: Share},
          ...(challenge.isCreator
            ? [{value: MENU_EDIT, label: 'Ubah Tantangan', icon: Pen}]
            : []),
          // Pembuat tidak bisa keluar dari tantangannya sendiri — itemnya
          // disembunyikan, bukan dinonaktifkan.
          ...(challenge.isJoined && !challenge.isCreator
            ? [
                {
                  value: MENU_LEAVE,
                  label: 'Keluar dari Tantangan',
                  icon: Logout,
                  tone: 'danger' as const,
                },
              ]
            : []),
        ]}
        onSelect={handleSelectMenu}
        onClose={() => setIsMenuOpen(false)}
      />

      <ShareBottomSheet
        ref={shareSheetRef}
        title="Bagikan Tantangan"
        onSelectOption={handleSelectShareOption}
      />

      <QuranConfirmDialog
        visible={isLeaveDialogOpen}
        title="Keluar dari Tantangan?"
        description="Progres yang sudah kamu catat akan hilang dari papan kebaikan."
        confirmLabel="Keluar"
        isLoading={isLeaving}
        onConfirm={handleConfirmLeave}
        onCancel={() => setIsLeaveDialogOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
  },
  errorTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  errorDescription: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  menuButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBlock: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  cover: {
    aspectRatio: 16 / 10,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.primary[100],
    justifyContent: 'flex-end',
  },
  coverImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  coverFallback: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ribbon: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    margin: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  ribbonText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[0],
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.primary[700],
    lineHeight: fontSize['2xl'] * lineHeight.tight,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
    marginTop: spacing.sm,
  },
  skeletonWrapper: {
    marginBottom: spacing.sm,
  },
  listContent: {
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  itemWrapper: {
    paddingHorizontal: spacing.md,
  },
  footerLoading: {
    paddingTop: spacing.md,
  },
});
