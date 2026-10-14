# DOKUMENTASI TEKNIS SISTEM (TECHNICAL ARCHITECTURE & REFERENCE MANUAL)
## Aplikasi Donasi & Ibadah Mobile (`bb-mobile`)

---

## 1. Ringkasan Proyek (Project Overview)

**`bb-mobile`** adalah aplikasi mobile berbasis React Native yang menggabungkan ekosistem filantropi Islam (donasi, zakat, infak, wakaf, donasi bersama) dengan fitur penunjang ibadah harian seorang muslim (Al-Qur'an digital offline lengkap dengan tafsir dan audio murottal, jadwal sholat akurat, kompas arah kiblat, pelacak amalan harian, doa, refleksi spiritual, serta pelaporan dampak sosial berbasis peta interaktif).

### Karakteristik Utama Arsitektur:
- **Offline-First & Zero-Backend Capability (Mock Engine)**: Memiliki adapter mock data internal berbasis memory router (`mockRouter.ts`) dan JSON fixtures lokal, sehingga aplikasi dapat berjalan dan diuji secara penuh tanpa memerlukan koneksi server aktif.
- **Type-Safe Fullstack Standard**: Seluruh domain model, request/response API, alur navigasi, dan state management sepenuhnya diketik menggunakan TypeScript ketat (`strict: true`).
- **Unified Custom Design System**: Mengadopsi palet warna bertema Islami modern (Teal & Coral), tipografi terstandardisasi (Montserrat dan LPMQ Isep Misbah untuk teks mushaf Al-Qur'an), serta sistem penskalaan font dinamis (`textScaling.tsx`) yang ramah aksesibilitas.

---

## 2. Spesifikasi Teknologi (Tech Stack & Environment)

| Komponen | Spesifikasi / Library | Keterangan & Peran |
| :--- | :--- | :--- |
| **Runtime & Framework** | React Native `0.86.0`, React `19.2.3` | Arsitektur modern mobile lintas platform (iOS & Android) |
| **Language** | TypeScript `5.8.3` | Pengetikan statis dan keamanan tipe data seluruh proyek |
| **Runtime Environment**| Node.js `>= 22.11.0` | Sesuai konfigurasi `engines` pada `package.json` |
| **Navigasi** | `@react-navigation/native` `^7.0.14`<br>`@react-navigation/native-stack` `^7.3.10`<br>`@react-navigation/bottom-tabs` `^7.18.4` | Manajemen tumpukan layar (stack), bottom tabs, dan routing |
| **Client State Management** | `zustand` `^5.0.3` + middleware `persist` | State lokal persisten dengan `@react-native-async-storage/async-storage` |
| **Server State & Caching**| `@tanstack/react-query` `^5.101.2` | Data fetching, auto-caching, deduplikasi request, dan sinkronisasi data |
| **HTTP Client** | `axios` `^1.7.9` | Client komunikasi API dengan custom mock adapter |
| **UI Components & Sheets**| `@gorhom/bottom-sheet` `^5.2.14`<br>`react-native-gesture-handler` `^3.0.2`<br>`react-native-reanimated` `^4.7.1` | Modal sheet berperforma tinggi dengan animasi berbasis native thread |
| **Grafik & SVG** | `react-native-svg` `^15.15.5`<br>`react-native-linear-gradient` `^2.8.3`<br>`react-native-qrcode-svg` `^6.3.21` | Render peta GeoJSON interaktif, QR Code donasi, dan kartu gradasi |
| **Media & Perangkat** | `react-native-video` `^6.19.2`<br>`react-native-image-picker` `^8.2.1`<br>`react-native-view-shot` `^5.1.1` | Pemutar audio/video murottal, upload bukti transfer/foto, capture kwitansi |

---

## 3. Struktur Direktori Proyek (Project Structure)

```text
donasi_app/
├── android/                        # Konfigurasi native Android (Gradle, Manifest, Java/Kotlin)
├── ios/                            # Konfigurasi native iOS (Xcode project, Podfile, AppDelegate)
├── scripts/                        # Data pipeline & automation tools
│   ├── build-quran-data.mjs        # Kompilasi data mushaf 114 surah, juz, ayat & tafsir
│   ├── build-map-data.mjs          # Konversi GeoJSON peta Indonesia ke SVG path teroptimasi
│   └── check-arabic-font.mjs       # Validasi nama PostScript font Isep Misbah untuk iOS/Android
├── src/
│   ├── app/                        # Entry point root component & runtime config
│   │   ├── App.tsx                 # Root component yang menyatukan seluruh context provider
│   │   └── textScaling.tsx         # Runtime monkeypatch & context penskalaan ukuran teks
│   ├── assets/                     # Aset statis aplikasi
│   │   ├── fonts/                  # Font Montserrat & LPMQ Isep Misbah (Mushaf Standar)
│   │   ├── images/                 # Banner, ilustrasi, logo brand
│   │   ├── json/                   # Fixture data (indonesia-map.json, mock responses)
│   │   ├── quran/                  # Dataset Al-Qur'an per surah, juz, dan static ayah map
│   │   └── videos/                 # Aset video onboarding / edukasi
│   ├── components/                 # Komponen antarmuka (Design System & Reusable UI)
│   │   ├── shared/                 # Komponen modular spesifik domain (230+ komponen bisnis)
│   │   └── ui/                     # Primitif UI atomik (Button, Input, Avatar, Fab, DotIndicator)
│   ├── config/                     # Konfigurasi aplikasi & environment
│   │   └── env.ts                  # Variabel environment dan switch USE_MOCK_DATA
│   ├── hooks/                      # Custom hooks bisnis & query abstractions (80+ hooks)
│   ├── navigation/                 # Konfigurasi navigasi & tab bar
│   │   ├── RootNavigator.tsx       # Root Native Stack Navigator (semua route aplikasi)
│   │   ├── MainTabNavigator.tsx    # Tab bar utama (Home, Donations, MyDonations, Rutin, Account)
│   │   └── QuranTabNavigator.tsx   # Tab bar khusus Quran (Home, Surah, Progress, Setting)
│   ├── screens/                    # Layar tampilan antarmuka (20 folder domain bisnis)
│   ├── services/                   # Layar komunikasi API, QueryClient, dan Mock Router
│   │   ├── apiClient.ts            # Instance Axios dengan interceptor & mock adapter
│   │   ├── queryClient.ts          # Instance TanStack QueryClient
│   │   ├── mockData/               # Database in-memory lokal (mockState, router, fixtures)
│   │   └── *Service.ts             # Service spesifik per modul (auth, donation, quran, dll)
│   ├── stores/                     # State store global berbasis Zustand
│   ├── theme/                      # Token visual (colors, typography, spacing, radius, shadows)
│   ├── types/                      # Definisi tipe data TypeScript (Domain models & Navigation)
│   └── utils/                      # Helper & utilitas umum (formatDate, currency, kiblat, queryKeys)
├── app.json                        # Metadata Expo / React Native App
├── babel.config.js                 # Konfigurasi Babel & module resolver alias (@/ -> ./src)
├── metro.config.js                 # Konfigurasi Metro bundler
├── package.json                    # Dependensi dan script runner npm
└── tsconfig.json                   # Konfigurasi TypeScript dan path mapping alias
```

---

## 4. Desain Sistem & Tipografi (Design System)

Desain sistem dikelola secara terpusat di `src/theme/` untuk menjamin konsistensi visual:

### 4.1. Skema Warna (`src/theme/colors.ts`)
- **Primary (Teal)**: `#1EB8B1` (500) sebagai identitas utama ketenangan dan amanah, dengan varian `#F4FBFB` (50) hingga `#0E5551` (900).
- **Secondary (Coral)**: `#FD6542` (500) untuk elemen aksi penting, call-to-action (CTA), program mendesak, dan badge perhatian.
- **Neutral Palette**: Skala abu-abu dari `#FFFFFF` (0), `#F9FAFB` (50), `#6B7280` (500), hingga `#111827` (900) dan `#000000` (1000).
- **Semantic Colors**: Sukses (`#16A34A`), Peringatan (`#D97706`), Bahaya/Error (`#DC2626`), Informasi (`#0EA5E9`).
- **Glassmorphism Tokens**: Tersedia token transparansi `glass.tint` (`rgba(255, 255, 255, 0.5)`), `glass.tintHeavy`, dan `glass.border` untuk overlay modern di atas gradien.

### 4.2. Tipografi (`src/theme/typography.ts`)
1. **Font Aplikasi Umum**: Menggunakan keluarga font **Montserrat** (Light, Regular, Medium, SemiBold, Bold) dengan pasangan italic lengkap.
2. **Font Teks Al-Qur'an**: Menggunakan font khusus **`LPMQIsepMisbah`** (font resmi Mushaf Standar Indonesia rilisan Lajnah Pentashihan Mushaf Al-Qur'an Kemenag RI).
   - Memiliki kesesuaian ortografi dengan penulisan tanda baca mushaf di Indonesia.
   - Menggunakan kalkulasi `lineHeight = fontSize * 2` untuk memastikan harakat atas/bawah yang bertumpuk (fathah, kasrah, tanwin, syaddah) tidak terpotong saat dirender.
3. **Penskalaan Aksesibilitas (`src/app/textScaling.tsx`)**:
   - Sistem mengganti primitif `Text` React Native di modul level (`installTextScaling()`).
   - Mendukung 4 skala ukuran font: `small` (0.9x), `medium` (1.0x), `large` (1.15x), `xlarge` (1.3x).
   - Skala ini disimpan di perangkat secara permanen via `settingStore` dan **tidak ikut terhapus** saat pengguna melakukan logout.

---

## 5. Arsitektur Navigasi & Peta Layar (Navigation Architecture)

Navigasi dibangun di atas React Navigation v7 dengan TypeScript strictly typed di `src/types/navigation.ts`.

### 5.1. Struktur Hierarki Root (`src/navigation/RootNavigator.tsx`)
Aplikasi menggunakan `createNativeStackNavigator<RootStackParamList>()`:
```text
RootNavigator (Native Stack)
│
├── Onboarding Flow:
│   ├── Splash (SplashScreen)
│   └── Onboarding (OnboardingScreen)
│
├── Auth Flow:
│   ├── Login (LoginScreen)
│   ├── LoginOtpPhone -> LoginOtpVerify
│   ├── Register -> RegisterOtp -> RegisterPassword
│   └── ForgotPassword -> ForgotPasswordOtp -> ForgotPasswordCreatePassword
│
├── Main App (MainTabNavigator):
│   ├── Home (HomeScreen)
│   ├── Donations (AllDonationsScreen)
│   ├── MyDonations (MyDonationsScreen)
│   ├── RecurringDonation (RecurringDonationScreen)
│   └── Account (AccountScreen)
│
├── Quran Flow (QuranTabNavigator & Detail):
│   ├── QuranWelcome
│   ├── QuranTabs:
│   │   ├── QuranHome (QuranHomeScreen)
│   │   ├── QuranSurahList (QuranSurahListScreen)
│   │   ├── QuranProgress (QuranProgressScreen)
│   │   └── QuranSetting (QuranSettingScreen)
│   ├── QuranSearch
│   ├── QuranReader (QuranReaderScreen)
│   ├── QuranChallenge & QuranMyChallenge
│   └── QuranScheduleDetail & Form
│
├── Fitur Donasi & Transaksi:
│   ├── DetailProgram (DetailProgramScreen)
│   ├── DetailProjectSalur, AllProjectSalur, AllReportSalur
│   ├── PerLembaga & PerTema
│   ├── AlurDonasi (Checkout Nominal & Metode Pembayaran)
│   ├── PaymentInvoice (Instruksi Pembayaran & Status)
│   ├── DonasiRutinSetup, DonasiRutinJenis, DonasiRutinProgram, DonasiRutinSukses
│   ├── Infak & Topup
│   └── Tracking (Pelacakan status transaksi & implementasi)
│
├── Donasi Bersama (Crowdfunding Berkelompok):
│   ├── DonasiBersamaList & DonasiBersamaCreate
│   ├── DonasiBersamaDetail & DonasiBersamaSukses
│   ├── DonasiBersamaMembers & MemberDetail
│   ├── DonasiBersamaInvite, Urun, & MyContributions
│   └── DonasiBersamaBatches & BatchContributions
│
├── Fitur Ibadah & Komunitas:
│   ├── PrayerSchedule, PrayerSetting, Kiblat
│   ├── DoaList & DoaCreate
│   ├── AmalanHome (Daily Checklist)
│   ├── TantanganList, TantanganCreate, TantanganDetail, TantanganJurnal, TantanganInvite
│   ├── Zakat & ZakatKalkulator
│   └── Renungan (ReflectionList & Detail)
│
├── Dampak Sosial & Informasi:
│   ├── ImpactMap (Peta Sebaran Bantuan Interaktif)
│   ├── DistributionReport (Laporan Penyaluran)
│   ├── News & NewsDetail
│   └── Event
│
└── Profil & Pengaturan Akun:
    ├── MyProfile & EditProfile
    ├── Settings
    ├── Faq & About
    ├── Notifikasi
    └── WebView (Syarat & Ketentuan, Kebijakan Privasi)
```

---

## 6. Manajemen State & Penyimpanan Lokal (State Management)

Arsitektur state memisahkan dengan tegas antara **State Sesi Pengguna / Preferensi Klien (Zustand)** dan **State Data Server (React Query)**.

### 6.1. Toko Zustand (`src/stores/`)
Semua store memanfaatkan middleware `persist` yang menyimpan snapshot ke `@react-native-async-storage/async-storage`:

1. **`authStore.ts`**:
   - `accessToken: string | null`
   - `user: User | null`
   - Aksi: `setAccessToken()`, `setUser()`, `updateUser()`, `clearAuth()`.
2. **`settingStore.ts`**:
   - Preferensi Perangkat: `appFontSize` (`small` | `medium` | `large` | `xlarge`) - *tidak di-reset saat logout*.
   - Preferensi Akun: `isHideName` (hamba Allah), `isHideNominal`, `isContactable`, `isReminderEnabled`, `reminderFrequency`, `reminderTime`.
   - Method `reset()` membersihkan preferensi akun saat sesi berakhir.
3. **`prayerSettingStore.ts`**:
   - Konfigurasi hisab waktu sholat: metode perhitungan (Kemenag, MWL, Umm al-Qura, dll.), koreksi menit (ihtiyat), notifikasi alarm tiap waktu sholat (Subuh, Dzuhur, Ashar, Maghrib, Isya).
4. **`quranReadingStore.ts` & `quranSettingStore.ts`**:
   - Riwayat baca terakhir (`lastReadSurah`, `lastReadAyah`).
   - Ukuran font arab, toggle tampilan terjemahan latin/bahasa Indonesia, preferensi qari audio murottal.
5. **Store Lainnya**:
   - `toastStore.ts`: Antrean notifikasi toast mengambang di tingkat aplikasi.
   - `searchStore.ts` & `quranSearchStore.ts`: Riwayat riwayat pencarian program dan ayat.
   - `notificationStore.ts`: Filter dan tanda status baca notifikasi.

### 6.2. Server State (`@tanstack/react-query`)
- Dikonfigurasi dalam `src/services/queryClient.ts` dengan konfigurasi default:
  - `staleTime: 1000 * 60 * 5` (5 menit)
  - `gcTime: 1000 * 60 * 30` (30 menit)
  - `retry: 1`
- **Kunci Kueri Terstandarisasi (`src/utils/queryKeys.ts`)**:
  Menyediakan factory object untuk query key yang konsisten, misalnya `queryKeys.donations.detail(id)`, `queryKeys.quran.surahs()`, `queryKeys.prayers.today(lat, lng)`, dll.
- **Pembersihan Cache Otomatis**: Saat API mengembalikan respons `401 Unauthorized` atau user logout, `queryClient.clear()` otomatis dieksekusi agar data sensitif akun lama tidak tertinggal.

---

## 7. Lapisan Jaringan & Mock Engine (Networking & Data Layer)

Aplikasi memiliki mekanisme jaringan cerdas yang diatur di `src/services/apiClient.ts` dan `src/config/env.ts`.

### 7.1. Mode Mock vs Mode Server Riil
Variabel `USE_MOCK_DATA` di `src/config/env.ts` menentukan adapter yang digunakan Axios:
```typescript
export const USE_MOCK_DATA = true; // Set false untuk beralih ke backend API asli
```

1. **Ketika `USE_MOCK_DATA === true`**:
   - Axios menggunakan custom in-memory adapter (`mockAdapter`).
   - Semua request GET, POST, PUT, DELETE dicegat dan diarahkan ke `resolveMockRequest` di `src/services/mockData/mockRouter.ts`.
   - Menggunakan dataset fixture JSON lokal (`src/assets/json/` & `src/services/mockData/fixtures.ts`).
   - Memberikan simulasi latensi jaringan riil sebesar `300ms` agar transisi loading state dan shimmer skeleton tetap teruji secara visual.
   - Menyimpan mutasi data sementara pada memory runtime (`mockState.ts`), sehingga simulasi tambah donasi, checklist amalan, dan ubah profil bekerja seperti backend aktif.

2. **Ketika `USE_MOCK_DATA === false`**:
   - Axios beroperasi secara normal mengirim HTTP request ke `ENV.API_BASE_URL`.
   - Interceptor menyisipkan token: `Authorization: Bearer <accessToken>`.
   - Interceptor menangani respons error `401 Unauthorized` dengan membersihkan auth state dan query cache.

---

## 8. Modul Bisnis Utama & Fungsionalitas (Core Domains)

### 8.1. Donasi & Infak (`src/screens/donations/`, `src/screens/myDonations/`)
- **Eksplorasi Program**: Katalog program terpilah berdasarkan kategori (Kemanusiaan, Pendidikan, Kesehatan, Dakwah, dll.), program mendesak dengan hitung mundur, dan program per lembaga mitra.
- **Checkout Donasi (`AlurDonasiScreen`)**:
  - Pilihan nominal cepat (quick chip) atau nominal kustom.
  - Opsi Hamba Allah (nama disamarkan di daftar donatur publik).
  - Opsi infak operasional platform tambahan.
  - Pemilihan metode pembayaran (Virtual Account Mandiri, BCA, BNI, BRI, QRIS, E-Wallet GoPay/OVO/ShopeePay).
- **Invoice & Kwitansi (`PaymentInvoiceScreen`)**:
  - Menampilkan batas waktu transfer, nomor rekening / VA, QR Code interaktif, dan rincian kode unik.
  - Fitur salin nomor rekening dan unduh kwitansi transaksi.
- **Donasi Rutin (Autodebit / Subscription)**:
  - Konfigurasi donasi periodik (harian, mingguan, bulanan) pada program terpilih.
  - Pelacak streak rutinitas donasi dan kalender donasi.
- **Tracking Penyaluran Dana (`TrackingScreen`)**:
  - Timeline transparansi dana dari status "Diterima" -> "Terkumpul" -> "Proses Penyaluran" -> "Tersalurkan".
  - Dilengkapi foto dokumentasi lapangan dan profil mitra pelaksana.

### 8.2. Zakat & Kalkulator Zakat (`src/screens/zakat/`)
- Kalkulator zakat otomatis di `src/utils/zakatCalculator.ts`:
  - **Zakat Penghasilan / Profesi**: Berdasarkan nisab beras/emas bulanan dikalikan 2.5%.
  - **Zakat Maal (Harta Simpanan)**: Berdasarkan total tabungan, emas, surat berharga yang telah mencapai haul 1 tahun dan melampaui nisab 85 gram emas.
- Langsung terintegrasi ke alur pembayaran donasi zakat terikat lembaga amil terpercaya.

### 8.3. Donasi Bersama / Urunan (`src/screens/donasiBersama/`)
- Crowdfunding berbasis kelompok atau komunitas (keluarga, alumni, kantor).
- Inisiator membuat target grup dan membagi dalam beberapa termin/batch.
- Mendukung undangan anggota via kode unik / tautan deep link, pelacakan kontribusi per anggota, dan leaderboard kebaikan.

### 8.4. Al-Qur'an Digital (`src/screens/quran/`)
- **100% Offline Capability**: Seluruh teks 114 Surah (6.236 ayat), nomor juz, transliterasi latin, terjemahan Kemenag RI, dan tafsir ringkas tersimpan di lokal storage `src/assets/quran/`.
- **Audio Murottal Player**: Integrasi pemutar audio per ayat atau per surah berkelanjutan dengan berbagai pilihan Qari ternama via `useQuranAudio.ts`.
- **Aksi Ayat (Ayah Actions)**: Bookmark terakhir dibaca, penanda favorit, copy teks Arab/terjemahan, dan bagikan kartu ayat ke media sosial.
- **Target & Challenge Khatam**: Menghitung target tilawah harian berdasarkan jumlah hari atau juz yang ingin diselesaikan, disertai grafik progres kumulatif.

### 8.5. Ibadah Harian: Jadwal Sholat, Kiblat & Amalan
- **Jadwal Sholat (`src/screens/prayer/`)**:
  - Perhitungan matematis astronomi waktu sholat berdasarkan koordinat lintang/bujur pengguna (`src/utils/prayerTime.ts`).
  - Notifikasi hitung mundur menuju waktu sholat berikutnya.
- **Kompas Kiblat (`KiblatScreen`)**:
  - Menghitung azimuth derajat Ka'bah dari koordinat perangkat (`kiblatDirection.ts`).
  - Membaca sensor heading magnetik perangkat secara halus (`useDeviceHeading.ts`) dengan visual kalibrasi akurasi kompas.
- **Amalan Yaumiyah (`src/screens/amalan/`)**:
  - Checklist ibadah harian (Sholat Wajib, Dhuha, Tahajjud, Sedekah Subuh, Rawatib, Tilawah).
  - Ring progres cincin persentase capaian amalan per hari dengan navigasi strip tanggal.

### 8.6. Peta Sebaran Bantuan / Impact Map (`src/screens/impact/`)
- Visualisasi peta vektor SVG batas provinsi Indonesia (`indonesia-map.json`).
- Render dinamis tingkat ketercapaian penyaluran per provinsi (choropleth shading).
- Modal interaktif menampilkan daftar program aktif, total penerima manfaat, dan klasifikasi asnaf zakat yang terbantu.

---

## 9. Skrip Otomasi & Pipeline Data (`scripts/`)

Project menyediakan tiga skrip Node.js esensial untuk memproses dataset besar:

### 9.1. `npm run quran:data` (`scripts/build-quran-data.mjs`)
- Mengonversi sumber dataset Al-Qur'an mentah menjadi file pecahan surah (`src/assets/quran/ayahs/{001..114}.json`) dan tafsir (`src/assets/quran/tafsir/{001..114}.json`).
- Men-generate file `src/assets/quran/ayahMap.ts` yang memuat static require dictionary:
  ```typescript
  // Metro bundler React Native melarang dynamic require(path).
  // Script ini membuat mapping statis otomatis untuk 114 file surah:
  export const AYAH_MAP = {
    1: require('./ayahs/001.json'),
    ...
    114: require('./ayahs/114.json'),
  };
  ```
- Memvalidasi integritas data: memverifikasi bahwa total ayat persis 6.236 dan tidak ada ayat yang terlewat.

### 9.2. `npm run map:data` (`scripts/build-map-data.mjs`)
- Membaca file GeoJSON Natural Earth (skala 1:50m) batas administrasi provinsi Indonesia.
- Melakukan simplifikasi kurva poligon menggunakan algoritma Douglas-Peucker (`SIMPLIFY_TOLERANCE = 0.45`) dan memfilter pulau-pulau mikroskopis (`MIN_RING_AREA = 0.6`).
- Mengubah koordinat geografis menjadi format SVG Path String dengan `viewBox="0 0 1000 420"`, disimpan di `src/assets/json/indonesia-map.json`.

### 9.3. `npm run font:check` (`scripts/check-arabic-font.mjs`)
- Menginspeksi font `.ttf` di `src/assets/fonts/LPMQIsepMisbah.ttf`.
- Memverifikasi nama internal PostScript font agar cocok persis antara definisi di `typography.ts`, file native Android, dan `Info.plist` iOS.

---

## 10. Panduan Instalasi & Menjalankan Proyek (Setup & Run)

### Prasyarat Sistem:
- Node.js versi `22.11.0` atau lebih tinggi
- Java Development Kit (JDK) 17
- Android Studio + Android SDK (API 34 / 35) & NDK
- macOS dengan Xcode 16+ dan CocoaPods (khusus iOS development)

### Langkah Instalasi:

1. **Clone & Install Dependensi**:
   ```bash
   cd donasi_app
   npm install
   ```

2. **Konfigurasi Lingkungan (`.env`)**:
   Salin berkas contoh konfigurasi:
   ```bash
   cp .env.example .env
   ```
   Atur isi file `.env` sesuai kebutuhan development:
   ```properties
   API_BASE_URL=http://localhost:3000
   APP_STORE_URL=https://apps.apple.com/app/idXXXXXXXXX
   PLAY_STORE_URL=https://play.google.com/store/apps/details?id=com.donasi.app
   WHATSAPP_CS_NUMBER=6281234567890
   ```

3. **Install Pods (Khusus iOS)**:
   ```bash
   cd ios && bundle exec pod install && cd ..
   ```

4. **Menjalankan Metro Bundler**:
   ```bash
   npm run start
   ```

5. **Menjalankan di Emulator / Device**:
   - **Android**:
     ```bash
     npm run android
     ```
   - **iOS**:
     ```bash
     npm run ios
     ```

6. **Validasi Kualitas Kode (Linting & Typing)**:
   ```bash
   npm run type-check    # Verifikasi TypeScript kompilasi tanpa error
   npm run lint          # ESLint code style
   npm test              # Menjalankan unit test dengan Jest
   ```

---

## 11. Panduan Pemeliharaan & Pengembangan Lanjutan (Maintenance Guide)

Bagi pengembang yang akan melanjutkan atau memelihara proyek ini, perhatikan panduan teknis berikut:

### 11.1. Menghubungkan ke Backend Nyata (Migrasi dari Mock)
Saat tim backend telah menyediakan REST API yang siap:
1. Buka `src/config/env.ts` dan ubah:
   ```typescript
   export const USE_MOCK_DATA = false;
   ```
2. Pastikan `API_BASE_URL` mengarah ke URL staging atau production backend.
3. Seluruh service di `src/services/*Service.ts` akan langsung memanggil endpoint riil tanpa perlu merombak komponen UI atau hooks, selama kontrak JSON response backend mengikuti skema TypeScript yang telah didefinisikan di `src/types/`.

### 11.2. Menambahkan Fitur Layar Baru (New Screen Workflow)
Ketika menambahkan layar baru:
1. **Definisikan Tipe Navigasi**: Buka `src/types/navigation.ts`, tambahkan nama route dan parameter di `RootStackParamList`.
2. **Buat Komponen Layar**: Buat file screen di folder domain yang sesuai di `src/screens/<domain>/<NamaLayar>Screen.tsx`.
3. **Daftarkan ke Navigator**: Buka `src/navigation/RootNavigator.tsx`, import komponen layar dan tambahkan `<Stack.Screen name="..." component={...} />`.
4. **Gunakan Custom Hook untuk Logika**: Buat hook pendamping di `src/hooks/use<NamaLayar>.ts` untuk memisahkan logic fetching/mutasi dari rendering UI.
5. **Gunakan Primitif UI & Token Desain**: Gunakan komponen dari `src/components/ui` dan warna/tipografi dari `@/theme`. Hindari hardcoding warna hex atau font size arbitrer.

### 11.3. Penanganan Teks Arab & Al-Qur'an
- Selalu gunakan `fontFamily: fontFamily.arabic` untuk ayat Al-Qur'an.
- Selalu berikan kelonggaran `lineHeight` minimal 2x lipat dari `fontSize` untuk teks Arab bertasykil agar harakat fathah dan kasrah ganda tidak terpotong tepi atas/bawah komponen teks.
- Pastikan komponen teks Arab tidak dibungkus dengan transformasi huruf kapital (`textTransform: 'uppercase'` dilarang pada teks Arab).

### 11.4. Menjaga Konsistensi Penskalaan Teks
- Jangan meng-override `allowFontScaling={false}` secara acak di komponen individu karena aplikasi telah mengelola skalabilitas ukuran font global lewat `TextScalingProvider` di `src/app/textScaling.tsx`.

### 11.5. Build Release APK / AAB Android
Sebelum rilis ke Google Play Store:
1. Pastikan nomor `versionCode` dan `versionName` di `android/app/build.gradle` telah dinaikkan.
2. Buat build release:
   ```bash
   cd android && ./gradlew assembleRelease   # Untuk APK standalone testing
   ./gradlew bundleRelease                   # Untuk AAB produksi Play Store
   ```

---

## 12. Ringkasan File Kunci Proyek (Quick File Reference)

| Path Berkas | Fungsi Utama |
| :--- | :--- |
| `src/app/App.tsx` | Entry point utama aplikasi dan penyedia root context |
| `src/app/textScaling.tsx` | Sistem penyesuaian ukuran font global ramah aksesibilitas |
| `src/navigation/RootNavigator.tsx` | Peta rute lengkap dan definisi tumpukan layar aplikasi |
| `src/config/env.ts` | Sakelar `USE_MOCK_DATA` dan konfigurasi environment |
| `src/services/apiClient.ts` | Instance Axios dengan interceptor token dan mock routing |
| `src/services/mockData/mockRouter.ts` | Mesin in-memory router untuk simulasi 50+ endpoint API offline |
| `src/theme/colors.ts` | Master palet warna (Teal, Coral, Grayscale, Semantic, Glass) |
| `src/theme/typography.ts` | Konfigurasi font Montserrat & LPMQ Isep Misbah (Arab) |
| `src/utils/queryKeys.ts` | Daftar kunci kueri TanStack Query yang terstandarisasi |
| `src/assets/quran/ayahMap.ts` | Peta require statis 114 surah Al-Qur'an untuk Metro bundler |

---
*Dokumentasi ini disusun sebagai panduan arsitektur teknis resmi untuk pengembangan, perawatan, dan integrasi lanjutan aplikasi mobile Donasi App (`bb-mobile`).*
