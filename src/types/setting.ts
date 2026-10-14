// Ukuran font seluruh aplikasi. Empat tingkat, sengaja sama dengan tingkat
// ukuran teks arab di menu Quran (`ArabicFontSize`) supaya pilihan yang
// dilihat pengguna di dua tempat itu terasa satu bahasa — meski nilainya
// berbeda: yang ini pengali, yang di Quran ukuran mutlak.
export type AppFontSize = 'small' | 'medium' | 'large' | 'xlarge';

export type DonationReminderFrequency = 'daily' | 'weekly' | 'monthly';

export interface UserSettings {
  isHideName: boolean;
  isHideNominal: boolean;
  isContactable: boolean;
  isReminderEnabled: boolean;
  reminderFrequency: DonationReminderFrequency;
  reminderTime: string;
}
