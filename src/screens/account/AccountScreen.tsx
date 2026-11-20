import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Share,
  Platform,
  RefreshControl,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  User,
  Pen2,
  Wallet,
  ClockCircle,
  Book,
  BookBookmark,
  CalendarMark,
  ChecklistMinimalistic,
  HandHeart,
  Confetti,
  UsersGroupTwoRounded,
  Flag2,
  InfoCircle,
  Document,
  QuestionCircle,
  ChatRoundLine,
  Star,
  Share as ShareIcon,
  Logout2,
  AltArrowRight,
  ShieldCheck,
  History,
  Archive,
  Buildings,
  Flag,
} from '@solar-icons/react-native/Linear';
import {version as appVersion} from '../../../package.json';
import type {AccountNavigationProp, RootStackNavigationProp} from '@/types/navigation';
import {useAccount} from '@/hooks/useAccount';
import {Avatar} from '@/components/ui/Avatar';
import {Icon} from '@/components/ui/Icon';
import {LogoutDialog} from '@/components/shared/LogoutDialog';
import {getMyAccount, type MyAccountData} from '@/services/userService';
import {formatCurrency} from '@/utils/formatCurrency';
import {ENV} from '@/config/env';
import {showToast} from '@/utils/toast';
import {colors} from '@/theme';

async function openWhatsappCs(): Promise<void> {
  const url = `https://wa.me/${ENV.WHATSAPP_CS_NUMBER}`;
  try {
    await Linking.openURL(url);
  } catch {
    showToast('Tidak dapat membuka WhatsApp.');
  }
}

async function openRating(): Promise<void> {
  const url = Platform.OS === 'ios' ? ENV.APP_STORE_URL : ENV.PLAY_STORE_URL;
  try {
    await Linking.openURL(url);
  } catch {
    showToast('Tidak dapat membuka halaman rating.');
  }
}

async function shareApp(): Promise<void> {
  const url = Platform.OS === 'ios' ? ENV.APP_STORE_URL : ENV.PLAY_STORE_URL;
  try {
    await Share.share({message: `Yuk pakai aplikasi Beramal Bersama: ${url}`});
  } catch {
    showToast('Tidak dapat membagikan aplikasi.');
  }
}

