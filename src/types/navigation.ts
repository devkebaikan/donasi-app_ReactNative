import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import type {
  RecurringSetupIntent,
  RecurringFrequency,
} from './recurringDonation';
import type {DoaTab} from './doa';
import type {DonasiBersamaDetailTab} from './donasiBersama';
import type {NominalPreset, DonationPackage} from './programDetail';
import type {PaymentGateway, PaymentMethod, PaymentMethodType} from './payment';
import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import type {
  CompositeNavigationProp,
  NavigatorScreenParams,
} from '@react-navigation/native';

export type MainTabParamList = {
  Home: undefined;
  Donations: {search?: string; categoryId?: number} | undefined;
  MyDonations: undefined;
  // `tab` dipakai supaya screen lain (dan redirect setelah login) bisa mendarat
  // langsung di tab yang benar. Dibaca sekali saat mount, sesudahnya tab
  // dikendalikan state lokal screen.
  // Lihat docs/08-features/donasi-rutin/README.md.
  RecurringDonation: undefined;
  Account: undefined;
};

export type MainTabNavigationProp = BottomTabNavigationProp<MainTabParamList>;

// Dipakai saat chip lokasi di PrayerSchedule ditap: screen pengaturan langsung
// membuka pemilih lokasi, bukan sekadar scroll ke barisnya.
export type PrayerSettingFocus = 'location';

export type QuranProgressTab = 'surah' | 'juz' | 'saved' | 'schedule';

export type QuranTabParamList = {
  QuranHome: undefined;
  QuranSurahList: {search?: string; juz?: number} | undefined;
  QuranProgress: {initialTab?: QuranProgressTab} | undefined;
  QuranSetting: undefined;
};

export type QuranTabNavigationProp =
  BottomTabNavigationProp<QuranTabParamList>;

