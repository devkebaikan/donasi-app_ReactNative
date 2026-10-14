import React, {forwardRef, useCallback} from 'react';
import {View, Text, ActivityIndicator, StyleSheet} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import type {BottomSheetBackdropProps} from '@gorhom/bottom-sheet';
import {Button} from '@/components/ui/Button';
import {SafeAreaFooter} from '@/components/ui/SafeAreaFooter';
import {DompetKebaikanListItem} from '@/components/shared/DompetKebaikanListItem';
import {PaymentMethodListItem} from '@/components/shared/PaymentMethodListItem';
import {colors, spacing, fontSize, fontWeight} from '@/theme';
import type {PaymentMethod} from '@/types/payment';
import {
  PAYMENT_METHOD_GROUP_ORDER,
  getPaymentMethodGroup,
  getPaymentMethodGroupLabel,
} from '@/utils/paymentMethodGroup';

interface MetodePembayaranBottomSheetProps {
  paymentMethods: PaymentMethod[];
  isLoadingMethods: boolean;
  selectedMethod: PaymentMethod | null;
  isAuthenticated?: boolean;
  walletBalance?: number | null;
  isLoadingWalletBalance?: boolean;
  isWalletInsufficient?: boolean;
  amount?: number;
  onSelectMethod: (method: PaymentMethod) => void;
  onPressLoginForWallet?: () => void;
  onPressTopupForWallet?: () => void;
  onConfirm: () => void;
}

export const MetodePembayaranBottomSheet = forwardRef<
  BottomSheetModal,
  MetodePembayaranBottomSheetProps
>(function MetodePembayaranBottomSheetComponent(
  {
    paymentMethods,
    isLoadingMethods,
    selectedMethod,
    isAuthenticated = false,
    walletBalance = null,
    isLoadingWalletBalance = false,
    isWalletInsufficient = false,
    amount = 0,
    onSelectMethod,
    onPressLoginForWallet = () => {},
    onPressTopupForWallet = () => {},
    onConfirm,
  },
  ref,
): React.JSX.Element {
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={['70%']}
      enableDynamicSizing={false}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}>
      <View style={styles.header}>
        <Text style={styles.title}>Pilih Metode Pembayaran</Text>
      </View>

      {isLoadingMethods ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary[500]} />
        </View>
      ) : (
        <BottomSheetScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {PAYMENT_METHOD_GROUP_ORDER.map(group => {
            const items = paymentMethods.filter(
              method => getPaymentMethodGroup(method.type) === group,
            );
            if (items.length === 0) {
              return null;
            }
            return (
              <View key={group} style={styles.group}>
                <Text style={styles.groupLabel}>{getPaymentMethodGroupLabel(group)}</Text>
                <View style={styles.groupItems}>
                  {items.map(method =>
                    method.type === 'wallet' ? (
                      <DompetKebaikanListItem
                        key={method.id}
                        isAuthenticated={isAuthenticated}
                        balance={walletBalance}
                        isLoadingBalance={isLoadingWalletBalance}
                        isSelected={selectedMethod?.id === method.id}
                        isInsufficient={isWalletInsufficient}
                        amount={amount}
                        onPress={() => onSelectMethod(method)}
                        onPressLogin={onPressLoginForWallet}
                        onPressTopup={onPressTopupForWallet}
                      />
                    ) : (
                      <PaymentMethodListItem
                        key={method.id}
                        method={method}
                        isSelected={selectedMethod?.id === method.id}
                        onPress={() => onSelectMethod(method)}
                      />
                    ),
                  )}
                </View>
              </View>
            );
          })}
        </BottomSheetScrollView>
      )}

      <SafeAreaFooter>
        <Button
          label="Lanjutkan"
          onPress={onConfirm}
          size="lg"
          isDisabled={!selectedMethod}
        />
      </SafeAreaFooter>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: colors.neutral[0],
  },
  handleIndicator: {
    backgroundColor: colors.neutral[300],
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  loadingContainer: {
    paddingVertical: spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
  },
  group: {
    gap: spacing.sm,
  },
  groupLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[600],
  },
  groupItems: {
    gap: spacing.sm,
  },
});
