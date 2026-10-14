import {
  BookBookmark,
  Flag2,
  HandHeart,
  Moon,
  UsersGroupRounded,
  UsersGroupTwoRounded,
} from '@solar-icons/react-native/Linear';
import type {SolarIconComponent} from '@/components/ui/Icon';

// Server mengirim `iconSlug` per kategori tantangan; pemetaannya ke komponen
// icon ada di client. Pola yang sama dipakai getAmalanIconBySlug di
// @/utils/amalanIcons dan getCategoryIconBySlug di @/utils/categoryIcons.
const TANTANGAN_CATEGORY_ICONS: Record<string, SolarIconComponent> = {
  'book-bookmark': BookBookmark,
  moon: Moon,
  'users-group-rounded': UsersGroupRounded,
  'hand-heart': HandHeart,
  'users-group-two-rounded': UsersGroupTwoRounded,
};

// Slug tak dikenal WAJIB tetap tampil — kategori bisa bertambah dari server
// tanpa rilis app baru, dan chip tanpa icon terlihat seperti bug.
export function getTantanganCategoryIconBySlug(
  slug: string,
): SolarIconComponent {
  return TANTANGAN_CATEGORY_ICONS[slug] ?? Flag2;
}
