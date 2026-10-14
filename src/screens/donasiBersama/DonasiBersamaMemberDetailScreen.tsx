import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import {WadOfMoney, MenuDots, Logout} from '@solar-icons/react-native/Linear';
import {HeaderLight} from '@/components/shared/HeaderLight';
import {ActionSheet} from '@/components/shared/ActionSheet';
import {DonasiBersamaContributionRow} from '@/components/shared/DonasiBersamaContributionRow';
import {DonasiBersamaContributionRowSkeleton} from '@/components/shared/DonasiBersamaContributionRowSkeleton';
import {QuranConfirmDialog} from '@/components/shared/QuranConfirmDialog';
import {Avatar} from '@/components/ui/Avatar';
import {EmptyState} from '@/components/ui/EmptyState';
import {Icon} from '@/components/ui/Icon';
import {useDonasiBersamaMemberDetail} from '@/hooks/useDonasiBersamaMemberDetail';
import {useSettingStore} from '@/stores/settingStore';
import {formatCurrency} from '@/utils/formatCurrency';
import {colors, spacing, fontSize, fontWeight} from '@/theme';
import type {
  RootStackNavigationProp,
  RootStackParamList,
} from '@/types/navigation';

const SKELETON_KEYS = ['a', 'b', 'c'];
const ACTION_REMOVE = 'remove';

export default function DonasiBersamaMemberDetailScreen(): React.JSX.Element {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route =
    useRoute<RouteProp<RootStackParamList, 'DonasiBersamaMemberDetail'>>();
  const {groupId, memberId, memberName, avatarUrl, roleLabel, canRemove} =
    route.params;

  const isHideNominal = useSettingStore(s => s.isHideNominal);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const {
    contributions,
    isLoading,
    isLoadingMore,
    isRemoving,
    loadMore,
    removeMember,
  } = useDonasiBersamaMemberDetail(groupId, memberId);

  async function handleConfirmRemove(): Promise<void> {
    if (await removeMember()) {
      setIsConfirmOpen(false);
      // Anggota yang sudah dikeluarkan tidak punya halaman lagi.
      navigation.goBack();
    }
  }

  function renderHeader(): React.JSX.Element {
    return (
      <View style={styles.profile}>
        <Avatar uri={avatarUrl} name={memberName} size={64} />
        <Text style={styles.name} numberOfLines={1}>
          {memberName}
        </Text>
        <Text style={styles.role}>{roleLabel}</Text>
        <Text style={styles.sectionTitle}>Riwayat Urunan</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderLight
        title="Detail Anggota"
        onBack={() => navigation.goBack()}
        rightSlot={
          canRemove ? (
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setIsMenuOpen(true)}
              accessibilityRole="button"
              accessibilityLabel={`Kelola ${memberName}`}>
              <Icon icon={MenuDots} size={22} color={colors.neutral[900]} />
            </TouchableOpacity>
          ) : undefined
        }
      />

      {isLoading ? (
        <FlatList
          data={SKELETON_KEYS}
          keyExtractor={item => item}
          scrollEnabled={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderHeader()}
          renderItem={() => <DonasiBersamaContributionRowSkeleton />}
        />
      ) : (
        <FlatList
          data={contributions}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            contributions.length === 0 ? styles.listContentEmpty : null,
          ]}
          onEndReachedThreshold={0.4}
          onEndReached={loadMore}
          ListHeaderComponent={renderHeader()}
          renderItem={({item}) => (
            <DonasiBersamaContributionRow
              contribution={item}
              amountLabel={
                isHideNominal ? 'Rp ***' : formatCurrency(item.amount)
              }
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon={WadOfMoney}
              title="Belum Ada Urunan"
              description={`${memberName} belum pernah urun di grup ini.`}
            />
          }
          ListFooterComponent={
            isLoadingMore ? (
              <ActivityIndicator
                style={styles.footerLoading}
                color={colors.primary[500]}
              />
            ) : null
          }
        />
      )}

      <ActionSheet
        isOpen={isMenuOpen}
        title={memberName}
        actions={[
          {
            value: ACTION_REMOVE,
            label: 'Keluarkan dari Grup',
            icon: Logout,
            tone: 'danger',
          },
        ]}
        onSelect={() => {
          setIsMenuOpen(false);
          setIsConfirmOpen(true);
        }}
        onClose={() => setIsMenuOpen(false)}
      />

      <QuranConfirmDialog
        visible={isConfirmOpen}
        title="Keluarkan Anggota?"
        description={`${memberName} akan dikeluarkan dari grup dan tidak lagi menerima pengingat urunan.`}
        confirmLabel="Keluarkan"
        isLoading={isRemoving}
        onConfirm={handleConfirmRemove}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[0],
  },
  menuButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profile: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingBottom: spacing.md,
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
    marginTop: spacing.sm,
  },
  role: {
    fontSize: fontSize.sm,
    color: colors.primary[600],
  },
  sectionTitle: {
    alignSelf: 'flex-start',
    marginTop: spacing.lg,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  footerLoading: {
    paddingTop: spacing.md,
  },
});
