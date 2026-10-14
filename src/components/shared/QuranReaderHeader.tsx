import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StatusBar,
  StyleSheet,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Icon, type SolarIconComponent} from '@/components/ui/Icon';
import {
  ArrowLeft,
  MenuDots,
  Play,
  Microphone,
  Book,
  Bookmark,
  Share as ShareIcon,
} from '@solar-icons/react-native/Linear';
import {Bookmark as BookmarkBold} from '@solar-icons/react-native/Bold';
import {colors, spacing, radius, shadows, fontSize, fontWeight} from '@/theme';

interface MenuAction {
  key: string;
  label: string;
  icon: SolarIconComponent;
  onPress: () => void;
}

interface QuranReaderHeaderProps {
  surahName: string;
  isPlayingFullSurah: boolean;
  qariLabel: string;
  onPressPlayFullSurah: () => void;
  onPressQari: () => void;
  subtitle: string;
  isSaved: boolean;
  onBack: () => void;
  onPressGoTo: () => void;
  onPressSave: () => void;
  onPressShare: () => void;
}

export function QuranReaderHeader({
  surahName,
  isPlayingFullSurah,
  qariLabel,
  onPressPlayFullSurah,
  onPressQari,
  subtitle,
  isSaved,
  onBack,
  onPressGoTo,
  onPressSave,
  onPressShare,
}: QuranReaderHeaderProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Ketiga aksi dikumpulkan di satu burger menu, bukan disebar jadi ikon
  // terpisah — judul surah butuh ruang dan aksinya jarang dipakai.
  const actions: MenuAction[] = [
    {
      key: 'play-surah',
      label: isPlayingFullSurah
        ? 'Sedang memutar satu surah'
        : 'Putar Satu Surah',
      icon: Play,
      onPress: onPressPlayFullSurah,
    },
    {
      // Label memuat nama qari yang sedang dipakai, jadi menu ini sekaligus
      // menjawab "sedang mendengarkan siapa" tanpa perlu dibuka.
      key: 'qari',
      label: `Qari: ${qariLabel}`,
      icon: Microphone,
      onPress: onPressQari,
    },
    {key: 'goto', label: 'Pergi ke', icon: Book, onPress: onPressGoTo},
    {
      key: 'save',
      label: isSaved ? 'Hapus dari Disimpan' : 'Simpan',
      icon: isSaved ? BookmarkBold : Bookmark,
      onPress: onPressSave,
    },
    {key: 'share', label: 'Bagikan', icon: ShareIcon, onPress: onPressShare},
  ];

  function handleSelect(action: MenuAction): void {
    setIsMenuOpen(false);
    action.onPress();
  }

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.container, {paddingTop: insets.top + spacing.md}]}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Kembali">
          <Icon icon={ArrowLeft} size={24} color={colors.neutral[700]} />
        </TouchableOpacity>

        <View style={styles.titleBlock}>
          <Text style={styles.title} numberOfLines={1}>
            {surahName}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setIsMenuOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Menu surah">
          {/* Titik tiga berdiri — Solar tidak punya varian vertikal, jadi
              ikon horizontalnya diputar. */}
          <View style={styles.menuIcon}>
            <Icon icon={MenuDots} size={24} color={colors.neutral[700]} />
          </View>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsMenuOpen(false)}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setIsMenuOpen(false)}
          accessibilityRole="button"
          accessibilityLabel="Tutup menu">
          <View style={[styles.menu, {top: insets.top + 56}]}>
            {actions.map(action => (
              <TouchableOpacity
                key={action.key}
                style={styles.menuItem}
                onPress={() => handleSelect(action)}
                accessibilityRole="menuitem"
                accessibilityLabel={action.label}>
                <Icon
                  icon={action.icon}
                  size={20}
                  color={colors.neutral[700]}
                />
                <Text style={styles.menuLabel} numberOfLines={1}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  menuIcon: {
    transform: [{rotate: '90deg'}],
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
  subtitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    color: colors.neutral[500],
  },
  backdrop: {
    flex: 1,
  },
  menu: {
    position: 'absolute',
    right: spacing.lg,
    minWidth: 240,
    maxWidth: 280,
    paddingVertical: spacing.xs,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[0],
    ...shadows.md,
  },
  menuItem: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  menuLabel: {
    flexShrink: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.neutral[800],
  },
});
