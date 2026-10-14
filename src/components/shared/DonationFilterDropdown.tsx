import React, {useRef, useState} from 'react';
import {View, Text, TouchableOpacity, Modal, StyleSheet} from 'react-native';
import {AltArrowDown} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {colors, spacing, radius, fontSize, fontWeight, shadows} from '@/theme';
import {SORT_OPTIONS, SORT_OPTION_LABEL} from '@/types/donationFilter';
import type {SortOption} from '@/types/donationFilter';

interface DonationFilterDropdownProps {
  value: SortOption;
  onChange: (option: SortOption) => void;
}

export function DonationFilterDropdown({
  value,
  onChange,
}: DonationFilterDropdownProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({top: 0, left: 0});
  const triggerRef = useRef<React.ElementRef<typeof TouchableOpacity>>(null);

  function handleOpen(): void {
    triggerRef.current?.measureInWindow((x, y, _width, height) => {
      setMenuPosition({top: y + height + spacing.xs, left: x});
      setIsOpen(true);
    });
  }

  function handleSelect(option: SortOption): void {
    onChange(option);
    setIsOpen(false);
  }

  return (
    <>
      <TouchableOpacity
        ref={triggerRef}
        style={styles.trigger}
        onPress={handleOpen}
        accessibilityRole="button"
        accessibilityLabel={`Filter: ${SORT_OPTION_LABEL[value]}`}>
        <Text style={styles.triggerLabel}>{SORT_OPTION_LABEL[value]}</Text>
        <Icon icon={AltArrowDown} size={16} color={colors.neutral[700]} />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
          accessibilityRole="button"
          accessibilityLabel="Tutup filter">
          <View
            style={[
              styles.menu,
              {top: menuPosition.top, left: menuPosition.left},
            ]}>
            {SORT_OPTIONS.map(option => {
              const isSelected = option === value;
              return (
                <TouchableOpacity
                  key={option}
                  testID={`sort-option-${option}`}
                  style={styles.menuItem}
                  onPress={() => handleSelect(option)}
                  accessibilityRole="button"
                  accessibilityLabel={SORT_OPTION_LABEL[option]}
                  accessibilityState={{selected: isSelected}}>
                  <Text
                    style={[
                      styles.menuItemLabel,
                      isSelected && styles.menuItemLabelSelected,
                    ]}>
                    {SORT_OPTION_LABEL[option]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[100],
    gap: spacing.xs,
  },
  triggerLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[700],
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  menu: {
    position: 'absolute',
    minWidth: 200,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[0],
    paddingVertical: spacing.xs,
    ...shadows.lg,
  },
  menuItem: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  menuItemLabel: {
    fontSize: fontSize.sm,
    color: colors.neutral[700],
  },
  menuItemLabelSelected: {
    fontWeight: fontWeight.semiBold,
    color: colors.primary[600],
  },
});