export default function AccountScreen(): React.JSX.Element {
  const navigation = useNavigation<AccountNavigationProp>();
  const insets = useSafeAreaInsets();
  const {
    user,
    isAuthenticated,
    isLoggingOut,
    isLogoutDialogVisible,
    openLogoutDialog,
    closeLogoutDialog,
    confirmLogout,
  } = useAccount();

  const [accountData, setAccountData] = useState<MyAccountData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAccount = useCallback(async () => {
    if (!isAuthenticated) {
      setAccountData(null);
      return;
    }
    try {
      const res = await getMyAccount();
      if (res.success && res.data) {
        setAccountData(res.data);
      }
    } catch {
      // fallback silent
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchAccount();
  }, [fetchAccount]);

  async function handleRefresh(): Promise<void> {
    setIsRefreshing(true);
    await fetchAccount();
    setIsRefreshing(false);
  }

  function goToLogin(): void {
    navigation.getParent<RootStackNavigationProp>()?.navigate('Login');
  }

  function goToRegister(): void {
    navigation.getParent<RootStackNavigationProp>()?.navigate('Register');
  }

  function requireAuth(action: () => void): () => void {
    return isAuthenticated ? action : goToLogin;
  }

  function goToQuran(): void {
    const parent = navigation.getParent<RootStackNavigationProp>();
    if (!isAuthenticated) {
      parent?.navigate('Login', {
        redirectTo: {screen: 'QuranWelcome', params: undefined},
      });
      return;
    }
    parent?.navigate('QuranWelcome');
  }

  function goToPrayerSchedule(): void {
    navigation.getParent<RootStackNavigationProp>()?.navigate('PrayerSchedule');
  }

  function goToAmalanHome(): void {
    navigation.getParent<RootStackNavigationProp>()?.navigate('AmalanHome');
  }

  function goToDoaList(): void {
    navigation.getParent<RootStackNavigationProp>()?.navigate('DoaList');
  }

  function goToRenungan(): void {
    navigation.getParent<RootStackNavigationProp>()?.navigate('Renungan');
  }

  function goToEvent(): void {
    navigation.getParent<RootStackNavigationProp>()?.navigate('Event');
  }

  function goToTantangan(): void {
    navigation.getParent<RootStackNavigationProp>()?.navigate('TantanganList');
  }

  function goToDonasiBersama(): void {
    navigation.getParent<RootStackNavigationProp>()?.navigate('DonasiBersamaList');
  }

  async function handleConfirmLogout(): Promise<void> {
    const success = await confirmLogout();
    if (success) {
      navigation
        .getParent<RootStackNavigationProp>()
        ?.reset({index: 0, routes: [{name: 'Home'}]});
    }
  }

  const saldo = accountData?.dompet_kebaikan?.saldo ?? 0;
  const displayName = accountData?.name || user?.name || 'Hamba Allah';
  const displayPhone = accountData?.phone || user?.phone || '';
  const displayEmail = accountData?.email || user?.email || '';
  const avatarUrl = accountData?.img || user?.avatarUrl || null;

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 40}}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary[500]]}
          />
        }>
        {/* ── Belum Login ────────────────────────────────────────── */}
        {!isAuthenticated && (
          <View style={{paddingTop: insets.top}} className="px-4 pt-4 pb-6">
            {/* Header Title */}
            <View className="py-3 items-center justify-center">
              <Text className="text-base font-bold text-slate-900">Akun</Text>
            </View>

            {/* Guest Auth Card */}
            <View className="bg-white rounded-3xl border border-slate-100 p-6 items-center text-center shadow-xs mt-2">
              <View className="w-16 h-16 rounded-full border border-primary-200 bg-primary-50 items-center justify-center mb-4">
                <Icon icon={User} size={30} color={colors.primary[600]} />
              </View>

              <Text className="text-base font-bold text-slate-900 mb-1">
                Masuk ke Akunmu
              </Text>
              <Text className="text-xs text-slate-500 text-center leading-relaxed mb-6 max-w-[240px]">
                Kelola donasi, pantau program, dan akses Saku Kebaikan kamu dengan mudah.
              </Text>

              <TouchableOpacity
                onPress={goToLogin}
                activeOpacity={0.85}
                className="w-full bg-primary-500 active:bg-primary-600 py-3.5 rounded-full items-center justify-center shadow-sm">
                <Text className="text-sm font-bold text-white">Masuk Sekarang</Text>
              </TouchableOpacity>

              <View className="flex-row items-center mt-4">
                <Text className="text-xs text-slate-500">Belum punya akun? </Text>
                <TouchableOpacity onPress={goToRegister}>
                  <Text className="text-xs font-bold text-primary-600">Daftar disini</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* ── Sudah Login: Identity Strip ───────────────────────── */}
        {isAuthenticated && (
          <>
            <View
              style={{paddingTop: insets.top + 8}}
              className="bg-primary-500 px-5 pb-9 relative">
              {/* Edit Profile Button Top-Right */}
              <TouchableOpacity
                onPress={requireAuth(() => navigation.navigate('MyProfile'))}
                activeOpacity={0.7}
                className="absolute top-12 right-5 w-9 h-9 rounded-full bg-white/20 items-center justify-center"
                accessibilityRole="button"
                accessibilityLabel="Ubah Data Profil">
                <Icon icon={Pen2} size={16} color="#ffffff" />
              </TouchableOpacity>

              <View className="flex-row items-center gap-3.5 pr-10">
                <View className="w-14 h-14 rounded-full border-2 border-white/30 overflow-hidden bg-white/20 items-center justify-center">
                  <Avatar uri={avatarUrl} name={displayName} size={54} />
                </View>

                <View className="flex-1 min-w-0">
                  <Text
                    numberOfLines={1}
                    className="text-base font-bold text-white tracking-tight">
                    {displayName}
                  </Text>
                  {Boolean(displayPhone) && (
                    <Text
                      numberOfLines={1}
                      className="text-xs text-white/80 mt-0.5">
                      {displayPhone}
                    </Text>
                  )}
                  {Boolean(displayEmail) && (
                    <Text
                      numberOfLines={1}
                      className="text-xs text-white/70 mt-0.5">
                      {displayEmail}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* Saku Kebaikan (Passbook Style Card) */}
            <View className="-mt-5 px-4 mb-4">
              <View className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <View className="flex-row items-start justify-between px-5 pt-4 pb-3">
                  <View>
                    <Text className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                      Saku Kebaikan
                    </Text>
                    <Text className="mt-1 text-xl font-bold text-slate-900 tracking-tight">
                      {formatCurrency(saldo)}
                    </Text>
                  </View>
                  <View className="w-10 h-10 rounded-full bg-primary-50 items-center justify-center">
                    <Icon icon={Wallet} size={20} color={colors.primary[600]} />
                  </View>
                </View>

                {/* Perforated Divider */}
                <View className="relative border-t border-dashed border-slate-200">
                  <View className="absolute -left-2 -top-2 w-4 h-4 rounded-full bg-slate-50" />
                  <View className="absolute -right-2 -top-2 w-4 h-4 rounded-full bg-slate-50" />
                </View>

                {/* Card Actions */}
                <View className="flex-row divide-x divide-slate-100">
                  <TouchableOpacity
                    onPress={() => {
                      navigation.getParent<RootStackNavigationProp>()?.navigate('RiwayatDonasi');
                    }}
                    activeOpacity={0.7}
                    className="flex-1 py-3 items-center justify-center">
                    <Text className="text-xs font-semibold text-slate-600">
                      Riwayat
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      navigation.getParent<RootStackNavigationProp>()?.navigate('Topup', {
                        redirectAfter: 'home',
                      });
                    }}
                    activeOpacity={0.7}
                    className="flex-1 py-3 items-center justify-center bg-primary-50/40">
                    <Text className="text-xs font-bold text-primary-700">
                      Top Up
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </>
        )}

        {/* ── Menu List Sections ───────────────────────────────── */}
        <View className="px-4 gap-4">
          {/* Section: Menu Pribadi (Hanya Tampil Jika Login) */}
          {isAuthenticated && (
            <View className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-2xs">
              <View className="px-4 py-2.5 border-b border-slate-50">
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Menu Pribadi
                </Text>
              </View>
              <View className="divide-y divide-slate-50">
                <MenuRow
                  icon={User}
                  label="Ubah Data Akun"
                  onPress={requireAuth(() => navigation.navigate('MyProfile'))}
                />
                <MenuRow
                  icon={Archive}
                  label="Donasi Saya"
                  onPress={() => navigation.navigate('MyDonations')}
                />
                <MenuRow
                  icon={CalendarMark}
                  label="Rutin Saya"
                  onPress={() => navigation.navigate('RecurringDonation')}
                />
                <MenuRow
                  icon={History}
                  label="Riwayat Donasi Lengkap"
                  onPress={() =>
                    navigation.getParent<RootStackNavigationProp>()?.navigate('RiwayatDonasi')
                  }
                />
              </View>
            </View>
          )}

          {/* Section: Amalan & Program Kebaikan */}
          <View className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-2xs">
            <View className="px-4 py-2.5 border-b border-slate-50">
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Amalan & Program
              </Text>
            </View>
            <View className="divide-y divide-slate-50">
              <MenuRow icon={BookBookmark} label="Al-Qur'an" onPress={goToQuran} />
              <MenuRow
                icon={ChecklistMinimalistic}
                label="Amalan Harian"
                onPress={goToAmalanHome}
              />
              <MenuRow
                icon={ClockCircle}
                label="Jadwal Sholat"
                onPress={goToPrayerSchedule}
              />
              <MenuRow icon={Book} label="Renungan" onPress={goToRenungan} />
              <MenuRow icon={HandHeart} label="Relung Doa" onPress={goToDoaList} />
              <MenuRow icon={Confetti} label="Event Salur" onPress={goToEvent} />
              <MenuRow
                icon={UsersGroupTwoRounded}
                label="Donasi Bersama"
                onPress={goToDonasiBersama}
              />
              <MenuRow
                icon={Flag2}
                label="Tantangan Amal"
                onPress={goToTantangan}
              />
              <MenuRow
                icon={Flag}
                label="Tema Kebaikan"
                onPress={() =>
                  navigation.getParent<RootStackNavigationProp>()?.navigate('PerTema')
                }
              />
              <MenuRow
                icon={Buildings}
                label="Lembaga Mitra"
                onPress={() =>
                  navigation.getParent<RootStackNavigationProp>()?.navigate('MitraList')
                }
              />
            </View>
          </View>

          {/* Section: Umum */}
          <View className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-2xs">
            <View className="px-4 py-2.5 border-b border-slate-50">
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Umum
              </Text>
            </View>
            <View className="divide-y divide-slate-50">
              <MenuRow
                icon={InfoCircle}
                label="Tentang Kami"
                onPress={() => navigation.navigate('About')}
              />
              <MenuRow
                icon={Document}
                label="Syarat & Ketentuan"
                onPress={() =>
                  navigation.navigate('WebView', {
                    url: ENV.TERMS_URL,
                    title: 'Syarat & Ketentuan',
                  })
                }
              />
              <MenuRow
                icon={ShieldCheck}
                label="Kebijakan Privasi"
                onPress={() =>
                  navigation.navigate('WebView', {
                    url: ENV.PRIVACY_URL,
                    title: 'Kebijakan Privasi',
                  })
                }
              />
              <MenuRow
                icon={QuestionCircle}
                label="Pertanyaan Sering Diajukan (FAQ)"
                onPress={() => navigation.navigate('Faq')}
              />
              <MenuRow
                icon={ChatRoundLine}
                label="Bantuan Customer Service"
                onPress={openWhatsappCs}
              />
              <MenuRow
                icon={Star}
                label="Beri Rating Aplikasi"
                onPress={openRating}
              />
              <MenuRow
                icon={ShareIcon}
                label="Bagikan Aplikasi"
                onPress={shareApp}
              />

              {isAuthenticated && (
                <TouchableOpacity
                  onPress={openLogoutDialog}
                  activeOpacity={0.7}
                  className="flex-row items-center gap-3 px-4 py-3.5 bg-rose-50/40 active:bg-rose-50">
                  <Icon icon={Logout2} size={18} color="#e11d48" />
                  <Text className="flex-1 text-xs font-bold text-rose-600">
                    Keluar dari Akun
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* App Version */}
          <View className="items-center py-4">
            <Text className="text-[11px] text-slate-400">
              Beramal Bersama Mobile v{appVersion}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Logout Dialog */}
      <LogoutDialog
        visible={isLogoutDialogVisible}
        isLoading={isLoggingOut}
        onConfirm={handleConfirmLogout}
        onCancel={closeLogoutDialog}
      />
    </View>
  );
}

interface MenuRowProps {
  icon: any;
  label: string;
  onPress: () => void;
}

function MenuRow({icon, label, onPress}: MenuRowProps): React.JSX.Element {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center gap-3 px-4 py-3.5 active:bg-slate-50">
      <Icon icon={icon} size={18} color={colors.neutral[500]} />
      <Text className="flex-1 text-xs font-medium text-slate-700">{label}</Text>
      <Icon icon={AltArrowRight} size={14} color={colors.neutral[400]} />
    </TouchableOpacity>
  );
}
