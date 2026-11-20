export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string | null;
  dompet_kebaikan?: {
    saldo: number;
  };
}
