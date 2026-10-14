import React from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import {WadOfMoney, EyeClosed} from '@solar-icons/react-native/Linear';
import {HeaderLight} from '@/components/shared/HeaderLight';
import {DonasiBersamaContributionRowSkeleton} from '@/components/shared/DonasiBersamaContributionRowSkeleton';
import {EmptyState} from '@/components/ui/EmptyState';
import {Icon} from '@/components/ui/Icon';
import {useDonasiBersamaMyContributions} from '@/hooks/useDonasiBersamaMyContributions';
import {useSettingStore} from '@/stores/settingStore';
import {formatCurrency} from '@/utils/formatCurrency';
import {formatDateTime} from '@/utils/formatDate';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {
  RootStackNavigationProp,
  RootStackParamList,
} from '@/types/navigation';

const SKELETON_KEYS = ['a', 'b', 'c'];

export default function DonasiBersamaMyContributionsScreen(): React.JSX.Element {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route =
    useRoute<RouteProp<RootStackParamList, 'DonasiBersamaMyContributions'>>();
  const {groupId, groupName} = route.params;

  const isHideNominal = useSettingStore(s => s.isHideNominal);
  const {
    contributions,
    totalAmount,
    count,
    isLoading,
    isLoadingMore,
    isRefreshing,
    loadMore,
    refresh,
  } = useDonasiBersamaMyContributions(groupId);

  function maskAmount(amount: number): string {
    return isHideNominal ? 'Rp ***' : formatCurrency(amount);
  }

  function renderSummary(): React.JSX.Element {
    return (
      <View style={styles.summary}>
        <Text style={styles.summaryGroup} numberOfLines={1}>
          {groupName}
        </Text>
        <Text style={styles.summaryLabel}>Total Urunan Saya</Text>
        <Text style={styles.summaryAmount}>{maskAmount(totalAmount)}</Text>
        <Text style={styles.summaryCount}>
          {count > 0 ? `dari ${count} kali urun` : 'Belum ada urunan'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderLight
        title="Riwayat Urun Saya"
        onBack={() => navigation.goBack()}
      />

      {isLoading ? (
        <FlatList
          data={SKELETON_KEYS}
          keyExtractor={item => item}
          scrollEnabled={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderSummary()}
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
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              tintColor={colors.primary[500]}
              colors={[colors.primary[500]]}
            />
          }
          ListHeaderComponent={renderSummary()}
          renderItem={({item}) => (
            <View style={styles.row}>
              <View style={styles.rowBody}>
                <Text style={styles.rowAmount}>{maskAmount(item.amount)}</Text>
                <Text style={styles.rowTime}>
                  {formatDateTime(item.createdAt)}
                </Text>
              </View>
              {/* Penanda ini justru berguna di riwayat sendiri: di riwayat
                  publik urunan anonim tampil sebagai "Hamba Allah", jadi
                  pengguna perlu tahu yang mana miliknya. */}
              {item.isAnonymous ? (
                <View style={styles.anonBadge}>
                  <Icon
                    icon={EyeClosed}
                    size={12}
                    color={colors.neutral[600]}
                  />
                  <Text style={styles.anonText}>Anonim</Text>
                </View>
              ) : null}
            </View>
          )}
          ListEmptyComponent={
            <EmptyState
              icon={WadOfMoney}
              title="Belum Ada Urunan"
              description="Urunan kamu di grup ini akan tercatat di sini."
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[0],
  },
  summary: {
    gap: spacing.xs,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.primary[50],
  },
  summaryGroup: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.primary[700],
  },
  summaryLabel: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
  summaryAmount: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.primary[700],
  },
  summaryCount: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[50],
  },
  rowBody: {
    flex: 1,
    gap: spacing.xs,
  },
  rowAmount: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
  rowTime: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
  anonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[100],
  },
  anonText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.neutral[600],
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
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
