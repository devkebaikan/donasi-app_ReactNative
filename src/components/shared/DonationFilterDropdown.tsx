import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {
  AltArrowDown,
  SortVertical,
  CheckCircle,
} from '@solar-icons/react-native/Linear';
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
      const screenWidth = Dimensions.get('window').width;
      const menuWidth = 190;
      let left = x;
      if (left + menuWidth > screenWidth - 16) {
        left = screenWidth - menuWidth - 16;
      }
      setMenuPosition({top: y + height + 6, left: Math.max(16, left)});
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
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Filter: ${SORT_OPTION_LABEL[value]}`}>
        <Icon icon={SortVertical} size={15} color={colors.neutral[500]} />
        <Text style={styles.triggerLabel}>{SORT_OPTION_LABEL[value]}</Text>
        <Icon icon={AltArrowDown} size={13} color={colors.neutral[400]} />
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
            <View style={styles.menuHeader}>
              <Text style={styles.menuHeaderText}>URUTKAN</Text>
            </View>
            {SORT_OPTIONS.map(option => {
              const isSelected = option === value;
              return (
                <TouchableOpacity
                  key={option}
                  testID={`sort-option-${option}`}
                  style={[
                    styles.menuItem,
                    isSelected && styles.menuItemSelected,
                  ]}
                  onPress={() => handleSelect(option)}
                  activeOpacity={0.7}
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
                  {/* {isSelected && (
                    <Icon
                      icon={CheckCircle}
                      size={16}
                      color={colors.primary[500]}
                    />
                  )} */}
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
    height: 36,
    paddingHorizontal: spacing.sm + 4,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    gap: 6,
  },
  triggerLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.neutral[700],
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  menu: {
    position: 'absolute',
    width: 190,
    borderRadius: radius.xl,
    backgroundColor: colors.neutral[0],
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    ...shadows.lg,
  },
  menuHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: 4,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
    marginBottom: 4,
  },
  menuHeaderText: {
    fontSize: 10,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[400],
    letterSpacing: 0.8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 38,
    paddingHorizontal: spacing.md,
  },
  menuItemSelected: {
    backgroundColor: colors.primary[50],
  },
  menuItemLabel: {
    fontSize: fontSize.xs,
    color: colors.neutral[700],
  },
  menuItemLabelSelected: {
    fontWeight: fontWeight.semiBold,
    color: colors.primary[600],
  },
});
