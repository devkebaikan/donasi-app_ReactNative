import {useState} from 'react';
import {requestResetPassword} from '@/services/authService';
import {showToast} from '@/utils/toast';

type State = {
  phone: string;
  isLoading: boolean;
  fieldErrors: Record<string, string> | null;
};

type Actions = {
  setPhone: (value: string) => void;
  submit: () => Promise<{expiresIn: number} | null>;
};

export function useForgotPassword(): State & Actions {
  const [phone, setPhoneState] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<
    string,
    string
  > | null>(null);

  function clearFieldError(field: string): void {
    setFieldErrors(prev => {
      if (!prev || !(field in prev)) {
        return prev;
      }
      const next = Object.fromEntries(
        Object.entries(prev).filter(([k]) => k !== field),
      );
      return Object.keys(next).length ? next : null;
    });
  }

  function setPhone(value: string): void {
    setPhoneState(value);
    clearFieldError('phone');
  }

  async function submit(): Promise<{expiresIn: number} | null> {
    const digits = phone.replace(/\D/g, '');
    if (!digits || digits.length < 10 || digits.length > 13) {
      setFieldErrors({phone: 'Masukkan nomor telepon yang valid'});
      return null;
    }

    setIsLoading(true);
    try {
      const response = await requestResetPassword({phone});
      if (!response.success) {
        showToast(response.message);
        setFieldErrors(response.data as unknown as Record<string, string>);
        return null;
      }
      return {expiresIn: response.data.expiresIn};
    } catch {
      showToast('Tidak dapat terhubung.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  return {phone, isLoading, fieldErrors, setPhone, submit};
}
