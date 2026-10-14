import React, {useState} from 'react';
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
import {useQueryClient} from '@tanstack/react-query';
import {UsersGroupRounded} from '@solar-icons/react-native/Linear';
import {UserPlus} from '@solar-icons/react-native/Bold';
import {NewsHeader} from '@/components/shared/NewsHeader';
import {DonasiBersamaMemberRow} from '@/components/shared/DonasiBersamaMemberRow';
import {DonasiBersamaMemberRowSkeleton} from '@/components/shared/DonasiBersamaMemberRowSkeleton';
import {Button} from '@/components/ui/Button';
import {EmptyState} from '@/components/ui/EmptyState';
import {SafeAreaFooter} from '@/components/ui/SafeAreaFooter';
import {useDonasiBersamaMembers} from '@/hooks/useDonasiBersamaMembers';
import {useAuthStore} from '@/stores/authStore';
import {queryKeys} from '@/utils/queryKeys';
import {colors, spacing, fontSize, fontWeight} from '@/theme';
import type {
  RootStackNavigationProp,
  RootStackParamList,
} from '@/types/navigation';
import type {
  DonasiBersamaDetail,
  DonasiBersamaMember,
} from '@/types/donasiBersama';

const SKELETON_KEYS = ['a', 'b', 'c', 'd', 'e'];

export default function DonasiBersamaMembersScreen(): React.JSX.Element {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'DonasiBersamaMembers'>>();
  const {groupId, isCreator} = route.params;

  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore(s => s.accessToken != null);
  const [isSearchActive, setIsSearchActive] = useState(false);

  const {
    members,
    total,
    searchInput,
    searchQuery,
    isLoading,
    isListLoading,
    isLoadingMore,
    isRefreshing,
    setSearchInput,
    submitSearch,
    clearSearch,
    loadMore,
    refresh,
  } = useDonasiBersamaMembers(groupId);

  function handleBack(): void {
    navigation.goBack();
  }

  // Field masih ada isinya → dikosongkan dulu; sudah kosong → tutup mode
  // search. Perilaku yang sama dengan menu Berita dan daftar grup.
  function handleClearSearch(): void {
    if (searchInput) {
      setSearchInput('');
      return;
    }
    setIsSearchActive(false);
    clearSearch();
  }

  function handlePressInvite(): void {
    if (!isAuthenticated) {
      navigation.navigate('Login', {
        redirectTo: {screen: 'DonasiBersamaDetail', params: {groupId}},
      });
      return;
    }
    // Nama grup diambil dari cache detail, bukan ditambahkan ke params screen
    // ini — pemanggil tidak perlu tahu nama grup.
    const detail = queryClient.getQueryData<DonasiBersamaDetail>(
      queryKeys.donasiBersama.detail(groupId),
    );
    navigation.navigate('DonasiBersamaInvite', {
      groupId,
      groupName: detail?.name ?? '',
    });
  }

  // canRemove dihitung di sini karena hanya screen ini yang tahu ketiganya
  // sekaligus: peran pembuka, peran target, dan riwayat urunan target.
  function handleOpenMember(member: DonasiBersamaMember): void {
    navigation.navigate('DonasiBersamaMemberDetail', {
      groupId,
      memberId: member.id,
      memberName: member.name,
      avatarUrl: member.avatarUrl,
      roleLabel: member.roleLabel,
      canRemove: isCreator && !member.isCreator && !member.hasContributed,
    });
  }

  function renderListHeader(): React.JSX.Element {
    return (
      <View style={styles.titleRow}>
        <Text style={styles.title}>Anggota Grup</Text>
        <Text style={styles.count}>{`${total} ANGGOTA`}</Text>
      </View>
    );
  }

  function renderEmpty(): React.JSX.Element {
    if (isListLoading) {
      return <View />;
    }
    return searchQuery ? (
      <EmptyState
        icon={UsersGroupRounded}
        title="Anggota Tidak Ditemukan"
        description={`Tidak ada anggota bernama "${searchQuery}".`}
      />
    ) : (
      <EmptyState
        icon={UsersGroupRounded}
        title="Belum Ada Anggota"
        description="Undang teman untuk mulai urun bersama."
      />
    );
  }

  return (
    <View style={styles.container}>
      <NewsHeader
        title="Anggota Grup"
        onBack={handleBack}
        isSearchActive={isSearchActive}
        searchInput={searchInput}
        onChangeSearchInput={setSearchInput}
        onPressSearchToggle={() => setIsSearchActive(true)}
        onSubmitSearch={submitSearch}
        onPressClear={handleClearSearch}
        placeholder="Cari anggota..."
      />

      {isLoading ? (
        <FlatList
          data={SKELETON_KEYS}
          keyExtractor={item => item}
          scrollEnabled={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderListHeader()}
          renderItem={() => <DonasiBersamaMemberRowSkeleton />}
        />
      ) : (
        <FlatList
          data={members}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            members.length === 0 ? styles.listContentEmpty : null,
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
          ListHeaderComponent={renderListHeader()}
          renderItem={({item}) => (
            <DonasiBersamaMemberRow member={item} onPress={handleOpenMember} />
          )}
          ListEmptyComponent={renderEmpty()}
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

      <SafeAreaFooter>
        <Button
          label="Undang Anggota Baru"
          icon={UserPlus}
          onPress={handlePressInvite}
        />
      </SafeAreaFooter>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[0],
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
  count: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semiBold,
    color: colors.primary[700],
    letterSpacing: 0.5,
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
