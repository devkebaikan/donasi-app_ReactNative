export interface Category {
  id: number;
  name: string;
  is_utama: string;
  image: string;
  slug: string;
  is_active: string;
  akun_penerimaan_id: string | null;
  akun_pengeluaran_id: string | null;
  created_at: string;
  updated_at: string;
  image_url: string;
}
