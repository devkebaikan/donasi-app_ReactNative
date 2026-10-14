interface Mitra {
  id: number;
  name: string;
  image: string;
  location: string;
}

interface ProgramCategory {
  id: number;
  name: string;
  slug: string;
  image: string;
}

interface ProgramType {
  id: number;
  name: string;
  slug: string;
  description: string;
}

export interface Program {
  id: number;
  title: string;
  link: string;
  image: string;
  time_target: number | null;
  nominal_target: number;
  nominal_achieved: string | number;
  progress_achieved: string | number;
  remaining_days: number | null;
  mitra: Mitra;
  category: ProgramCategory;
  tipe?: ProgramType;
  // Dari `is_rutin` — menentukan program masuk tab "Pilihan Rutin". Aturannya
  // HARUS sama dengan yang dipakai detail program, kalau tidak ada program yang
  // tampil di tab itu tapi halaman detailnya tanpa tombol "Donasi Rutin".
  // Lihat src/services/mockData/programSeed.ts.
  isRutin: boolean;
  isRecommended?: boolean;
  donaturCount?: number;
  createdAt?: string;
  latestNewsAt?: string;
}
