import React from 'react';
import {View, Text, TouchableOpacity, ActivityIndicator, StyleSheet} from 'react-native';
import {Wallet, CheckCircle} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import {formatCurrency} from '@/utils/formatCurrency';

interface DompetKebaikanListItemProps {
  isAuthenticated: boolean;
  balance: number | null;
  isLoadingBalance: boolean;
  isSelected: boolean;
  isInsufficient: boolean;
  amount: number;
  onPress: () => void;
  onPressLogin: () => void;
  onPressTopup: () => void;
}

export function DompetKebaikanListItem({
  isAuthenticated,
  balance,
  isLoadingBalance,
  isSelected,
  isInsufficient,
  amount,
  onPress,
  onPressLogin,
  onPressTopup,
}: DompetKebaikanListItemProps): React.JSX.Element {
  const isUnavailable = isAuthenticated && !isLoadingBalance && balance === null;
  const isDisabled = isUnavailable || isInsufficient;
  const shortfall = Math.max(0, amount - (balance ?? 0));

  function renderTrailing(): React.ReactNode {
    if (!isAuthenticated) {
      return (
        <TouchableOpacity
          testID="dompet-kebaikan-login-button"
          style={styles.actionButton}
          onPress={onPressLogin}
          accessibilityRole="button"
          accessibilityLabel="Login untuk pakai saldo Dompet Kebaikan">
          <Text style={styles.actionButtonText}>Login</Text>
        </TouchableOpacity>
      );
    }
    if (isInsufficient) {
      return (
        <TouchableOpacity
          testID="dompet-kebaikan-topup-button"
          style={styles.actionButton}
          onPress={onPressTopup}
          accessibilityRole="button"
          accessibilityLabel="Isi saldo Dompet Kebaikan">
          <Text style={styles.actionButtonText}>Top Up</Text>
        </TouchableOpacity>
      );
    }
    if (isSelected) {
      return <Icon icon={CheckCircle} size={22} color={colors.primary[500]} />;
    }
    return <View style={styles.radioEmpty} />;
  }

  function renderSubtitle(): React.ReactNode {
    if (!isAuthenticated) {
      return <Text style={styles.subtitleMuted}>Login untuk pakai saldo</Text>;
    }
    if (isLoadingBalance) {
      return (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={colors.neutral[400]} />
          <Text style={styles.subtitleMuted}>Memuat saldo...</Text>
        </View>
      );
    }
    if (isUnavailable) {
      return <Text style={styles.subtitleMuted}>Saldo tidak tersedia</Text>;
    }
    if (isInsufficient) {
      return (
        <Text style={styles.subtitleError}>Kurang {formatCurrency(shortfall)}</Text>
      );
    }
    return <Text style={styles.subtitle}>Saldo: {formatCurrency(balance ?? 0)}</Text>;
  }

  return (
    <TouchableOpacity
      testID="dompet-kebaikan-item"
      style={[styles.item, isSelected && styles.itemSelected, isUnavailable && styles.itemDisabled]}
      onPress={isAuthenticated && !isDisabled ? onPress : undefined}
      disabled={!isAuthenticated || isDisabled}
      accessibilityRole={isAuthenticated ? 'radio' : 'button'}
      accessibilityLabel="Dompet Kebaikan"
      accessibilityState={{selected: isSelected, disabled: isDisabled}}>
      <View style={styles.iconWrapper}>
        <Icon icon={Wallet} size={22} color={colors.primary[500]} />
      </View>
      <View style={styles.textWrapper}>
        <Text style={styles.title}>Dompet Kebaikan</Text>
        {renderSubtitle()}
      </View>
      {renderTrailing()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 44,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  itemSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  itemDisabled: {
    opacity: 0.6,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrapper: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.neutral[900],
  },
  subtitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[700],
  },
  subtitleMuted: {
    fontSize: fontSize.sm,
    color: colors.neutral[400],
  },
  subtitleError: {
    fontSize: fontSize.sm,
    color: colors.semantic.error,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  radioEmpty: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.neutral[300],
  },
  actionButton: {
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.primary[500],
  },
  actionButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[0],
  },
});
