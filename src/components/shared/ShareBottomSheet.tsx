import React, {forwardRef, useCallback} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import type {BottomSheetBackdropProps} from '@gorhom/bottom-sheet';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ChatRound, Copy} from '@solar-icons/react-native/Bold';
import {Icon} from '@/components/ui/Icon';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';

export type ShareOption = 'facebook' | 'twitter' | 'whatsapp' | 'copy-url';

interface ShareBottomSheetProps {
  title?: string; // default: 'Bagikan Program' — mempertahankan pemakaian existing di DetailProgramScreen
  onSelectOption: (option: ShareOption) => void;
}

interface ShareItemConfig {
  option: ShareOption;
  label: string;
}

const SHARE_ITEMS: ShareItemConfig[] = [
  {option: 'facebook', label: 'Facebook'},
  {option: 'twitter', label: 'Twitter'},
  {option: 'whatsapp', label: 'Whatsapp'},
  {option: 'copy-url', label: 'Salin URL'},
];

// Solar Icons tidak menyediakan logo brand (Facebook/Twitter) — dipakai
// inisial huruf sebagai fallback, bukan raw SVG import.
const BRAND_COLORS = {
  facebook: '#3B5998',
  twitter: '#4A99E9',
  whatsapp: '#4CC95E',
} as const;

export const ShareBottomSheet = forwardRef<
  BottomSheetModal,
  ShareBottomSheetProps
>(function ShareBottomSheetComponent(
  {title = 'Bagikan Program', onSelectOption},
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

  function handleClose(): void {
    if (typeof ref === 'function' || !ref?.current) {
      return;
    }
    ref.current.dismiss();
  }

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={['32%']}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}>
      <BottomSheetView
        style={[styles.container, {paddingBottom: insets.bottom + spacing.xl}]}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity
            testID="share-sheet-close-button"
            style={styles.closeButton}
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel="Tutup">
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          {SHARE_ITEMS.map(item => (
            <TouchableOpacity
              key={item.option}
              testID={`share-sheet-item-${item.option}`}
              style={styles.item}
              onPress={() => onSelectOption(item.option)}
              accessibilityRole="button"
              accessibilityLabel={item.label}>
              <ShareIcon option={item.option} />
              <Text style={styles.label} numberOfLines={1}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

function ShareIcon({option}: {option: ShareOption}): React.JSX.Element {
  switch (option) {
    case 'facebook':
      return (
        <View style={[styles.iconWrapper, {backgroundColor: BRAND_COLORS.facebook}]}>
          <Text style={styles.letterIcon}>f</Text>
        </View>
      );
    case 'twitter':
      return (
        <View style={[styles.iconWrapper, {backgroundColor: BRAND_COLORS.twitter}]}>
          <Text style={styles.letterIcon}>X</Text>
        </View>
      );
    case 'whatsapp':
      return (
        <View style={[styles.iconWrapper, {backgroundColor: BRAND_COLORS.whatsapp}]}>
          <Icon icon={ChatRound} size={26} color={colors.neutral[0]} />
        </View>
      );
    case 'copy-url':
      return (
        <View style={[styles.iconWrapper, styles.copyIconWrapper]}>
          <Icon icon={Copy} size={24} color={colors.neutral[0]} />
        </View>
      );
  }
}

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: colors.neutral[0],
  },
  handleIndicator: {
    backgroundColor: colors.neutral[300],
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: fontSize.lg,
    color: colors.neutral[500],
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  item: {
    alignItems: 'center',
    gap: spacing.sm,
    width: 72,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyIconWrapper: {
    backgroundColor: colors.neutral[300],
  },
  letterIcon: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.neutral[0],
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.neutral[700],
  },
});
