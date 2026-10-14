import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {Flag2, Notebook} from '@solar-icons/react-native/Bold';
import {HeaderLight} from '@/components/shared/HeaderLight';
import {FloatingOrbs} from '@/components/shared/FloatingOrbs';
import {AmalanRowSkeleton} from '@/components/shared/AmalanRowSkeleton';
import {TantanganDayStatusChips} from '@/components/shared/TantanganDayStatusChips';
import {TantanganJurnalRow} from '@/components/shared/TantanganJurnalRow';
import {TantanganValueSheet} from '@/components/shared/TantanganValueSheet';
import {Button} from '@/components/ui/Button';
import {EmptyState} from '@/components/ui/EmptyState';
import {Icon} from '@/components/ui/Icon';
import {
  resolveJurnalDate,
  useTantanganJurnal,
} from '@/hooks/useTantanganJurnal';
import {useAuthStore} from '@/stores/authStore';
import {formatFullDate, toLocalDate} from '@/utils/formatDate';
import {getHijriDateLabel} from '@/utils/hijriDate';
import {
  colors,
  spacing,
  radius,
  fontSize,
  fontWeight,
  lineHeight,
} from '@/theme';
import type {
  RootStackNavigationProp,
  RootStackParamList,
} from '@/types/navigation';
import type {TantanganJurnalItem} from '@/types/tantangan';

const SKELETON_KEYS = ['a', 'b', 'c'];

