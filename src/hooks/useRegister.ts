import {useState} from 'react';
import {requestOtp} from '@/services/authService';
import {showToast} from '@/utils/toast';

type State = {
  name: string;
  phone: string;
  email: string;
  isLoading: boolean;
  fieldErrors: Record<string, string> | null;
  errorMessage: string | null;
};

type Actions = {
  setName: (value: string) => void;
  setPhone: (value: string) => void;
  setEmail: (value: string) => void;
  clearErrorMessage: () => void;
  submit: () => Promise<{expiresIn: number} | null>;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useRegister(): State & Actions {
  const [name, setNameState] = useState('');
  const [phone, setPhoneState] = useState('');
  const [email, setEmailState] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<
    string,
    string
  > | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  function setName(value: string): void {
    setNameState(value);
    setErrorMessage(null);
    clearFieldError('name');
  }

  function setPhone(value: string): void {
    setPhoneState(value);
    setErrorMessage(null);
    clearFieldError('phone');
  }

  function setEmail(value: string): void {
    setEmailState(value);
    setErrorMessage(null);
    clearFieldError('email');
  }

  function clearErrorMessage(): void {
    setErrorMessage(null);
  }

  async function submit(): Promise<{expiresIn: number} | null> {
    setErrorMessage(null);
    const errors: Record<string, string> = {};
    if (!name || name.trim().length < 2) {
      errors.name = 'Nama minimal 2 karakter';
    }
    const digits = phone.replace(/\D/g, '');
    if (!digits || digits.length < 8) {
      errors.phone = 'Masukkan nomor telepon yang valid';
    }
    if (email && !EMAIL_REGEX.test(email)) {
      errors.email = 'Masukkan alamat email yang valid';
    }
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      setErrorMessage('Harap isi semua field yang wajib diisi');
      return null;
    }

    const normalizedPhone = digits.startsWith('0') ? digits.slice(1) : digits;

    setIsLoading(true);
    try {
      const response = await requestOtp({
        name: name.trim(),
        phone: normalizedPhone,
        email: email.trim() || undefined,
      });
      if (!response.success) {
        const msg = response.message || 'Terjadi kesalahan';
        setErrorMessage(msg);
        showToast(msg);
        if (response.data && typeof response.data === 'object') {
          setFieldErrors(response.data as unknown as Record<string, string>);
        }
        return null;
      }
      return {expiresIn: response.data?.expiresIn || 180};
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Terjadi kesalahan';
      setErrorMessage(msg);
      showToast(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  return {
    name,
    phone,
    email,
    isLoading,
    fieldErrors,
    errorMessage,
    setName,
    setPhone,
    setEmail,
    clearErrorMessage,
    submit,
  };
}
