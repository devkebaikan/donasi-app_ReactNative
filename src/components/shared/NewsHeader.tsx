import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ArrowLeft, Magnifer, CloseCircle} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';

const FIELD_ICON_HIT_SLOP = {top: 8, bottom: 8, left: 8, right: 8};

interface NewsHeaderProps {
  title: string;
  onBack: () => void;
  isSearchActive: boolean;
  searchInput: string;
  onChangeSearchInput: (value: string) => void;
  onPressSearchToggle: () => void;
  onSubmitSearch: () => void;
  onPressClear: () => void;
  /** Default: 'Cari berita...' — mempertahankan pemakaian existing di menu Berita. */
  placeholder?: string;
  /**
   * Aksi tambahan di kiri tombol cari. Kosong secara default, jadi menu yang
   * tidak mengisinya tampil persis seperti sebelumnya. Disembunyikan saat mode
   * cari aktif — barisnya sudah penuh dipakai field.
   */
  rightSlot?: React.ReactNode;
}

export function NewsHeader({
  title,
  onBack,
  isSearchActive,
  searchInput,
  onChangeSearchInput,
  onPressSearchToggle,
  onSubmitSearch,
  onPressClear,
  placeholder = 'Cari berita...',
  rightSlot,
}: NewsHeaderProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (isSearchActive) {
      inputRef.current?.focus();
    }
  }, [isSearchActive]);

  return (
    <>
      <StatusBar
        translucent={false}
        backgroundColor={colors.primary[500]}
        barStyle="light-content"
      />
      <View style={[styles.container, {paddingTop: insets.top + spacing.md}]}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Kembali">
          <Icon icon={ArrowLeft} size={24} color={colors.neutral[900]} />
        </TouchableOpacity>

        {/* Dua tombol di kanan membuat judul yang flex:1 bergeser ke kiri
            setengah lebar tombol. Spacer ini yang mengembalikannya ke tengah —
            alasan dan bentuk yang sama sudah dipakai HeaderLight. */}
        {rightSlot && !isSearchActive ? <View style={styles.iconButton} /> : null}

        {isSearchActive ? (
          <View style={styles.searchField}>
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              placeholder={placeholder}
              placeholderTextColor={colors.neutral[400]}
              value={searchInput}
              onChangeText={onChangeSearchInput}
              onSubmitEditing={onSubmitSearch}
              returnKeyType="search"
              accessibilityLabel={`Cari ${title.toLowerCase()}`}
            />
            <TouchableOpacity
              style={styles.fieldIconButton}
              hitSlop={FIELD_ICON_HIT_SLOP}
              onPress={onPressClear}
              accessibilityRole="button"
              accessibilityLabel={searchInput ? 'Hapus pencarian' : 'Tutup pencarian'}>
              <Icon icon={CloseCircle} size={18} color={colors.neutral[400]} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.fieldIconButton}
              hitSlop={FIELD_ICON_HIT_SLOP}
              onPress={onSubmitSearch}
              accessibilityRole="button"
              accessibilityLabel="Cari">
              <Icon icon={Magnifer} size={18} color={colors.neutral[600]} />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {rightSlot}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onPressSearchToggle}
              accessibilityRole="button"
              accessibilityLabel={`Cari ${title.toLowerCase()}`}>
              <Icon icon={Magnifer} size={22} color={colors.neutral[900]} />
            </TouchableOpacity>
          </>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[0],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral[200],
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Rata tengah, seragam dengan HeaderLight. Sisi kanan selalu terisi tombol
  // cari selebar tombol back; saat rightSlot ikut terisi, spacer di sisi kiri
  // yang menyeimbangkannya.
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  searchField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[100],
    gap: spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.neutral[900],
  },
  fieldIconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
