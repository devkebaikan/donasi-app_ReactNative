import {
  BookMinimalistic,
  ChecklistMinimalistic,
  HandHeart,
  HandMoney,
  MoonStars,
  Sun,
} from '@solar-icons/react-native/Linear';
import type {SolarIconComponent} from '@/components/ui/Icon';

// Server mengirim `iconSlug` per preset; pemetaannya ke komponen icon ada di
// client. Pola yang sama dipakai PRAYER_ICONS di PrayerTimeRow dan
// getCategoryIconBySlug di @/utils/categoryIcons.
const AMALAN_ICONS: Record<string, SolarIconComponent> = {
  'moon-stars': MoonStars,
  sun: Sun,
  'hand-money': HandMoney,
  book: BookMinimalistic,
  'hand-heart': HandHeart,
  checklist: ChecklistMinimalistic,
};

// Slug tak dikenal WAJIB tetap tampil — preset bisa bertambah dari server tanpa
// rilis app baru, dan baris tanpa icon terlihat seperti bug.
export function getAmalanIconBySlug(slug: string): SolarIconComponent {
  return AMALAN_ICONS[slug] ?? ChecklistMinimalistic;
}
