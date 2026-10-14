import {useState} from 'react';
import {login} from '@/services/authService';
import {useAuthStore} from '@/stores/authStore';
import {showToast} from '@/utils/toast';

type State = {
  phone: string;
  password: string;
  isPasswordVisible: boolean;
  isLoading: boolean;
  fieldErrors: Record<string, string> | null;
};

type Actions = {
  setPhone: (v: string) => void;
  setPassword: (v: string) => void;
  togglePasswordVisible: () => void;
  validateField: (field: 'phone' | 'password') => void;
  submit: () => Promise<boolean>;
};

export function useLogin(): State & Actions {
  const [phone, setPhoneState] = useState('');
  const [password, setPasswordState] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(
    null,
  );

  const setAccessToken = useAuthStore(s => s.setAccessToken);

  function clearFieldError(
    prev: Record<string, string> | null,
    field: string,
  ): Record<string, string> | null {
    if (!prev || !(field in prev)) {
      return prev;
    }
    const next = Object.fromEntries(
      Object.entries(prev).filter(([k]) => k !== field),
    );
    return Object.keys(next).length ? next : null;
  }

  function setPhone(v: string): void {
    setPhoneState(v);
    setFieldErrors(prev => clearFieldError(prev, 'phone'));
  }

  function setPassword(v: string): void {
    setPasswordState(v);
    setFieldErrors(prev => clearFieldError(prev, 'password'));
  }

  function togglePasswordVisible(): void {
    setIsPasswordVisible(v => !v);
  }

  function validateField(field: 'phone' | 'password'): void {
    if (field === 'phone') {
      const digits = phone.replace(/\D/g, '');
      if (phone.length > 0 && digits.length < 8) {
        setFieldErrors(prev => ({...prev, phone: 'Masukkan nomor telepon yang valid'}));
      }
    }
    if (field === 'password') {
      if (password.length > 0 && password.length < 6) {
        setFieldErrors(prev => ({...prev, password: 'Password minimal 6 karakter'}));
      }
    }
  }

  async function submit(): Promise<boolean> {
    const errors: Record<string, string> = {};
    const digits = phone.replace(/\D/g, '');
    if (!digits || digits.length < 8) {
      errors.phone = 'Masukkan nomor telepon yang valid';
    }
    if (!password || password.length < 6) {
      errors.password = 'Password minimal 6 karakter';
    }
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return false;
    }

    setIsLoading(true);
    try {
      const response = await login({phone, password});
      if (!response.success) {
        showToast(response.message);
        setFieldErrors(response.data as unknown as Record<string, string>);
        return false;
      }
      setAccessToken(response.data.access_token);
      return true;
    } catch {
      showToast('Tidak dapat terhubung.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  return {
    phone,
    password,
    isPasswordVisible,
    isLoading,
    fieldErrors,
    setPhone,
    setPassword,
    togglePasswordVisible,
    validateField,
    submit,
  };
}
