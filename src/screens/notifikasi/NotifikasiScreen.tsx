import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {Icon} from '@/components/ui/Icon';
import {MenuDots, BellOff, Bell} from '@solar-icons/react-native/Linear';
import {HeaderLight} from '@/components/shared/HeaderLight';
import {FloatingOrbs} from '@/components/shared/FloatingOrbs';
import {Button} from '@/components/ui/Button';
import type {RootStackNavigationProp} from '@/types/navigation';
import {useNotifications} from '@/hooks/useNotifications';
import {NotifFilterChip} from '@/components/shared/NotifFilterChip';
import {NotifItem} from '@/components/shared/NotifItem';
import {EmptyState} from '@/components/ui/EmptyState';
import {useAuthStore} from '@/stores/authStore';
import {
  colors,
  spacing,
  radius,
  shadows,
  fontSize,
  fontWeight,
  lineHeight,
} from '@/theme';
import type {Notification, NotificationFilter} from '@/types/notification';

const FILTERS: {value: NotificationFilter; label: string}[] = [
  {value: 'all', label: 'Semua'},
  {value: 'news', label: 'Berita'},
  {value: 'donation', label: 'Donasi'},
];

const EMPTY_MESSAGE: Record<NotificationFilter, string> = {
  all: 'Belum ada notifikasi',
  news: 'Tidak ada notifikasi berita',
  donation: 'Tidak ada notifikasi donasi',
};

export default function NotifikasiScreen(): React.JSX.Element {
  const navigation = useNavigation<RootStackNavigationProp>();
  const isAuthenticated = useAuthStore(s => s.accessToken != null);
  const {
    notifications,
    activeFilter,
    isLoading,
    isRefreshing,
    isLoadingMore,
    changeFilter,
    refresh,
    loadMore,
    markAsRead,
    markAllAsRead,
  } = useNotifications(isAuthenticated);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  function handlePressLogin(): void {
    navigation.navigate('Login', {redirectTo: {screen: 'Notifikasi', params: undefined}});
  }

  function handlePressRegister(): void {
    navigation.navigate('Register');
  }

  async function handlePressItem(notification: Notification): Promise<void> {
    await markAsRead(notification.id);

    if (!notification.targetId) {
      return;
    }

    switch (notification.targetType) {
      case 'program':
        navigation.navigate('DetailProgram', {
          link: notification.targetId,
        });
        break;
      case 'article':
        navigation.navigate('NewsDetail', {articleId: notification.targetId});
        break;
      case 'donation':
        navigation.navigate('Tracking', {donationId: notification.targetId});
        break;
      default:
        break;
    }
  }

  async function handleMarkAllAsRead(): Promise<void> {
    setIsMenuVisible(false);
    await markAllAsRead();
  }

  return (
    <View style={styles.root}>
      <HeaderLight
        title="Notifikasi"
        onBack={() => navigation.goBack()}
        rightSlot={
          isAuthenticated ? (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setIsMenuVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="Menu notifikasi">
              <Icon icon={MenuDots} size={24} color={colors.neutral[900]} />
            </TouchableOpacity>
          ) : undefined
        }
      />

      {isAuthenticated ? (
        <View style={styles.filterRow}>
          {FILTERS.map(filter => (
            <NotifFilterChip
              key={filter.value}
              label={filter.label}
              active={activeFilter === filter.value}
              onPress={() => changeFilter(filter.value)}
            />
          ))}
        </View>
      ) : null}

      {!isAuthenticated ? (
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
              <Icon icon={Bell} size={40} color={colors.primary[500]} />
            </View>
            <Text style={styles.authGateTitle}>Jangan Sampai Ketinggalan</Text>
            <Text style={styles.authGateSubtitle}>
              Masuk untuk melihat info donasi dan berita terbaru dari lembaga.
            </Text>
            <View style={styles.authGateButtonWrapper}>
              <Button label="Masuk Sekarang" onPress={handlePressLogin} />
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
      ) : isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary[500]} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({item}) => (
            <NotifItem
              notification={item}
              onPress={() => handlePressItem(item)}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={refresh} />
          }
          onEndReachedThreshold={0.4}
          onEndReached={loadMore}
          ListEmptyComponent={
            <EmptyState icon={BellOff} title={EMPTY_MESSAGE[activeFilter]} />
          }
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.footerLoading}>
                <ActivityIndicator color={colors.primary[500]} />
              </View>
            ) : null
          }
        />
      )}

      <Modal
        visible={isMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsMenuVisible(false)}>
        <Pressable
          style={styles.overlay}
          onPress={() => setIsMenuVisible(false)}>
          <View style={styles.menuCard}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleMarkAllAsRead}
              accessibilityRole="button"
              accessibilityLabel="Tandai semua sudah dibaca">
              <Text style={styles.menuItemText}>
                Tandai semua sudah dibaca
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.neutral[0],
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
    textAlign: 'center',
  },
  authGateSubtitle: {
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
    fontSize: fontSize.sm,
    color: colors.neutral[600],
  },
  authGateRegisterLink: {
    fontWeight: fontWeight.semiBold,
    color: colors.primary[600],
  },
  listContent: {
    flexGrow: 1,
  },
  footerLoading: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'flex-end',
  },
  menuCard: {
    marginTop: 56,
    marginRight: spacing.md,
    minWidth: 220,
    backgroundColor: colors.neutral[0],
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
    ...shadows.lg,
  },
  menuItem: {
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  menuItemText: {
    fontSize: fontSize.md,
    color: colors.neutral[900],
  },
});
