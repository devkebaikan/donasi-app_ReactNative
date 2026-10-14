import React, {useState} from 'react';
import {View, FlatList, RefreshControl, StyleSheet} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import {Layers} from '@solar-icons/react-native/Linear';
import {AddCircle} from '@solar-icons/react-native/Bold';
import {HeaderLight} from '@/components/shared/HeaderLight';
import {DonasiBersamaBatchRow} from '@/components/shared/DonasiBersamaBatchRow';
import {DonasiBersamaBatchFormSheet} from '@/components/shared/DonasiBersamaBatchFormSheet';
import {DonasiBersamaBatchActions} from '@/components/shared/DonasiBersamaBatchActions';
import {Button} from '@/components/ui/Button';
import {EmptyState} from '@/components/ui/EmptyState';
import {SafeAreaFooter} from '@/components/ui/SafeAreaFooter';
import {useDonasiBersamaBatches} from '@/hooks/useDonasiBersamaBatches';
import {useSettingStore} from '@/stores/settingStore';
import {formatCurrency} from '@/utils/formatCurrency';
import {colors, spacing} from '@/theme';
import type {
  RootStackNavigationProp,
  RootStackParamList,
} from '@/types/navigation';
import type {DonasiBersamaBatch} from '@/types/donasiBersama';

export default function DonasiBersamaBatchesScreen(): React.JSX.Element {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'DonasiBersamaBatches'>>();
  const {groupId, isCreator} = route.params;

  const isHideNominal = useSettingStore(s => s.isHideNominal);
  const [menuBatch, setMenuBatch] = useState<DonasiBersamaBatch | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const {
    batches,
    isLoading,
    isRefreshing,
    isMutating,
    fieldErrors,
    refresh,
    createBatch,
    clearFieldErrors,
  } = useDonasiBersamaBatches(groupId);

  function handleOpenBatch(batch: DonasiBersamaBatch): void {
    navigation.navigate('DonasiBersamaBatchContributions', {
      groupId,
      batchId: batch.id,
      batchLabel: batch.label,
      isCreator,
    });
  }

  async function handleCreate(label: string): Promise<void> {
    if (await createBatch(label)) {
      closeCreate();
    }
  }

  function closeCreate(): void {
    setIsCreateOpen(false);
    clearFieldErrors();
  }

  return (
    <View style={styles.container}>
      <HeaderLight
        title="Daftar Batch"
        onBack={() => navigation.goBack()}
      />

      <FlatList
        data={batches}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          batches.length === 0 ? styles.listContentEmpty : null,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={colors.primary[500]}
            colors={[colors.primary[500]]}
          />
        }
        renderItem={({item}) => (
          <DonasiBersamaBatchRow
            batch={item}
            amountLabel={
              isHideNominal ? 'Rp ***' : formatCurrency(item.collectedAmount)
            }
            canManage={isCreator}
            onPress={handleOpenBatch}
            onPressMenu={setMenuBatch}
          />
        )}
        ListEmptyComponent={
          isLoading ? null : (
            <EmptyState
              icon={Layers}
              title="Belum Ada Batch"
              description="Buat batch pertama untuk mulai mengumpulkan urunan."
            />
          )
        }
      />

      {/* Hanya kreator yang bisa mengelola batch. Server juga menolak
          permintaan dari non-kreator, jadi ini bukan satu-satunya penjaga. */}
      {isCreator ? (
        <SafeAreaFooter>
          <Button
            label="Tambah Batch"
            icon={AddCircle}
            onPress={() => setIsCreateOpen(true)}
          />
        </SafeAreaFooter>
      ) : null}

      <DonasiBersamaBatchActions
        groupId={groupId}
        batch={menuBatch}
        onClose={() => setMenuBatch(null)}
      />

      <DonasiBersamaBatchFormSheet
        isOpen={isCreateOpen}
        mode="create"
        initialLabel=""
        isSubmitting={isMutating}
        error={fieldErrors.label}
        onSubmit={handleCreate}
        onClose={closeCreate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[0],
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
});