export type LoginRedirectTarget =
  | {
      screen: 'AlurDonasi';
      params: RootStackParamList['AlurDonasi'];
    }
  | {
      screen: 'DetailProgram';
      params: RootStackParamList['DetailProgram'];
    }
  | {
      screen: 'DetailProjectSalur';
      params: RootStackParamList['DetailProjectSalur'];
    }
  | {
      screen: 'DoaList';
      params: RootStackParamList['DoaList'];
    }
  | {
      screen: 'DoaCreate';
      params: RootStackParamList['DoaCreate'];
    }
  | {
      screen: 'AmalanHome';
      params: RootStackParamList['AmalanHome'];
    }
  | {
      screen: 'DonasiBersamaList';
      params: RootStackParamList['DonasiBersamaList'];
    }
  | {
      screen: 'DonasiBersamaCreate';
      params: RootStackParamList['DonasiBersamaCreate'];
    }
  | {
      screen: 'DonasiBersamaDetail';
      params: RootStackParamList['DonasiBersamaDetail'];
    }
  | {
      screen: 'DonasiBersamaUrun';
      params: RootStackParamList['DonasiBersamaUrun'];
    }
  | {
      screen: 'TantanganList';
      params: RootStackParamList['TantanganList'];
    }
  | {
      screen: 'TantanganDetail';
      params: RootStackParamList['TantanganDetail'];
    }
  | {
      screen: 'TantanganJurnal';
      params: RootStackParamList['TantanganJurnal'];
    }
  | {
      screen: 'DonasiRutinSetup';
      params: RootStackParamList['DonasiRutinSetup'];
    }
  | {
      screen: 'Home';
      params: RootStackParamList['Home'];
    }
  | {
      screen: 'Notifikasi';
      params: RootStackParamList['Notifikasi'];
    }
  | {
      screen: 'NewsDetail';
      params: RootStackParamList['NewsDetail'];
    }
  | {
      screen: 'QuranWelcome';
      params: RootStackParamList['QuranWelcome'];
    };

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Home: NavigatorScreenParams<MainTabParamList> | undefined;
  Login: {redirectTo?: LoginRedirectTarget} | undefined;
  LoginOtpPhone: {redirectTo?: LoginRedirectTarget} | undefined;
  LoginOtpVerify: {
    phone: string;
    expiresIn: number;
    redirectTo?: LoginRedirectTarget;
  };
  ForgotPassword: undefined;
  ForgotPasswordOtp: {
    phone: string;
    expiresIn: number;
  };
  ForgotPasswordCreatePassword: {
    phone: string;
  };
  Register: undefined;
  RegisterOtp: {
    phone: string;
    name: string;
    email?: string;
    expiresIn: number;
  };
  RegisterPassword: {
    phone: string;
  };
  MyProfile: undefined;
  EditProfile: undefined;
  About: undefined;
  Faq: undefined;
  Settings: undefined;
  Notifikasi: undefined;
  Search: undefined;
  DetailProgram: {
    link: string;
    reopenMetodePembayaran?: boolean; // true saat kembali dari LoginScreen — auto-buka bottom sheet metode pembayaran lagi
    preservedAmount?: number; // nominal yang sudah dipilih sebelum redirect ke Login
    preservedNominalLabel?: string; // label baris nominal (mis. "Nama Pilihan", "Paket Sembako x 2") yang sudah dipilih sebelum redirect ke Login
  };
  DetailProjectSalur: {
    projectSalurId: string;
    reopenMetodePembayaran?: boolean; // true saat kembali dari LoginScreen — auto-buka bottom sheet metode pembayaran lagi
    preservedAmount?: number; // nominal yang sudah dipilih sebelum redirect ke Login
    preservedNominalLabel?: string; // label baris nominal yang sudah dipilih sebelum redirect ke Login
  };
  PerLembaga: {
    lembagaId: string;
    lembagaName: string;
  };
  AllProjectSalur: {
    programId: string;
  };
  AllReportSalur: {
    programId: string;
  };
  AlurDonasi: {
    programId: string;
    programTitle: string;
    programImageUrl: string;
    programLink?: string;
    nominalType?: 'biasa' | 'paket';
    presets?: NominalPreset[];
    packages?: DonationPackage[];
    reopenMetodePembayaran?: boolean;
    preservedAmount?: number;
    preservedNominalLabel?: string; // label baris nominal (mis. "Nama Pilihan", "Paket Sembako x 2") yang sudah dipilih duluan
    preservedMethod?: PaymentMethod; // BARU — metode yang sudah dipilih di DetailProgramScreen (nominal & metode dipilih di sana tanpa redirect); kalau ada, AlurDonasiScreen skip kedua bottom sheet dan langsung ke Step 3
    projectSalurId?: string; // dari ProjectSalurTerdekatSection — donasi di-tag ke project salur ini
  };
  PaymentInvoice: {
    donationId: string;
    invoiceId: string;
    paymentMethod: string;
    paymentMethodType?: PaymentMethodType;
    paymentMethodLogoUrl?: string;
    paymentGateway?: PaymentGateway | null;
    checkoutUrl?: string;
    accountNumber?: string;
    accountHolderName?: string;
    bankName?: string;
    amount: number;
    adminFee: number;
    totalAmount: number;
    expiredAt: string;
    paymentInstructions?: string[];
    programId?: string;
    programTitle?: string;
    programImageUrl?: string;
    isNewTransaction?: boolean; // true hanya saat redirect langsung setelah transaksi berhasil dibuat — dipakai untuk munculkan DonationDoaDialog sekali; kalau screen ini dibuka ulang (mis. dari riwayat donasi yang belum dibayar), param ini tidak dikirim sehingga do'a tidak muncul lagi
  };
  // Tanpa param sama sekali = jenis "pilihan" (program dipilihkan admin).
  // `intent` selain 'program' membuat trio program di bawahnya tidak dipakai.
  DonasiRutinSetup: {
    intent?: RecurringSetupIntent;
    programId?: string;
    programTitle?: string;
    programImageUrl?: string;
  } | undefined;
  DonasiRutinJenis: undefined;
  DonasiRutinProgram: undefined;
  Topup: {
    redirectAfter?: 'home' | 'donasi-rutin';
  } | undefined;
  DonasiRutinSukses: {
    programTitle: string;
    amount: number;
    frequency: RecurringFrequency;
  };
  DetailDonasiRutin: {
    recurringId: string;
  };
  News: undefined;
  NewsDetail: {
    articleId: string;
  };
  // Menu Renungan — dua screen biasa, tanpa nested navigator.
  // Nama route Bahasa Indonesia mengikuti `Infak`/`Zakat` dan field `screen`
  // di home.json. Lihat docs/08-features/renungan/README.md.
  // Menu Jejak Kebaikan — dua screen baca-saja, tanpa nested navigator.
  // Lihat docs/08-features/jejak-kebaikan/README.md.
  ImpactMap: undefined;
  // `period` berformat "YYYY-MM". Opsional supaya nanti bisa dibuka langsung
  // ke periode tertentu; saat kosong screen memakai periode terbaru dari API.
  DistributionReport: {period?: string} | undefined;
  Renungan: undefined;
  RenunganDetail: {
    reflectionId: string;
  };
  // Menu Event — satu halaman poster + tombol daftar yang membuka halaman
  // pendaftaran di browser. Tidak ada daftar, tidak ada detail.
  // Lihat docs/08-features/event/event.md.
  Event: undefined;
  // Halaman Per Tema — satu halaman gambar penuh + tombol CTA dinamis.
  // Lihat docs/08-features/donasi/per-tema.md.
  PerTema: undefined;
  // Menu Relung Doa — dua screen biasa, tanpa nested navigator.
  // `initialTab` dipakai saat balik dari DoaCreate supaya langsung mendarat di
  // tab "Doa Saya". Lihat docs/08-features/doa/README.md.
  DoaList: {initialTab?: DoaTab} | undefined;
  DoaCreate: undefined;
  // Menu Amalan Harian — satu screen, form-nya bottom sheet di dalamnya.
  // `date` (ISO "YYYY-MM-DD") dipakai kalau nanti ada entry point yang membuka
  // tanggal tertentu; dari Home dan Akun params-nya undefined dan screen
  // membuka hari ini. Lihat docs/08-features/amalan/README.md.
  AmalanHome: {date?: string} | undefined;
  // Menu Donasi Bersama — screen biasa di RootStack, tanpa nested navigator dan
  // tanpa tab baru di MainTabParamList. Tab "Riwayat Patungan / Tentang Grup"
  // di detail adalah state lokal, bukan Tab.Navigator.
  // Lihat docs/08-features/donasi-bersama/README.md.
  DonasiBersamaList: undefined;
  // groupId ada = mode ubah detail grup; kosong = buat grup baru. Form-nya
  // satu, hanya beda mode.
  DonasiBersamaCreate: {groupId?: string} | undefined;
  // Params-nya membawa data tampilan, bukan cuma groupId: screen sukses tidak
  // memanggil API sama sekali — semuanya sudah ada di response POST.
  DonasiBersamaSukses: {
    groupId: string;
    groupName: string;
    targetAmount: number;
    coverImageUrl: string | null;
  };
  DonasiBersamaDetail: {
    groupId: string;
    initialTab?: DonasiBersamaDetailTab;
  };
  DonasiBersamaInvite: {groupId: string; groupName: string};
  // isCreator dioper dari detail — daftar anggota memakainya untuk menentukan
  // apakah pembukanya boleh mengeluarkan anggota.
  DonasiBersamaMembers: {groupId: string; isCreator: boolean};
  DonasiBersamaMemberDetail: {
    groupId: string;
    memberId: string;
    memberName: string;
    avatarUrl: string | null;
    roleLabel: string;
    // Sudah memperhitungkan tiga syarat sekaligus: pembuka adalah kreator,
    // target bukan kreator, dan target belum pernah urun. Server tetap
    // memeriksa ulang ketiganya.
    canRemove: boolean;
  };
  DonasiBersamaMyContributions: {groupId: string; groupName: string};
  // isCreator dioper dari detail supaya screen batch tidak perlu memuat ulang
  // detail grup hanya untuk memutuskan tombol "Tambah Batch" tampil atau tidak.
  DonasiBersamaBatches: {groupId: string; isCreator: boolean};
  DonasiBersamaBatchContributions: {
    groupId: string;
    batchId: string;
    // Judul header tampil seketika tanpa menunggu request; kalau batch-nya
    // diganti nama dari screen ini, judul ikut nama terbaru dari cache.
    batchLabel: string;
    isCreator: boolean;
  };
  DonasiBersamaUrun: {
    groupId: string;
    groupName: string;
    targetAmount: number;
    coverImageUrl: string | null;
  };
  // Menu Tantangan Amal — lima screen biasa di RootStack, tanpa nested
  // navigator dan tanpa tab baru di MainTabParamList. Menu ini mengumpulkan
  // AMALAN, bukan uang — bedakan dari Donasi Bersama di atas.
  // Lihat docs/08-features/tantangan-amal/README.md.
  TantanganList: undefined;
  // challengeId ada = mode UBAH; kosong = buat tantangan baru. Satu form, dua
  // mode — sama seperti DonasiBersamaCreate.
  TantanganCreate: {challengeId?: string} | undefined;
  TantanganDetail: {challengeId: string};
  // challengeName ikut di params karena dipakai teks berbagi dan
  // accessibilityLabel QR — pemanggilnya sudah punya nama itu, jadi tidak ada
  // request tambahan hanya untuk sebuah nama.
  TantanganInvite: {challengeId: string; challengeName: string};
  // ISO date-only "YYYY-MM-DD", default hari ini.
  TantanganJurnal: {date?: string} | undefined;
  Tracking: {
    donationId: string;
  };
  WebView: {
    url: string;
    title: string;
  };
  Zakat: undefined;
  ZakatKalkulator: undefined;
  Infak: undefined;
  // Menu Sholat — tiga screen biasa, tanpa nested navigator.
  // Lihat docs/08-features/sholat/README.md.
  PrayerSchedule: undefined;
  PrayerSetting: {focus?: PrayerSettingFocus} | undefined;
  Kiblat: undefined;
  QuranWelcome: undefined;
  // Nested tab navigator menu Quran — lihat ADR-002.
  QuranTabs: NavigatorScreenParams<QuranTabParamList> | undefined;
  QuranSearch: undefined;
  QuranChallenge: {challengeId: string};
  QuranMyChallenge: {challengeId: string};
  QuranReader: {surahNumber: number; ayahNumber?: number};
  QuranScheduleDetail: {scheduleId: string};
  QuranScheduleForm: {scheduleId?: string}; // ada id = mode edit
};

