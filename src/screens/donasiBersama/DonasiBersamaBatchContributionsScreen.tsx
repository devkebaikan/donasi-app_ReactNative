import React, {useState} from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import {WadOfMoney, MenuDots} from '@solar-icons/react-native/Linear';
import {HeaderLight} from '@/components/shared/HeaderLight';
import {DonasiBersamaContributionRow} from '@/components/shared/DonasiBersamaContributionRow';
import {DonasiBersamaContributionRowSkeleton} from '@/components/shared/DonasiBersamaContributionRowSkeleton';
import {DonasiBersamaBatchActions} from '@/components/shared/DonasiBersamaBatchActions';
import {EmptyState} from '@/components/ui/EmptyState';
import {Icon} from '@/components/ui/Icon';
import {useDonasiBersamaBatchContributions} from '@/hooks/useDonasiBersamaBatchContributions';
import {useDonasiBersamaBatches} from '@/hooks/useDonasiBersamaBatches';
import {useSettingStore} from '@/stores/settingStore';
import {formatCurrency} from '@/utils/formatCurrency';
import {colors, spacing} from '@/theme';
import type {
  RootStackNavigationProp,
  RootStackParamList,
} from '@/types/navigation';

const SKELETON_KEYS = ['a', 'b', 'c'];

export default function DonasiBersamaBatchContributionsScreen(): React.JSX.Element {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route =
    useRoute<RouteProp<RootStackParamList, 'DonasiBersamaBatchContributions'>>();
  const {groupId, batchId, batchLabel, isCreator} = route.params;

  const isHideNominal = useSettingStore(s => s.isHideNominal);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Batch diambil dari cache daftar batch (query key yang sama dengan screen
  // sebelumnya), bukan dari params — supaya status dan namanya ikut terbaru
  // setelah aksi dijalankan dari sini.
  const {batches} = useDonasiBersamaBatches(groupId);
  const batch = batches.find(item => item.id === batchId) ?? null;

  const {contributions, isLoading, isLoadingMore, loadMore} =
    useDonasiBersamaBatchContributions(groupId, batchId);

  const title = `Urunan ${batch?.label ?? batchLabel}`;

  return (
    <View style={styles.container}>
      <HeaderLight
        title={title}
        onBack={() => navigation.goBack()}
        rightSlot={
          isCreator ? (
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setIsMenuOpen(true)}
              accessibilityRole="button"
              accessibilityLabel={`Kelola ${batch?.label ?? batchLabel}`}>
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
              description={`Belum ada yang urun di ${batch?.label ?? batchLabel}.`}
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

      <DonasiBersamaBatchActions
        groupId={groupId}
        batch={isMenuOpen ? batch : null}
        onClose={() => setIsMenuOpen(false)}
        // Batch yang dihapus tidak punya halaman lagi — keluar ke daftar batch.
        onDeleted={() => navigation.goBack()}
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
