import React, {useCallback, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import type {BottomSheetBackdropProps} from '@gorhom/bottom-sheet';
import {MapPoint, Magnifer, Gps} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {EmptyState} from '@/components/ui/EmptyState';
import {colors, fontWeight, fontSize, radius, spacing} from '@/theme';
import type {PrayerLocation} from '@/types/prayerTime';

interface PrayerLocationSheetProps {
  isOpen: boolean;
  keyword: string;
  results: PrayerLocation[];
  selectedLocationId: string | null;
  isSearching: boolean;
  isResolvingDevice: boolean;
  onChangeKeyword: (keyword: string) => void;
  onSelect: (location: PrayerLocation) => void;
  onUseDeviceLocation: () => void;
  onClose: () => void;
}

export function PrayerLocationSheet({
  isOpen,
  keyword,
  results,
  selectedLocationId,
  isSearching,
  isResolvingDevice,
  onChangeKeyword,
  onSelect,
  onUseDeviceLocation,
  onClose,
}: PrayerLocationSheetProps): React.JSX.Element {
  const sheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (isOpen) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [isOpen]);

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
      ref={sheetRef}
      snapPoints={['75%']}
      enableDynamicSizing={false}
      onDismiss={onClose}
      backdropComponent={renderBackdrop}>
      <View style={styles.header}>
        <Text style={styles.title}>Lokasi</Text>

        <TouchableOpacity
          style={styles.deviceRow}
          onPress={onUseDeviceLocation}
          disabled={isResolvingDevice}
          accessibilityRole="button"
          accessibilityLabel="Gunakan lokasi perangkat">
          <Icon icon={Gps} size={20} color={colors.primary[600]} />
          <Text style={styles.deviceLabel}>Gunakan lokasi perangkat</Text>
          {isResolvingDevice ? (
            <ActivityIndicator size="small" color={colors.primary[600]} />
          ) : null}
        </TouchableOpacity>

        <View style={styles.searchField}>
          <Icon icon={Magnifer} size={20} color={colors.neutral[400]} />
          <TextInput
            style={styles.searchInput}
            value={keyword}
            onChangeText={onChangeKeyword}
            placeholder="Cari kota..."
            placeholderTextColor={colors.neutral[400]}
            accessibilityLabel="Cari kota"
          />
        </View>
      </View>

      <BottomSheetScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {isSearching ? (
          <ActivityIndicator
            style={styles.searchLoading}
            color={colors.primary[500]}
          />
        ) : null}

        {!isSearching && results.length === 0 ? (
          <EmptyState icon={MapPoint} title="Kota tidak ditemukan." />
        ) : null}

        {results.map(location => {
          const isSelected = location.id === selectedLocationId;
          return (
            <TouchableOpacity
              key={location.id}
              style={[styles.item, isSelected && styles.itemSelected]}
              onPress={() => onSelect(location)}
              accessibilityRole="radio"
              accessibilityState={{selected: isSelected}}
              accessibilityLabel={location.name}>
              <Icon
                icon={MapPoint}
                size={18}
                color={isSelected ? colors.primary[600] : colors.neutral[400]}
              />
              <Text style={styles.itemLabel} numberOfLines={2}>
                {location.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  title: {
    fontWeight: fontWeight.bold,
    fontSize: fontSize.lg,
    color: colors.neutral[900],
  },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[100],
  },
  searchInput: {
    flex: 1,
    fontWeight: fontWeight.regular,
    fontSize: fontSize.md,
    color: colors.neutral[900],
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primary[200],
    backgroundColor: colors.primary[50],
  },
  deviceLabel: {
    flex: 1,
    fontWeight: fontWeight.semiBold,
    fontSize: fontSize.md,
    color: colors.primary[700],
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
    gap: spacing.sm,
  },
  searchLoading: {
    paddingVertical: spacing.lg,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  itemSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  itemLabel: {
    flex: 1,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.md,
    color: colors.neutral[900],
  },
});