export type RootStackNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

export type HomeNavigationProp = CompositeNavigationProp<
  MainTabNavigationProp,
  RootStackNavigationProp
>;

export type AccountNavigationProp = CompositeNavigationProp<
  MainTabNavigationProp,
  RootStackNavigationProp
>;

export type DistributionReportScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'DistributionReport'
>;

export type LoginOtpVerifyScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'LoginOtpVerify'
>;

export type ForgotPasswordOtpScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ForgotPasswordOtp'
>;

export type ForgotPasswordCreatePasswordScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ForgotPasswordCreatePassword'
>;

export type RegisterOtpScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'RegisterOtp'
>;

export type RegisterPasswordScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'RegisterPassword'
>;

export type WebViewScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'WebView'
>;

export type DetailProgramScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'DetailProgram'
>;

export type DetailProjectSalurScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'DetailProjectSalur'
>;

export type PerLembagaScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'PerLembaga'
>;

export type AllProjectSalurScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'AllProjectSalur'
>;

export type AllReportSalurScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'AllReportSalur'
>;

export type AlurDonasiScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'AlurDonasi'
>;

export type PaymentInvoiceScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'PaymentInvoice'
>;

export type DonasiRutinSetupScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'DonasiRutinSetup'
>;

export type DonasiRutinJenisScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'DonasiRutinJenis'
>;

export type DonasiRutinProgramScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'DonasiRutinProgram'
>;

export type TopupScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Topup'
>;

export type DonasiRutinSuksesScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'DonasiRutinSukses'
>;

export type DonasiBersamaSuksesScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'DonasiBersamaSukses'
>;

export type DetailDonasiRutinScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'DetailDonasiRutin'
>;

export type NewsDetailScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'NewsDetail'
>;

export type TrackingScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Tracking'
>;

export type ZakatScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Zakat'
>;

export type ZakatKalkulatorScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ZakatKalkulator'
>;

export type InfakScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Infak'
>;
