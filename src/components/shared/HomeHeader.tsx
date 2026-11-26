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
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '@/components/ui/Icon';
import type { SolarIconComponent } from '@/components/ui/Icon';
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
  Logout2,
  HandHeart,
  Wallet,
  ShieldCheck,
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

interface DrawerMenuItem {
  id: string;
  label: string;
  desc: string;
  icon: SolarIconComponent;
  onPress: () => void;
}

interface DrawerSection {
  title: string;
  items: DrawerMenuItem[];
}

const PHRASES: readonly string[] = [
  'Cari Program Kebaikan...',
  'Bangun Masjid...',
  'Pondok Quran...',
  'Pendidikan Quran...',
];

export function HomeHeader({
  onPressSearch,
  onPressLogin,
  onPressAbout,
  onPressWebView,
  isScrolled = false,
}: HomeHeaderProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user, accessToken, clearAuth } = useAuthStore();
  const isAuthenticated = accessToken != null;

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [displayText, setDisplayText] = useState<string>(PHRASES[0] ?? '');

  const { width: screenWidth } = Dimensions.get('window');
  const drawerWidth = Math.min(Math.round(screenWidth * 0.82), 340);

  // 1. Animasi transisi background header (transparent glass ke solid primary)
  const scrollAnim = useRef(new Animated.Value(isScrolled ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(scrollAnim, {
      toValue: isScrolled ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [isScrolled, scrollAnim]);

  const headerBgColor = scrollAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 255, 255, 0.14)', '#1EB8B1'],
  });

  const headerBorderColor = scrollAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 255, 255, 0.22)', '#1AA29C'],
  });

  // 2. Animasi fade cross-fade teks placeholder pencarian
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    let phraseIndex = 0;

    const intervalId = setInterval(() => {
      if (!isMountedRef.current) return;

      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished || !isMountedRef.current) return;

        phraseIndex = (phraseIndex + 1) % PHRASES.length;
        setDisplayText(PHRASES[phraseIndex] ?? '');

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }).start();
      });
    }, 3200);

    return () => {
      isMountedRef.current = false;
      clearInterval(intervalId);
    };
  }, [fadeAnim]);

  // 3. Animasi Navigation Drawer (Slide dari kanan & Fade overlay)
  const slideAnim = useRef(new Animated.Value(drawerWidth)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  function openDrawer(): void {
    setIsDrawerOpen(true);
    Animated.parallel([
      Animated.timing(overlayAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 25,
        mass: 0.8,
        stiffness: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }

  function closeDrawer(callback?: () => void): void {
    Animated.parallel([
      Animated.timing(overlayAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: drawerWidth,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsDrawerOpen(false);
      callback?.();
    });
  }

  // 4. Struktur data menu navigasi drawer (bersih, konsisten, tanpa hook useMemo)
  const menuSections: DrawerSection[] = [
    {
      title: 'Program',
      items: [
        {
          id: 'rutin',
          label: 'Donasi Rutin',
          desc: 'Amalan otomatis harian & subuh',
          icon: HandHeart,
          onPress: () => navigation.navigate('DonasiRutin'),
        },
        {
          id: 'zakat',
          label: 'Zakat & Infak',
          desc: 'Kalkulator zakat & bayar infak',
          icon: Wallet,
          onPress: () => navigation.navigate('Zakat'),
        },
        {
          id: 'rekening',
          label: 'Rekening Donasi',
          desc: 'Daftar rekening bank & verifikasi',
          icon: Card,
          onPress: () => openExternalUrl('https://beramalbersama.com/rekening'),
        },
      ],
    },
    {
      title: 'Informasi',
      items: [
        {
          id: 'tentang',
          label: 'Tentang Kami',
          desc: 'Profil yayasan, legalitas & visi misi',
          icon: InfoCircle,
          onPress: () =>
            onPressAbout ? onPressAbout() : navigation.navigate('About'),
        },
        {
          id: 'blog',
          label: 'Blog & Inspirasi',
          desc: 'Artikel & cerita penyaluran kebaikan',
          icon: DocumentText,
          onPress: () => openExternalUrl('https://blog.beramalbersama.com/'),
        },
        {
          id: 'syarat',
          label: 'Syarat & Ketentuan',
          desc: 'Kebijakan privasi & aturan donasi',
          icon: ShieldCheck,
          onPress: () =>
            onPressWebView
              ? onPressWebView({
                  title: 'Syarat & Ketentuan',
                  url: 'https://beramalbersama.com/syarat-ketentuan',
                })
              : navigation.navigate('WebView', {
                  title: 'Syarat & Ketentuan',
                  url: 'https://beramalbersama.com/syarat-ketentuan',
                }),
        },
      ],
    },
    {
      title: 'Bantuan & CS',
      items: [
        {
          id: 'kontak',
          label: 'Hubungi Kami',
          desc: 'Customer service WhatsApp responsif',
          icon: ChatRoundLine,
          onPress: () => openWhatsappCs(),
        },
      ],
    },
  ];

  const paddingTop = Math.max(insets.top, 12);

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Main Sticky Header */}
      <Animated.View
        className={`absolute top-0 left-0 right-0 z-40 border-b ${
          isScrolled ? 'shadow-lg' : 'shadow-none'
        }`}
        style={{
          paddingTop,
          backgroundColor: headerBgColor,
          borderColor: headerBorderColor,
        }}>
        <View className="h-16 flex-row items-center justify-between px-3 gap-2.5">
          {/* Logo Brand */}
          <TouchableOpacity
            className="h-9 justify-center items-center shrink-0"
            activeOpacity={0.8}
            onPress={() => {}}
            accessibilityRole="image"
            accessibilityLabel="Beramalbersama">
            <Image
              source={require('@/assets/images/logo/logo-short-white.png')}
              className="h-8 w-16"
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Search Bar Pill */}
          <TouchableOpacity
            className="flex-1 h-10 px-3.5 rounded-full bg-white/20 border border-white/30 flex-row items-center gap-2.5 active:bg-white/30"
            onPress={onPressSearch}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Cari program kebaikan">
            <Icon icon={Magnifer} size={18} color="#FFFFFF" />
            <Animated.View className="flex-1" style={{ opacity: fadeAnim }}>
              <Text className="text-xs font-medium text-white" numberOfLines={1}>
                {displayText}
              </Text>
            </Animated.View>
          </TouchableOpacity>

          {/* Hamburger Menu Button */}
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-white/20 border border-white/30 items-center justify-center shrink-0 active:bg-white/30"
            onPress={openDrawer}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Buka navigasi menu">
            <Icon icon={HamburgerMenu} size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Navigation Drawer Modal */}
      <Modal
        visible={isDrawerOpen}
        transparent
        animationType="none"
        onRequestClose={() => closeDrawer()}>
        <View className="flex-1 flex-row justify-end">
          {/* Backdrop Overlay */}
          <Animated.View
            className="absolute inset-0 bg-black/50"
            style={{ opacity: overlayAnim }}>
            <Pressable className="flex-1" onPress={() => closeDrawer()} />
          </Animated.View>

          {/* Side Drawer Panel */}
          <Animated.View
            className="h-full bg-white rounded-l shadow-2xl overflow-hidden flex-col justify-between"
            style={{
              width: drawerWidth,
              transform: [{ translateX: slideAnim }],
            }}>
            {/* Drawer Header: Profil / Status Tamu */}
            <View
              className="bg-primary-50/80 border-b border-primary-100/70 px-5 pb-5"
              style={{ paddingTop: Math.max(insets.top, 16) }}>
              {/* Logo & Tombol Tutup */}
              <View className="flex-row items-center justify-between mb-4">
                <Image
                  source={require('@/assets/images/logo/logo-long-color.png')}
                  className="h-7 w-32"
                  resizeMode="contain"
                />
                <TouchableOpacity
                  className="w-8 h-8 rounded-full bg-white border border-neutral-200/60 items-center justify-center active:bg-neutral-100"
                  onPress={() => closeDrawer()}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Tutup navigasi">
                  <Icon icon={CloseCircle} size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Status Akun */}
              {isAuthenticated && user ? (
                <View className="flex-row items-center gap-3 pt-1">
                  <View className="w-11 h-11 rounded-full bg-primary-500 items-center justify-center shadow-xs">
                    <Text className="text-lg font-bold text-white">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-sm font-bold text-neutral-900"
                      numberOfLines={1}>
                      {user.name || 'Sahabat Kebaikan'}
                    </Text>
                    <Text
                      className="text-xs text-neutral-500 mt-0.5"
                      numberOfLines={1}>
                      {user.email || user.phone || 'Donatur Beramalbersama'}
                    </Text>
                  </View>
                </View>
              ) : (
                <View className="pt-1">
                  <Text className="text-xs text-neutral-600 leading-relaxed mb-3">
                    Masuk akun untuk memantau riwayat donasi & kelola sedekah rutin.
                  </Text>
                  <TouchableOpacity
                    className="bg-primary-500 active:bg-primary-600 py-2.5 px-4 rounded-xl flex-row items-center justify-center gap-2 shadow-xs"
                    onPress={() =>
                      closeDrawer(() =>
                        onPressLogin ? onPressLogin() : navigation.navigate('Login'),
                      )
                    }
                    activeOpacity={0.85}>
                    <Text className="text-xs font-bold text-white tracking-wide">
                      Masuk / Daftar Akun
                    </Text>
                    <Icon icon={Login2} size={15} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* List Menu Section */}
            <ScrollView
              className="flex-1 px-4 py-3"
              showsVerticalScrollIndicator={false}>
              {menuSections.map(section => (
                <View key={section.title} className="mb-4">
                  <Text className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-2 mb-1.5">
                    {section.title}
                  </Text>
                  {section.items.map(item => (
                    <TouchableOpacity
                      key={item.id}
                      className="flex-row items-center justify-between p-3 rounded-2xl active:bg-neutral-50 mb-1"
                      onPress={() => closeDrawer(item.onPress)}
                      activeOpacity={0.75}>
                      <View className="flex-row items-center gap-3 flex-1">
                        <Icon icon={item.icon} size={16} color="#157874" />
                        <View className="flex-1">
                          <Text className="text-sm font-semibold text-neutral-800">
                            {item.label}
                          </Text>
                          <Text className="text-[11px] text-neutral-400 mt-0.5">
                            {item.desc}
                          </Text>
                        </View>
                      </View>
                      <Icon icon={AltArrowRight} size={14} color="#D1D5DB" />
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </ScrollView>

            {/* Drawer Footer: Tombol Keluar jika login */}
            {isAuthenticated && (
              <View
                className="border-t border-neutral-100 px-5 pt-3 pb-3"
                style={{ paddingBottom: Math.max(insets.bottom, 14) }}>
                <TouchableOpacity
                  className="py-3 px-3 mb-3 rounded-lg flex-row items-center justify-center gap-2 border border-red-200 active:bg-red-100"
                  onPress={() => closeDrawer(() => clearAuth())}
                  activeOpacity={0.8}>
                  <Icon icon={Logout2} size={14} color="#DC2626" />
                  <Text className="text-xs font-semibold text-red-500">
                    Keluar Akun
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}
