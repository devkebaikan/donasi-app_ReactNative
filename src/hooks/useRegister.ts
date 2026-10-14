import {useState} from 'react';
import {requestOtp} from '@/services/authService';
import {showToast} from '@/utils/toast';

type State = {
  name: string;
  phone: string;
  email: string;
  isLoading: boolean;
  fieldErrors: Record<string, string> | null;
};

type Actions = {
  setName: (value: string) => void;
  setPhone: (value: string) => void;
  setEmail: (value: string) => void;
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
    clearFieldError('name');
  }

  function setPhone(value: string): void {
    setPhoneState(value);
    clearFieldError('phone');
  }

  function setEmail(value: string): void {
    setEmailState(value);
    clearFieldError('email');
  }

  async function submit(): Promise<{expiresIn: number} | null> {
    const errors: Record<string, string> = {};
    if (!name || name.trim().length < 2) {
      errors.name = 'Nama minimal 2 karakter';
    }
    const digits = phone.replace(/\D/g, '');
    if (!digits || digits.length < 10 || digits.length > 13) {
      errors.phone = 'Masukkan nomor telepon yang valid';
    }
    if (email && !EMAIL_REGEX.test(email)) {
      errors.email = 'Masukkan alamat email yang valid';
    }
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return null;
    }

    setIsLoading(true);
    try {
      const response = await requestOtp({
        name,
        phone,
        email: email || undefined,
      });
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

  return {
    name,
    phone,
    email,
    isLoading,
    fieldErrors,
    setName,
    setPhone,
    setEmail,
    submit,
  };
}
