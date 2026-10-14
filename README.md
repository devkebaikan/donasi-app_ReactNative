# Donasi App (`bb-mobile`)

Aplikasi mobile donasi, filantropi Islam, dan asisten ibadah harian berbasis **React Native** & **TypeScript**.

---

## 📖 Dokumentasi Teknis Lengkap

Dokumentasi arsitektur sistem, struktur direktori lengkap, penjelasan state management, sistem offline mock engine, panduan integrasi backend, dan panduan pemeliharaan tersedia di:

👉 **[TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md)**

---

## 🚀 Quick Start

### 1. Prasyarat
- Node.js `>= 22.11.0`
- Android Studio (Android SDK / NDK) & JDK 17
- Xcode & CocoaPods (untuk iOS di macOS)

### 2. Instalasi & Setup
```bash
# Clone atau masuk ke direktori proyek
cd donasi_app

# Install dependensi
npm install

# Setup environment
cp .env.example .env

# Install pods (khusus iOS)
cd ios && bundle exec pod install && cd ..
```

### 3. Menjalankan Aplikasi
```bash
# Menjalankan Metro Bundler
npm run start

# Menjalankan di Android
npm run android

# Menjalankan di iOS
npm run ios
```

### 4. Pengecekan Kode & Quality Assurance
```bash
npm run type-check    # TypeScript compiler check
npm run lint          # ESLint code style
npm test              # Unit testing dengan Jest
```

---

## 🛠️ Data Pipeline Scripts
- `npm run quran:data` : Kompilasi dataset Al-Qur'an 114 surah + 6.236 ayat dan tafsir.
- `npm run map:data`   : Konversi batas administrasi provinsi Indonesia ke SVG path.
- `npm run font:check` : Pengecekan kompatibilitas font mushaf Arabic Isep Misbah.

---
*Lihat [TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md) untuk detail arsitektur lengkap.*
