import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Modal,
  Pressable,
  Animated,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui/Icon';
import {
  HamburgerMenu,
  CloseCircle,
  Magnifer,
  AltArrowRight,
  InfoCircle,
  ChatRoundLine,
  Card,
  DocumentText,
  Login2,
} from '@solar-icons/react-native/Linear';
import { useAuthStore } from '@/stores/authStore';
import { openExternalUrl } from '@/utils/openExternalUrl';
import { openWhatsappCs } from '@/utils/whatsapp';

interface HomeHeaderProps {
  onPressSearch: () => void;
  onPressLogin?: () => void;
  onPressAbout?: () => void;
  onPressWebView?: (params: { title: string; url: string }) => void;
  isScrolled?: boolean;
}

const PHRASES: readonly string[] = [
  'Cari Program Kebaikan...',
  'Bangun Masjid...',
  'Pondok Quran...',
  'Pendidikan Quran...',
];

const NAV_ITEMS = [
  {
    id: 'tentang',
    label: 'Tentang Kami',
    desc: 'Profil & visi misi Beramalbersama',
    icon: InfoCircle,
    type: 'route' as const,
    target: 'About' as const,
  },
  {
    id: 'blog',
    label: 'Blog',
    desc: 'Artikel & inspirasi kebaikan',
    icon: InfoCircle,
    type: 'url' as const,
    target: 'https://blog.beramalbersama.com/',
  },
  {
    id: 'kontak',
    label: 'Hubungi Kami',
    desc: 'Layanan donatur & informasi',
    icon: ChatRoundLine,
    type: 'action' as const,
    action: 'whatsapp' as const,
  },
  {
    id: 'rekening',
    label: 'Rekening Donasi',
    desc: 'Daftar rekening resmi',
    icon: Card,
    type: 'url' as const,
    target: 'https://beramalbersama.com/rekening',
  },
  {
    id: 'syarat',
    label: 'Syarat & Ketentuan',
    desc: 'Ketentuan & kebijakan privasi',
    icon: DocumentText,
    type: 'route' as const,
    target: 'WebView' as const,
    params: {
      title: 'Syarat & Ketentuan',
      url: 'https://beramalbersama.com/syarat-ketentuan',
    },
  },
];

export function HomeHeader({
  onPressSearch,
  onPressLogin,
  onPressAbout,
  onPressWebView,
  isScrolled = false,
}: HomeHeaderProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const accessToken = useAuthStore(s => s.accessToken);
  const isAuthenticated = accessToken != null;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [displayText, setDisplayText] = useState<string>(PHRASES[0] ?? '');

  // Animasi fade text (smooth cross-fade text rotator tanpa setState loop karakter per karakter)
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    let phraseIndex = 0;

    const intervalId = setInterval(() => {
      if (!isMountedRef.current) return;

      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished || !isMountedRef.current) return;

        phraseIndex = (phraseIndex + 1) % PHRASES.length;
        setDisplayText(PHRASES[phraseIndex] ?? '');

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }).start();
      });
    }, 3200);

    return () => {
      isMountedRef.current = false;
      clearInterval(intervalId);
    };
  }, [fadeAnim]);

  function handleNavItemPress(item: (typeof NAV_ITEMS)[number]): void {
    setIsMenuOpen(false);
    if (item.type === 'url' && item.target) {
      openExternalUrl(item.target);
    } else if (item.type === 'action' && item.action === 'whatsapp') {
      openWhatsappCs();
    } else if (item.type === 'route' && item.target) {
      if (item.target === 'About' && onPressAbout) {
        onPressAbout();
      } else if (item.target === 'WebView' && item.params && onPressWebView) {
        onPressWebView(item.params);
      } else {
        openExternalUrl(`https://beramalbersama.com/${item.id}`);
      }
    }
  }

  function handleLoginPress(): void {
    setIsMenuOpen(false);
    if (onPressLogin) {
      onPressLogin();
    }
  }

  const paddingTop = Math.max(insets.top, 12);
  const headerHeight = 56;
  const totalTopOffset = paddingTop + headerHeight;

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Main Sticky Header */}
      <View
        style={[
          styles.headerContainer,
          {
            paddingTop,
            backgroundColor: isScrolled ? '#1EB8B1' : 'transparent',
          },
          isScrolled && styles.headerShadow,
        ]}>
        <View style={styles.headerRow}>
          {/* Logo brand */}
          <TouchableOpacity
            style={styles.logoButton}
            activeOpacity={0.8}
            onPress={() => {}}
            accessibilityRole="image"
            accessibilityLabel="Beramalbersama">
            <Image
              source={require('@/assets/images/logo/logo-short-white.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Search Button dengan Fading Rotating Text */}
          <TouchableOpacity
            style={styles.searchButton}
            onPress={onPressSearch}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Cari program kebaikan">
            <Icon icon={Magnifer} size={18} color="#FFFFFF" />
            <Animated.View style={[styles.textWrapper, { opacity: fadeAnim }]}>
              <Text style={styles.searchText} numberOfLines={1}>
                {displayText}
              </Text>
            </Animated.View>
          </TouchableOpacity>

          {/* Hamburger / Close Button */}
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setIsMenuOpen(prev => !prev)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Toggle menu navigasi">
            <Icon
              icon={isMenuOpen ? CloseCircle : HamburgerMenu}
              size={22}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Dropdown Nav Menu dengan Modal Overlay (Isolasi zIndex & Clean Dismiss) */}
      <Modal
        visible={isMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsMenuOpen(false)}>
        <View style={styles.modalOverlay}>
          {/* Backdrop untuk dismiss saat klik di luar menu */}
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setIsMenuOpen(false)}
          />

          {/* Dropdown Content tepat di bawah header */}
          <View
            style={[
              styles.dropdownCard,
              { marginTop: totalTopOffset },
            ]}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.dropdownScroll}
              bounces={false}>
              <View style={styles.itemList}>
                {NAV_ITEMS.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.navRow}
                    onPress={() => handleNavItemPress(item)}
                    activeOpacity={0.8}>
                    <View style={styles.navRowLeft}>
                      <View style={styles.navIconCircle}>
                        <Icon icon={item.icon} size={18} color="#FFFFFF" />
                      </View>
                      <View style={styles.navTextCol}>
                        <Text style={styles.navLabel}>{item.label}</Text>
                        <Text style={styles.navDesc} numberOfLines={1}>
                          {item.desc}
                        </Text>
                      </View>
                    </View>
                    <Icon
                      icon={AltArrowRight}
                      size={16}
                      color="rgba(255,255,255,0.7)"
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Tombol Masuk Akun bila belum authenticated */}
              {!isAuthenticated && (
                <View style={styles.loginContainer}>
                  <TouchableOpacity
                    style={styles.loginButton}
                    onPress={handleLoginPress}
                    activeOpacity={0.85}>
                    <Text style={styles.loginButtonText}>Masuk Akun</Text>
                    <Icon icon={Login2} size={16} color="#1EB8B1" />
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerShadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  headerRow: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    gap: 8,
  },
  logoButton: {
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  logoImage: {
    height: 32,
    width: 60,
  },
  searchButton: {
    flex: 1,
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  textWrapper: {
    flex: 1,
  },
  searchText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  dropdownCard: {
    backgroundColor: '#179E98',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  dropdownScroll: {
    maxHeight: 340,
  },
  itemList: {
    gap: 6,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  navRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  navIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  navTextCol: {
    flex: 1,
  },
  navLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 16,
  },
  navDesc: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 2,
  },
  loginContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderRadius: 12,
  },
  loginButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1EB8B1',
  },
});
