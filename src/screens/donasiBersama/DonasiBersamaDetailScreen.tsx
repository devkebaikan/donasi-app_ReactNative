import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {
  MenuDots,
  MapPoint,
  Link,
  UsersGroupRounded,
  UserPlus,
  Pen,
  Layers,
  History,
  Logout,
  WadOfMoney,
  DocumentText,
  UsersGroupTwoRounded,
} from '@solar-icons/react-native/Linear';
import {HeaderLight} from '@/components/shared/HeaderLight';
import {HtmlContent} from '@/components/shared/HtmlContent';
import {ActionSheet} from '@/components/shared/ActionSheet';
import {QuranConfirmDialog} from '@/components/shared/QuranConfirmDialog';
import {DonasiBersamaProgressCard} from '@/components/shared/DonasiBersamaProgressCard';
import {DonasiBersamaDetailTabBar} from '@/components/shared/DonasiBersamaDetailTabBar';
import {DonasiBersamaContributionRow} from '@/components/shared/DonasiBersamaContributionRow';
import {DonasiBersamaContributionRowSkeleton} from '@/components/shared/DonasiBersamaContributionRowSkeleton';
import {Button} from '@/components/ui/Button';
import {EmptyState} from '@/components/ui/EmptyState';
import {Icon} from '@/components/ui/Icon';
import {useDonasiBersamaDetail} from '@/hooks/useDonasiBersamaDetail';
import {useDonasiBersamaContributions} from '@/hooks/useDonasiBersamaContributions';
import {useAuthStore} from '@/stores/authStore';
import {useSettingStore} from '@/stores/settingStore';
import {formatCurrency} from '@/utils/formatCurrency';
import {formatDate} from '@/utils/formatDate';
import {showToast} from '@/utils/toast';
import {colors, spacing, radius, fontSize, fontWeight, lineHeight} from '@/theme';
import type {RootStackNavigationProp, RootStackParamList} from '@/types/navigation';
import type {DonasiBersamaDetailTab} from '@/types/donasiBersama';

const SKELETON_KEYS = ['a', 'b', 'c'];
const MENU_INVITE = 'invite';
const MENU_MY_CONTRIBUTIONS = 'my-contributions';
const MENU_BATCHES = 'batches';
const MENU_EDIT = 'edit';
const MENU_LEAVE = 'leave';

