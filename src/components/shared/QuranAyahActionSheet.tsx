import React, {forwardRef, useCallback} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import type {BottomSheetBackdropProps} from '@gorhom/bottom-sheet';
import {Icon, type SolarIconComponent} from '@/components/ui/Icon';
import {
  Share as ShareIcon,
  Book,
  Copy,
} from '@solar-icons/react-native/Linear';
import {colors, spacing, fontSize, fontWeight} from '@/theme';

interface QuranAyahActionSheetProps {
  ayahLabel: string;
  onPressShare: () => void;
  onPressTafsir: () => void;
  onPressCopy: () => void;
}

interface ActionRow {
  key: string;
  label: string;
  icon: SolarIconComponent;
  onPress: () => void;
}

export const QuranAyahActionSheet = forwardRef<
  BottomSheetModal,
  QuranAyahActionSheetProps
>(function QuranAyahActionSheetComponent(
  {ayahLabel, onPressShare, onPressTafsir, onPressCopy},
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

  const actions: ActionRow[] = [
    {
      key: 'share',
      label: 'Bagikan Ayat',
      icon: ShareIcon,
      onPress: onPressShare,
    },
    {key: 'tafsir', label: 'Tafsir', icon: Book, onPress: onPressTafsir},
    {key: 'copy', label: 'Salin Teks', icon: Copy, onPress: onPressCopy},
  ];

  return (
    <BottomSheetModal
      ref={ref}
      enableDynamicSizing
      backdropComponent={renderBackdrop}>
      <BottomSheetView style={styles.container}>
        <Text style={styles.title}>{ayahLabel}</Text>
        {actions.map(action => (
          <TouchableOpacity
            key={action.key}
            style={styles.row}
            onPress={action.onPress}
            accessibilityRole="button"
            accessibilityLabel={`${action.label}, ${ayahLabel}`}>
            <Icon icon={action.icon} size={22} color={colors.neutral[700]} />
            <Text style={styles.label}>{action.label}</Text>
          </TouchableOpacity>
        ))}
        <View style={styles.bottomSpacer} />
      </BottomSheetView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
    marginBottom: spacing.sm,
  },
  row: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    color: colors.neutral[800],
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});
