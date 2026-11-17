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
  time_target: string | number | null;
  nominal_target: number | null;
  nominal_achieved: string | number;
  progress_achieved: string | number;
  is_target_nominal?: boolean;
  remaining_days: number | null;
  mitra: Mitra;
  category: ProgramCategory;
  tipe?: ProgramType;
  isRutin?: boolean;
  isRecommended?: boolean;
  donaturCount?: number;
  createdAt?: string;
  latestNewsAt?: string;
}

