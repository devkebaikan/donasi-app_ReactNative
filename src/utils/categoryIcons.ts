import {
  HandMoney,
  Gift,
  Heart,
  FileText,
  Home,
  MenuDots,
} from '@solar-icons/react-native/Linear';
import type {SolarIconComponent} from '@/components/ui/Icon';

const CATEGORY_ICON_MAP: Record<string, SolarIconComponent> = {
  'hand-coin': HandMoney,
  gift: Gift,
  'flag-outline': Heart,
  school: FileText,
  'building-church-outline': Home,
  'dots-horizontal': MenuDots,
};

const SLUG_TO_ICON_MAP: Record<string, SolarIconComponent> = {
  'zakat': HandMoney,
  'infak': Gift,
  'wakaf': Heart,
  'pendidikan': FileText,
  'masjid-pondok': Home,
  'kesehatan': FileText,
  'hewan': Gift,
  'bencana-alam': Heart,
  'lingkungan': Gift,
  'sosial-kemanusiaan': Heart,
  'sarana-infrastruktur': Home,
  'modal-usaha': HandMoney,
  'lainnya': MenuDots,
  'ramadhan': Gift,
  'tex': MenuDots,
};

export function getCategoryIcon(iconName: string): SolarIconComponent {
  return CATEGORY_ICON_MAP[iconName] ?? MenuDots;
}

export function getCategoryIconBySlug(slug: string): SolarIconComponent {
  return SLUG_TO_ICON_MAP[slug] ?? MenuDots;
}
