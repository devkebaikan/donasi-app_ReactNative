import {useState} from 'react';
import {sendLoginOtp} from '@/services/authService';

type State = {
  phone: string;
  isLoading: boolean;
  error: Record<string, string> | null;
  toast: string | null;
};

type Actions = {
  setPhone: (phone: string) => void;
  submit: () => Promise<{expiresIn: number} | null>;
  clearToast: () => void;
};

export function useLoginOtp(): State & Actions {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Record<string, string> | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function validate(): boolean {
    const digits = phone.replace(/\D/g, '');
    if (!digits || digits.length < 9) {
      setError({phone: 'Nomor telepon tidak valid'});
      return false;
    }
    return true;
  }

  async function submit(): Promise<{expiresIn: number} | null> {
    setError(null);
    if (!validate()) {
      return null;
    }

    setIsLoading(true);
    try {
      const res = await sendLoginOtp({phone});
      if (res.success) {
        return {expiresIn: res.data.expires_in};
      }
      setToast(res.message);
      if (res.data && typeof res.data === 'object') {
        setError(res.data as unknown as Record<string, string>);
      }
      return null;
    } catch {
      setToast('Terjadi kesalahan. Coba lagi.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  function clearToast(): void {
    setToast(null);
  }

  return {phone, isLoading, error, toast, setPhone, submit, clearToast};
}
