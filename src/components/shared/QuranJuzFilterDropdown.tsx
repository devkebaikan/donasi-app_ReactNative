import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {AltArrowDown} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {colors, spacing, radius, fontSize, fontWeight, shadows} from '@/theme';

const ALL_JUZ_LABEL = 'Semua Juz';
const JUZ_NUMBERS = Array.from({length: 30}, (_, index) => index + 1);

interface QuranJuzFilterDropdownProps {
  value: number | null; // null = semua juz
  onChange: (juzNumber: number | null) => void;
}

export function QuranJuzFilterDropdown({
  value,
  onChange,
}: QuranJuzFilterDropdownProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({top: 0, left: 0});
  const triggerRef = useRef<React.ElementRef<typeof TouchableOpacity>>(null);

  const label = value == null ? ALL_JUZ_LABEL : `Juz ${value}`;

  function handleOpen(): void {
    triggerRef.current?.measureInWindow((x, y, _width, height) => {
      setMenuPosition({top: y + height + spacing.xs, left: x});
      setIsOpen(true);
    });
  }

  function handleSelect(juzNumber: number | null): void {
    onChange(juzNumber);
    setIsOpen(false);
  }

  return (
    <>
      <TouchableOpacity
        ref={triggerRef}
        style={styles.trigger}
        onPress={handleOpen}
        accessibilityRole="button"
        accessibilityLabel={`Filter: ${label}`}>
        <Text style={styles.triggerLabel}>{label}</Text>
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
          accessibilityLabel="Tutup filter juz">
          <View
            style={[
              styles.menu,
              {top: menuPosition.top, left: menuPosition.left},
            ]}>
            {/* 31 opsi tidak muat sekali layar, jadi menunya sendiri yang scroll. */}
            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={styles.option}
                onPress={() => handleSelect(null)}
                accessibilityRole="menuitem"
                accessibilityLabel={ALL_JUZ_LABEL}
                accessibilityState={{selected: value == null}}>
                <Text
                  style={[
                    styles.optionLabel,
                    value == null && styles.optionLabelActive,
                  ]}>
                  {ALL_JUZ_LABEL}
                </Text>
              </TouchableOpacity>

              {JUZ_NUMBERS.map(juzNumber => {
                const isActive = value === juzNumber;
                return (
                  <TouchableOpacity
                    key={juzNumber}
                    style={styles.option}
                    onPress={() => handleSelect(juzNumber)}
                    accessibilityRole="menuitem"
                    accessibilityLabel={`Juz ${juzNumber}`}
                    accessibilityState={{selected: isActive}}>
                    <Text
                      style={[
                        styles.optionLabel,
                        isActive && styles.optionLabelActive,
                      ]}>
                      Juz {juzNumber}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[0],
  },
  triggerLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[700],
  },
  backdrop: {
    flex: 1,
  },
  menu: {
    position: 'absolute',
    minWidth: 160,
    maxHeight: 320,
    paddingVertical: spacing.xs,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[0],
    ...shadows.md,
  },
  option: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  optionLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    color: colors.neutral[700],
  },
  optionLabelActive: {
    fontWeight: fontWeight.semiBold,
    color: colors.primary[600],
  },
});
