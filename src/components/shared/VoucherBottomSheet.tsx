import React, {forwardRef, useCallback} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import type {BottomSheetBackdropProps} from '@gorhom/bottom-sheet';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Button} from '@/components/ui/Button';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';

interface VoucherBottomSheetProps {
  voucherCode: string;
  onChangeCode: (code: string) => void;
  onClaim: () => void;
  isClaiming: boolean;
  error?: string | null;
}

export const VoucherBottomSheet = forwardRef<
  BottomSheetModal,
  VoucherBottomSheetProps
>(function VoucherBottomSheetComponent(
  {voucherCode, onChangeCode, onClaim, isClaiming, error = null},
  ref,
): React.JSX.Element {
  const insets = useSafeAreaInsets();
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
      snapPoints={['40%']}
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}>
      <BottomSheetView
        style={[styles.container, {paddingBottom: insets.bottom + spacing.xl}]}>
        <Text style={styles.title}>Punya Kode Voucher?</Text>
        <View style={[styles.inputWrapper, error && styles.inputError]}>
          <BottomSheetTextInput
            style={styles.input}
            value={voucherCode}
            onChangeText={onChangeCode}
            placeholder="Masukkan kode voucher"
            placeholderTextColor={colors.neutral[400]}
            autoCapitalize="characters"
            accessibilityLabel="Input kode voucher"
          />
        </View>
        {error ? (
          <Text style={styles.errorText} accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : null}
        <Button
          label="Klaim"
          onPress={onClaim}
          isLoading={isClaiming}
          isDisabled={isClaiming}
          size="lg"
        />
      </BottomSheetView>
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
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  inputWrapper: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  inputError: {
    borderColor: colors.semantic.error,
  },
  input: {
    fontSize: fontSize.md,
    color: colors.neutral[900],
    padding: 0,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.semantic.error,
  },
});