export default function TantanganJurnalScreen(): React.JSX.Element {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'TantanganJurnal'>>();
  const isAuthenticated = useAuthStore(s => s.accessToken != null);

  const [date] = useState(() => resolveJurnalDate(route.params?.date));
  const [valueSheetItem, setValueSheetItem] =
    useState<TantanganJurnalItem | null>(null);

  const {
    isToday,
    status,
    items,
    isLoading,
    isRefreshing,
    refresh,
    check,
    setDayStatus,
  } = useTantanganJurnal(isAuthenticated, date);

  const dateObject = toLocalDate(date);

  function handleBack(): void {
    navigation.goBack();
  }

  function handlePressLogin(): void {
    navigation.navigate('Login', {
      redirectTo: {screen: 'TantanganJurnal', params: undefined},
    });
  }

  function handlePressRegister(): void {
    navigation.navigate('Register');
  }

  function handlePressRow(item: TantanganJurnalItem): void {
    // Tantangan bacaan tidak pernah dicatat di sini — progresnya milik domain
    // Quran, jadi tidak ada request POST sama sekali dari baris ini.
    if (item.action.type === 'quran') {
      navigation.navigate('QuranMyChallenge', {
        challengeId: item.action.quranChallengeId,
      });
      return;
    }
    // Tanpa satuan, satu tap sudah cukup jadi jawaban. Dengan satuan, angkanya
    // yang jadi jawaban, jadi sheet-nya dibuka dulu.
    if (item.unit == null) {
      check(item, null);
      return;
    }
    setValueSheetItem(item);
  }

  function handlePressRowTitle(item: TantanganJurnalItem): void {
    navigation.navigate('TantanganDetail', {challengeId: item.challengeId});
  }

  function handleSaveValue(value: number): void {
    if (!valueSheetItem) {
      return;
    }
    check(valueSheetItem, value);
    setValueSheetItem(null);
  }

  function renderGreeting(): React.JSX.Element {
    return (
      <View style={styles.band}>
        <LinearGradient
          colors={[colors.primary[200], colors.primary[50], colors.neutral[0]]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.bandGradient}
        />
        <FloatingOrbs />

        <View style={styles.bandContent}>
          <Text style={styles.greeting}>ASSALAMUALAIKUM</Text>
          <Text style={styles.dateLabel}>
            {formatFullDate(dateObject.toISOString())}
          </Text>
          <Text style={styles.hijriLabel}>{getHijriDateLabel(dateObject)}</Text>
        </View>
      </View>
    );
  }

  function renderListHeader(): React.JSX.Element {
    return (
      <View>
        {renderGreeting()}
        <View style={styles.statusWrapper}>
          <TantanganDayStatusChips
            status={status}
            isLocked={!isToday}
            onChange={setDayStatus}
          />
        </View>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <HeaderLight title="Jurnal Kebaikan" onBack={handleBack} />
        <View style={styles.authGateWrapper}>
          <LinearGradient
            colors={[colors.primary[200], colors.primary[50], colors.neutral[0]]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.bandGradient}
          />
          <FloatingOrbs />
          <View style={styles.authGateCard}>
            <View style={styles.authGateIcon}>
              <Icon icon={Notebook} size={40} color={colors.primary[500]} />
            </View>
            <Text style={styles.authGateTitle}>Catat Kebaikanmu</Text>
            <Text style={styles.authGateSubtitle}>
              Masuk untuk mencatat progres tantangan dan menjaga runtun
              harianmu.
            </Text>
            <View style={styles.authGateButton}>
              <Button label="Masuk Sekarang" onPress={handlePressLogin} />
            </View>
            <Text
              style={styles.authGateRegister}
              onPress={handlePressRegister}
              accessibilityRole="button"
              accessibilityLabel="Belum punya akun? Daftar">
              Belum punya akun?{' '}
              <Text style={styles.authGateRegisterLink}>Daftar</Text>
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderLight title="Jurnal Kebaikan" onBack={handleBack} />

      {isLoading ? (
        <FlatList
          data={SKELETON_KEYS}
          keyExtractor={item => item}
          scrollEnabled={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderListHeader()}
          renderItem={() => (
            <View style={styles.itemWrapper}>
              <AmalanRowSkeleton />
            </View>
          )}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.challengeId}
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
          renderItem={({item}) => (
            <View style={styles.itemWrapper}>
              <TantanganJurnalRow
                item={item}
                isLocked={!isToday}
                onPress={handlePressRow}
                onPressTitle={handlePressRowTitle}
              />
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.itemWrapper}>
              <EmptyState
                icon={Flag2}
                title="Belum Ada Tantangan Aktif"
                description="Ikut satu tantangan dulu, jurnalnya muncul di sini."
              />
              <View style={styles.emptyButton}>
                <Button
                  label="Lihat Tantangan"
                  variant="secondary"
                  onPress={() => navigation.navigate('TantanganList')}
                />
              </View>
            </View>
          }
        />
      )}

      <TantanganValueSheet
        item={valueSheetItem}
        isSaving={false}
        onSave={handleSaveValue}
        onClose={() => setValueSheetItem(null)}
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
    paddingBottom: spacing.md,
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
    paddingTop: spacing.lg,
    gap: spacing.xs,
  },
  greeting: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semiBold,
    letterSpacing: 1,
    color: colors.primary[600],
  },
  dateLabel: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
    lineHeight: fontSize['2xl'] * lineHeight.tight,
  },
  hijriLabel: {
    fontSize: fontSize.sm,
    color: colors.neutral[600],
  },
  statusWrapper: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  listContent: {
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  itemWrapper: {
    paddingHorizontal: spacing.lg,
  },
  emptyButton: {
    paddingTop: spacing.md,
  },
  authGateWrapper: {
    flex: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  authGateCard: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[0],
  },
  authGateIcon: {
    width: 88,
    height: 88,
    borderRadius: radius.full,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  authGateTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.primary[800],
    textAlign: 'center',
  },
  authGateSubtitle: {
    fontSize: fontSize.sm,
    color: colors.neutral[600],
    textAlign: 'center',
    lineHeight: fontSize.sm * lineHeight.normal,
  },
  authGateButton: {
    alignSelf: 'stretch',
    paddingTop: spacing.sm,
  },
  authGateRegister: {
    fontSize: fontSize.sm,
    color: colors.neutral[600],
    paddingTop: spacing.sm,
  },
  authGateRegisterLink: {
    fontWeight: fontWeight.semiBold,
    color: colors.primary[600],
  },
});
