import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Share,
  Platform,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  User,
  Bell,
  Book,
  BookBookmark,
  CalendarMark,
  ChecklistMinimalistic,
  ClockCircle,
  Confetti,
  Flag,
  HandHeart,
  MapPoint,
  UsersGroupTwoRounded,
  Flag2,
  Settings,
  DocumentText,
  InfoCircle,
  Document,
  Lock,
  QuestionCircle,
  ChatRoundLine,
  Star,
  Share as ShareIcon,
} from '@solar-icons/react-native/Linear';
import {version as appVersion} from '../../../package.json';
import type {AccountNavigationProp, RootStackNavigationProp} from '@/types/navigation';
import {useAccount} from '@/hooks/useAccount';
import {Avatar} from '@/components/ui/Avatar';
import {AccountMenuSection} from '@/components/shared/AccountMenuSection';
import {AccountMenuItem} from '@/components/shared/AccountMenuItem';
import {LogoutDialog} from '@/components/shared/LogoutDialog';
import {ENV} from '@/config/env';
import {showToast} from '@/utils/toast';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';

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
    await Share.share({message: `Yuk pakai aplikasi ini: ${url}`});
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

  function goToLogin(): void {
    navigation.getParent<RootStackNavigationProp>()?.navigate('Login');
  }

  function requireAuth(action: () => void): () => void {
    return isAuthenticated ? action : goToLogin;
  }

  // Menu Quran wajib login. Guest dikirim ke Login dengan redirectTo supaya
  // setelah berhasil masuk langsung mendarat di QuranWelcome, bukan di Home.
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

  // Menu Sholat tidak wajib login — guest langsung masuk, tanpa redirect.
  function goToPrayerSchedule(): void {
    navigation.getParent<RootStackNavigationProp>()?.navigate('PrayerSchedule');
  }

  // Wajib login, tapi redirect-nya TIDAK di sini — AmalanHomeScreen sendiri
  // yang menampilkan auth gate, sama seperti NotifikasiScreen. Pengguna berhak
  // melihat menu apa yang ia dapat setelah masuk.
  function goToAmalanHome(): void {
    navigation.getParent<RootStackNavigationProp>()?.navigate('AmalanHome');
  }

  // Relung Doa boleh dibuka guest — tab "Semua Doa" tidak butuh login, jadi
  // tidak ada redirect di sini. Tab lain menampilkan auth gate sendiri.
  function goToDoaList(): void {
    navigation.getParent<RootStackNavigationProp>()?.navigate('DoaList');
  }

  // Renungan terbuka untuk guest, sama seperti sebelumnya saat masih di
  // MenuUtamaGrid Home.
  function goToRenungan(): void {
    navigation.getParent<RootStackNavigationProp>()?.navigate('Renungan');
  }

  // Event terbuka untuk guest — posternya tidak butuh identitas, dan
  // pendaftarannya sendiri terjadi di web penyelenggara.
  // Boleh dibuka guest — data publik lembaga, tidak ada redirect. Pola yang
  // sama dengan goToDoaList.
  function goToJejakKebaikan(): void {
    navigation.getParent<RootStackNavigationProp>()?.navigate('ImpactMap');
  }

  function goToEvent(): void {
    navigation.getParent<RootStackNavigationProp>()?.navigate('Event');
  }

  // Tema kebaikan juga terbuka untuk guest — isinya konten kampanye, dan
  // aksinya berujung ke web atau ke halaman program yang sudah publik.
  function goToPerTema(): void {
    navigation.getParent<RootStackNavigationProp>()?.navigate('PerTema');
  }

  // Donasi Bersama boleh dibuka guest — daftar grup publik tidak butuh login.
  // Aksi yang butuh identitas (buat grup, gabung, urun) di-gate di dalam menu.
  // Boleh dibuka guest — daftar tantangan publik tidak butuh login, jadi tidak
  // ada redirect di sini. Pola yang sama dengan goToDonasiBersama.
  function goToTantangan(): void {
    navigation.getParent<RootStackNavigationProp>()?.navigate('TantanganList');
  }

  function goToDonasiBersama(): void {
    navigation
      .getParent<RootStackNavigationProp>()
      ?.navigate('DonasiBersamaList');
  }

  async function handleConfirmLogout(): Promise<void> {
    const success = await confirmLogout();
    if (success) {
      navigation
        .getParent<RootStackNavigationProp>()
        ?.reset({index: 0, routes: [{name: 'Home'}]});
    }
  }

  return (
    <View style={[styles.root, {paddingTop: insets.top}]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        {isAuthenticated ? (
          <View style={styles.header}>
            <Avatar
              uri={user?.avatarUrl ?? null}
              name={user?.name ?? ''}
              size={80}
            />
            <Text style={styles.name}>{user?.name ?? '-'}</Text>
            <Text style={styles.contact}>
              {user?.email ?? user?.phone ?? '-'}
            </Text>
          </View>
        ) : (
          <View style={styles.header}>
            <Avatar uri={null} name="" size={80} />
            <Text style={styles.name}>Tamu</Text>
            <Text style={styles.contact}>
              Masuk untuk akses semua fitur akun
            </Text>
            <TouchableOpacity
              style={styles.loginLink}
              onPress={goToLogin}
              accessibilityRole="button"
              accessibilityLabel="Masuk">
              <Text style={styles.loginLinkText}>Masuk</Text>
            </TouchableOpacity>
          </View>
        )}

        <AccountMenuSection title="Akun saya">
          <AccountMenuItem
            icon={User}
            label="Profil saya"
            onPress={requireAuth(() => navigation.navigate('MyProfile'))}
          />
          <AccountMenuItem
            icon={Bell}
            label="Notifikasi"
            onPress={() => navigation.navigate('Notifikasi')}
          />
          <AccountMenuItem
            icon={Settings}
            label="Pengaturan"
            onPress={() => navigation.navigate('Settings')}
          />
        </AccountMenuSection>

        <AccountMenuSection title="Amalan">
          <AccountMenuItem
            icon={BookBookmark}
            label="Quran"
            onPress={goToQuran}
          />
          <AccountMenuItem
            icon={ChecklistMinimalistic}
            label="Amalan Harian"
            onPress={goToAmalanHome}
          />
          <AccountMenuItem
            icon={ClockCircle}
            label="Jadwal Sholat"
            onPress={goToPrayerSchedule}
          />
          <AccountMenuItem
            icon={Book}
            label="Renungan"
            onPress={goToRenungan}
          />
          <AccountMenuItem
            icon={HandHeart}
            label="Relung Doa"
            onPress={goToDoaList}
          />
          <AccountMenuItem icon={Confetti} label="Event" onPress={goToEvent} />
          <AccountMenuItem
            icon={Flag}
            label="Tema Kebaikan"
            onPress={goToPerTema}
          />
          <AccountMenuItem
            icon={UsersGroupTwoRounded}
            label="Donasi Bersama"
            onPress={goToDonasiBersama}
          />
          <AccountMenuItem
            icon={Flag2}
            label="Tantangan Amal"
            onPress={goToTantangan}
          />
          <AccountMenuItem
            icon={CalendarMark}
            label="Donasi Rutin"
            onPress={() => navigation.navigate('RecurringDonation')}
          />
        </AccountMenuSection>

        <AccountMenuSection title="Seputar Aplikasi">
          <AccountMenuItem
            icon={MapPoint}
            label="Jejak Kebaikan"
            onPress={goToJejakKebaikan}
          />
          <AccountMenuItem
            icon={DocumentText}
            label="Berita"
            onPress={() => navigation.navigate('News')}
          />
          <AccountMenuItem
            icon={InfoCircle}
            label="Tentang Aplikasi"
            onPress={() => navigation.navigate('About')}
          />
          <AccountMenuItem
            icon={Document}
            label="Syarat & Ketentuan"
            onPress={() =>
              navigation.navigate('WebView', {
                url: ENV.TERMS_URL,
                title: 'Syarat & Ketentuan',
              })
            }
          />
          <AccountMenuItem
            icon={Lock}
            label="Kebijakan Privasi"
            onPress={() =>
              navigation.navigate('WebView', {
                url: ENV.PRIVACY_URL,
                title: 'Kebijakan Privasi',
              })
            }
          />
          <AccountMenuItem
            icon={QuestionCircle}
            label="Pertanyaan sering diajukan"
            onPress={() => navigation.navigate('Faq')}
          />
          <AccountMenuItem
            icon={ChatRoundLine}
            label="Butuh bantuan?"
            onPress={openWhatsappCs}
          />
          <AccountMenuItem
            icon={Star}
            label="Berikan Rating"
            onPress={openRating}
          />
          <AccountMenuItem
            icon={ShareIcon}
            label="Bagikan aplikasi"
            onPress={shareApp}
          />
        </AccountMenuSection>

        {isAuthenticated ? (
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={openLogoutDialog}
            accessibilityRole="button"
            accessibilityLabel="Keluar">
            <Text style={styles.logoutText}>Keluar</Text>
          </TouchableOpacity>
        ) : null}

        <Text style={styles.version}>Versi Aplikasi {appVersion}</Text>
      </ScrollView>

      <LogoutDialog
        visible={isLogoutDialogVisible}
        isLoading={isLoggingOut}
        onConfirm={handleConfirmLogout}
        onCancel={closeLogoutDialog}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.xs,
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
  contact: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
  },
  loginLink: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginLinkText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.primary[500],
  },
  logoutButton: {
    height: 48,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.semantic.error,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  logoutText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.semantic.error,
  },
  version: {
    textAlign: 'center',
    marginTop: spacing.xl,
    fontSize: fontSize.xs,
    color: colors.neutral[400],
  },
});
