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
  errorMessage: string | null;
};

type Actions = {
  setPhone: (v: string) => void;
  setPassword: (v: string) => void;
  togglePasswordVisible: () => void;
  validateField: (field: 'phone' | 'password') => void;
  clearErrorMessage: () => void;
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const setAccessToken = useAuthStore(s => s.setAccessToken);
  const setUser = useAuthStore(s => s.setUser);

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
    setErrorMessage(null);
    setFieldErrors(prev => clearFieldError(prev, 'phone'));
  }

  function setPassword(v: string): void {
    setPasswordState(v);
    setErrorMessage(null);
    setFieldErrors(prev => clearFieldError(prev, 'password'));
  }

  function clearErrorMessage(): void {
    setErrorMessage(null);
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
    setErrorMessage(null);
    const errors: Record<string, string> = {};
    const digits = phone.replace(/\D/g, '');
    if (!digits || digits.length < 8) {
      errors.phone = 'Masukkan nomor telepon yang valid';
    }
    if (!password) {
      errors.password = 'Masukkan password';
    } else if (password.length < 6) {
      errors.password = 'Password minimal 6 karakter';
    }
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      setErrorMessage('Nomor Telepon atau Password Anda Salah');
      return false;
    }

    const normalizedPhone = digits.startsWith('0') ? digits.slice(1) : digits;

    setIsLoading(true);
    try {
      const response = await login({phone: normalizedPhone, password});

      // Token bisa berada langsung di root (seperti response live API) atau di response.data
      const token =
        response?.access_token ||
        response?.data?.access_token ||
        response?.token ||
        response?.data?.token;

      if (!token) {
        const msg =
          response?.message ||
          response?.error ||
          'Nomor Telepon atau Password Anda Salah';
        setErrorMessage(msg);
        showToast(msg);
        if (response?.data && typeof response?.data === 'object') {
          setFieldErrors(response.data as unknown as Record<string, string>);
        }
        return false;
      }

      setAccessToken(token);

      // Simpan user profile dasar dari response login
      const rawUser =
        response?.data && typeof response?.data === 'object' && !response?.data?.access_token
          ? response.data
          : response;

      const userData = {
        id: String(rawUser?.id ?? ''),
        name: rawUser?.user || rawUser?.name || 'Donatur',
        email: rawUser?.email || '',
        phone: rawUser?.phone || phone,
        avatarUrl: rawUser?.avatarUrl || rawUser?.avatar || rawUser?.img || null,
        role: rawUser?.role || 'donatur',
      };
      setUser(userData);

      return true;
    } catch (err: any) {
      const status = err?.status ?? err?.response?.status;
      let msg = 'Nomor Telepon atau Password Anda Salah';
      if (status === 429) {
        msg = 'Terlalu banyak percobaan. Silakan coba lagi beberapa saat lagi.';
      } else if (err?.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err?.message && !err.message.includes('status code')) {
        msg = err.message;
      }
      setErrorMessage(msg);
      showToast(msg);
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
    errorMessage,
    setPhone,
    setPassword,
    togglePasswordVisible,
    validateField,
    clearErrorMessage,
    submit,
  };
}