export default function DonasiBersamaDetailScreen(): React.JSX.Element {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'DonasiBersamaDetail'>>();
  const {groupId, initialTab} = route.params;

  const isAuthenticated = useAuthStore(s => s.accessToken != null);
  const isHideNominal = useSettingStore(s => s.isHideNominal);

  const [activeTab, setActiveTab] = useState<DonasiBersamaDetailTab>(
    initialTab ?? 'contributions',
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);

  const {
    group,
    isLoading,
    isRefreshing,
    isNotFound,
    isJoining,
    isLeaving,
    refresh,
    joinGroup,
    leaveGroup,
  } = useDonasiBersamaDetail(groupId);

  const {
    contributions,
    isLoading: isLoadingContributions,
    isLoadingMore,
    loadMore,
    refresh: refreshContributions,
  } = useDonasiBersamaContributions({
    groupId,
    enabled: activeTab === 'contributions',
  });

  function handleBack(): void {
    navigation.goBack();
  }

  // Tarik-untuk-segarkan menyegarkan keduanya: kartu progres dan riwayat
  // patungan sama-sama basi setelah ada urunan baru.
  async function handleRefresh(): Promise<void> {
    await Promise.all([refresh(), refreshContributions()]);
  }

  function requireLogin(): boolean {
    if (isAuthenticated) {
      return false;
    }
    navigation.navigate('Login', {
      redirectTo: {screen: 'DonasiBersamaDetail', params: {groupId}},
    });
    return true;
  }

  function goToInvite(): void {
    if (requireLogin() || !group) {
      return;
    }
    navigation.navigate('DonasiBersamaInvite', {
      groupId,
      groupName: group.name,
    });
  }

  async function handlePressPrimary(): Promise<void> {
    if (!group) {
      return;
    }
    if (!group.isMember) {
      if (requireLogin()) {
        return;
      }
      await joinGroup();
      return;
    }
    navigation.navigate('DonasiBersamaUrun', {
      groupId,
      groupName: group.name,
      targetAmount: group.targetAmount,
      coverImageUrl: group.coverImageUrl,
    });
  }

  function handleSelectMenu(value: string): void {
    setIsMenuOpen(false);
    if (value === MENU_INVITE) {
      goToInvite();
      return;
    }
    if (value === MENU_EDIT) {
      navigation.navigate('DonasiBersamaCreate', {groupId});
      return;
    }
    if (value === MENU_BATCHES) {
      navigation.navigate('DonasiBersamaBatches', {
        groupId,
        isCreator: group?.isCreator ?? false,
      });
      return;
    }
    if (value === MENU_MY_CONTRIBUTIONS) {
      navigation.navigate('DonasiBersamaMyContributions', {
        groupId,
        groupName: group?.name ?? '',
      });
      return;
    }
    setIsLeaveDialogOpen(true);
  }

  async function handleConfirmLeave(): Promise<void> {
    const left = await leaveGroup();
    if (!left) {
      return;
    }
    setIsLeaveDialogOpen(false);
    showToast('Kamu sudah keluar dari grup.');
    navigation.goBack();
  }

  if (isNotFound) {
    return (
      <View style={styles.container}>
        <HeaderLight title="Grup Donasi" onBack={handleBack} />
        <View style={styles.centered}>
          <EmptyState
            icon={UsersGroupTwoRounded}
            title="Grup Tidak Ditemukan"
            description="Grup ini tidak tersedia atau bersifat privat."
          />
          <Button label="Kembali" variant="ghost" onPress={handleBack} />
        </View>
      </View>
    );
  }

  if (isLoading || !group) {
    return (
      <View style={styles.container}>
        <HeaderLight title="Grup Donasi" onBack={handleBack} />
        <View style={styles.skeletonWrapper}>
          <View style={styles.coverSkeleton} />
          <View style={styles.cardSkeleton} />
        </View>
      </View>
    );
  }

  const isEnded = group.status === 'ended' || group.daysLeft <= 0;

  function renderHeader(): React.JSX.Element {
    if (!group) {
      return <View />;
    }
    return (
      <View style={styles.headerBlock}>
        <View style={styles.cover}>
          {group.coverImageUrl ? (
            <Image
              source={{uri: group.coverImageUrl}}
              style={styles.coverImage}
              resizeMode="cover"
              accessibilityRole="image"
              accessibilityLabel={`Foto grup ${group.name}`}
            />
          ) : (
            <View style={[styles.coverImage, styles.coverFallback]}>
              <Icon
                icon={UsersGroupTwoRounded}
                size={48}
                color={colors.primary[600]}
              />
            </View>
          )}

          {/* Wajib: judul putih di atas foto kiriman pengguna — terang atau
              gelapnya tidak bisa diasumsikan. */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.65)']}
            style={styles.coverGradient}
          />

          {group.batchLabel ? (
            <View style={styles.batchBadge}>
              <Text style={styles.batchText}>{group.batchLabel}</Text>
            </View>
          ) : null}

          <View style={styles.coverText}>
            <Text style={styles.coverTitle} numberOfLines={2}>
              {group.name}
            </Text>
            {group.location ? (
              <View style={styles.locationRow}>
                <Icon icon={MapPoint} size={14} color={colors.neutral[0]} />
                <Text style={styles.locationText} numberOfLines={1}>
                  {group.location}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <DonasiBersamaProgressCard group={group} />

        <View style={styles.actions}>
          <Button
            label={group.isMember ? 'Urun Sekarang' : 'Gabung Grup'}
            onPress={handlePressPrimary}
            isLoading={isJoining}
            isDisabled={group.isMember && isEnded}
          />
          {group.isMember && isEnded ? (
            <Text style={styles.endedNote}>
              {`Grup sudah berakhir pada ${formatDate(group.deadline)}.`}
            </Text>
          ) : null}
          {/* Keduanya di luar tab: kalau ditaruh di dalam "Tentang Grup",
              jalan menuju daftar anggota hilang begitu pengguna pindah tab. */}
          <View style={styles.secondaryRow}>
            <View style={styles.secondaryItem}>
              <Button
                label="Undang Teman"
                variant="secondary"
                icon={Link}
                onPress={goToInvite}
              />
            </View>
            <View style={styles.secondaryItem}>
              <Button
                label="Lihat Anggota"
                variant="secondary"
                icon={UsersGroupRounded}
                onPress={() =>
                  navigation.navigate('DonasiBersamaMembers', {
                    groupId,
                    isCreator: group.isCreator,
                  })
                }
              />
            </View>
          </View>
        </View>

        <DonasiBersamaDetailTabBar
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {activeTab === 'about' ? (
          <View style={styles.aboutBlock}>
            {group.about ? (
              <HtmlContent html={group.about} />
            ) : (
              <EmptyState
                icon={DocumentText}
                title="Belum Ada Keterangan"
                description="Kreator grup belum menuliskan tentang grup ini."
              />
            )}
          </View>
        ) : null}
      </View>
    );
  }

  function renderContributionsEmpty(): React.JSX.Element | null {
    if (activeTab !== 'contributions') {
      return null;
    }
    if (isLoadingContributions) {
      return (
        <View style={styles.listBlock}>
          {SKELETON_KEYS.map(key => (
            <DonasiBersamaContributionRowSkeleton key={key} />
          ))}
        </View>
      );
    }
    return (
      <View style={styles.listBlock}>
        <EmptyState
          icon={WadOfMoney}
          title="Belum Ada Urunan"
          description="Jadilah yang pertama urun di grup ini."
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderLight
        title="Grup Donasi"
        onBack={handleBack}
        rightSlot={
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setIsMenuOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Menu grup">
            <Icon icon={MenuDots} size={22} color={colors.neutral[900]} />
          </TouchableOpacity>
        }
      />

      <FlatList
        data={activeTab === 'contributions' ? contributions : []}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        onEndReachedThreshold={0.4}
        onEndReached={loadMore}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary[500]}
            colors={[colors.primary[500]]}
          />
        }
        ListHeaderComponent={renderHeader()}
        renderItem={({item}) => (
          <View style={styles.itemWrapper}>
            <DonasiBersamaContributionRow
              contribution={item}
              amountLabel={
                isHideNominal ? 'Rp ***' : formatCurrency(item.amount)
              }
            />
          </View>
        )}
        ListEmptyComponent={renderContributionsEmpty()}
        ListFooterComponent={
          isLoadingMore ? (
            <ActivityIndicator
              style={styles.footerLoading}
              color={colors.primary[500]}
            />
          ) : null
        }
      />

      <ActionSheet
        isOpen={isMenuOpen}
        title="Menu Grup"
        actions={[
          {value: MENU_INVITE, label: 'Undang Teman', icon: UserPlus},
          // Mengubah detail grup khusus kreator — server juga menolak yang lain.
          ...(group.isCreator
            ? [{value: MENU_EDIT, label: 'Ubah Detail Grup', icon: Pen}]
            : []),
          // Daftar batch terbuka untuk siapa saja yang bisa melihat grup —
          // isinya riwayat, bukan aksi. Mengelolanya tetap khusus kreator.
          {value: MENU_BATCHES, label: 'Daftar Batch', icon: Layers},
          // Riwayat urunan sendiri cuma masuk akal untuk anggota — yang belum
          // gabung memang belum pernah urun.
          ...(group.isMember
            ? [
                {
                  value: MENU_MY_CONTRIBUTIONS,
                  label: 'Riwayat Urun Saya',
                  icon: History,
                },
              ]
            : []),
          // Kreator tidak bisa keluar dari grupnya sendiri — itemnya
          // disembunyikan, bukan dinonaktifkan.
          ...(group.isMember && !group.isCreator
            ? [
                {
                  value: MENU_LEAVE,
                  label: 'Keluar dari Grup',
                  icon: Logout,
                  tone: 'danger' as const,
                },
              ]
            : []),
        ]}
        onSelect={handleSelectMenu}
        onClose={() => setIsMenuOpen(false)}
      />

      <QuranConfirmDialog
        visible={isLeaveDialogOpen}
        title="Keluar dari Grup?"
        description="Kamu tidak akan lagi menerima pengingat urunan dari grup ini. Urunan yang sudah kamu kirim tetap tercatat."
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
    backgroundColor: colors.neutral[0],
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  skeletonWrapper: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  coverSkeleton: {
    height: 200,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[200],
  },
  cardSkeleton: {
    height: 140,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[100],
  },
  menuButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBlock: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  cover: {
    height: 200,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.neutral[200],
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
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
  },
  batchBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.secondary[400],
  },
  batchText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.neutral[0],
    letterSpacing: 0.5,
  },
  coverText: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  coverTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.neutral[0],
    lineHeight: fontSize.xl * lineHeight.tight,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  locationText: {
    fontSize: fontSize.xs,
    color: colors.neutral[0],
  },
  actions: {
    gap: spacing.sm,
  },
  endedNote: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
    textAlign: 'center',
  },
  aboutBlock: {
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  // Pembungkus flex: Button tidak menerima prop style, jadi lebarnya diatur
  // dari luar supaya kedua tombol dapat porsi sama.
  secondaryItem: {
    flex: 1,
  },
  listContent: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  itemWrapper: {
    paddingHorizontal: spacing.lg,
  },
  listBlock: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  footerLoading: {
    paddingTop: spacing.md,
  },
});
