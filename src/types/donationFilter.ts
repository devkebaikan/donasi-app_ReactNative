export type SortOption =
  | 'terbaru'
  | 'segera-berakhir'
  | 'jumlah-donatur'
  | 'berita-terbaru'
  | 'berakhir';

export type SortDirection = 'asc' | 'desc';

export type ViewMode = 'list' | 'grid';

export const SORT_OPTION_LABEL: Record<SortOption, string> = {
  terbaru: 'Terbaru',
  'segera-berakhir': 'Segera Berakhir',
  'jumlah-donatur': 'Jumlah Donatur',
  'berita-terbaru': 'Berita Terbaru',
  berakhir: 'Berakhir',
};

export const SORT_OPTIONS: SortOption[] = [
  'terbaru',
  'segera-berakhir',
  'jumlah-donatur',
  'berita-terbaru',
  'berakhir',
];
