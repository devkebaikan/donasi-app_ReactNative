import {
  Bill,
  HandHeart,
  House,
  ShieldStar,
  Walking,
  Waterdrop,
} from '@solar-icons/react-native/Linear';
import type {SolarIconComponent} from '@/components/ui/Icon';
import type {AsnafSlug} from '@/types/impact';

// Icon dipetakan dari slug di sini, BUKAN dikirim lewat fixture — nama icon
// adalah urusan tampilan, dan menaruhnya di data berarti mengganti icon harus
// lewat perubahan data. Pola yang sama dipakai src/utils/tantanganIcons.ts.
const ASNAF_ICONS: Record<AsnafSlug, SolarIconComponent> = {
  miskin: House,
  fakir: HandHeart,
  'fi-sabilillah': ShieldStar,
  muallaf: Waterdrop,
  gharimin: Bill,
  'ibnu-sabil': Walking,
};

export function getAsnafIcon(slug: AsnafSlug): SolarIconComponent {
  return ASNAF_ICONS[slug] ?? House;
}
