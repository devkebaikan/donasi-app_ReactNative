import {useState} from 'react';
import {createPassword} from '@/services/authService';
import {useAuthStore} from '@/stores/authStore';
import {showToast} from '@/utils/toast';

type State = {
  password: string;
  passwordConfirmation: string;
  isPasswordVisible: boolean;
  isConfirmVisible: boolean;
  isLoading: boolean;
  fieldErrors: Record<string, string> | null;
};

type Actions = {
  setPassword: (value: string) => void;
  setPasswordConfirmation: (value: string) => void;
  togglePasswordVisible: () => void;
  toggleConfirmVisible: () => void;
  submit: () => Promise<boolean>;
};

export function useCreatePassword(phone: string): State & Actions {
  const [password, setPasswordState] = useState('');
  const [passwordConfirmation, setPasswordConfirmationState] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<
    string,
    string
  > | null>(null);

  const setAccessToken = useAuthStore(s => s.setAccessToken);

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

  function setPassword(value: string): void {
    setPasswordState(value);
    clearFieldError('password');
  }

  function setPasswordConfirmation(value: string): void {
    setPasswordConfirmationState(value);
    clearFieldError('password_confirmation');
  }

  function togglePasswordVisible(): void {
    setIsPasswordVisible(v => !v);
  }

  function toggleConfirmVisible(): void {
    setIsConfirmVisible(v => !v);
  }

  async function submit(): Promise<boolean> {
    const errors: Record<string, string> = {};
    if (!password || password.length < 8) {
      errors.password = 'Password minimal 8 karakter';
    }
    if (!passwordConfirmation || passwordConfirmation !== password) {
      errors.password_confirmation = 'Password tidak cocok';
    }
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return false;
    }

    setIsLoading(true);
    try {
      const response = await createPassword({
        phone,
        password,
        password_confirmation: passwordConfirmation,
      });

      const token =
        (response as any)?.access_token ||
        (response as any)?.data?.access_token ||
        (response as any)?.accessToken ||
        (response as any)?.data?.accessToken;

      if (token) {
        setAccessToken(token);
        return true;
      }

      const msg = (response as any)?.message || 'Gagal menyimpan password';
      showToast(msg);
      if ((response as any)?.data && typeof (response as any)?.data === 'object') {
        setFieldErrors((response as any).data as Record<string, string>);
      }
      return false;
    } catch {
      showToast('Tidak dapat terhubung.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  return {
    password,
    passwordConfirmation,
    isPasswordVisible,
    isConfirmVisible,
    isLoading,
    fieldErrors,
    setPassword,
    setPasswordConfirmation,
    togglePasswordVisible,
    toggleConfirmVisible,
    submit,
  };
}
