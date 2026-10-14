import {useState} from 'react';
import {updateProfile} from '@/services/userService';
import {useAuthStore} from '@/stores/authStore';
import {showToast} from '@/utils/toast';
import type {User} from '@/types/user';

type State = {
  user: User | null;
  name: string;
  email: string;
  fieldErrors: Record<string, string> | null;
  isSaving: boolean;
};

type Actions = {
  setName: (value: string) => void;
  setEmail: (value: string) => void;
  submit: () => Promise<boolean>;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useEditProfile(): State & Actions {
  const user = useAuthStore(s => s.user);
  const updateUser = useAuthStore(s => s.updateUser);

  const [name, setNameState] = useState(user?.name ?? '');
  const [email, setEmailState] = useState(user?.email ?? '');
  const [fieldErrors, setFieldErrors] = useState<Record<
    string,
    string
  > | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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

  function setEmail(value: string): void {
    setEmailState(value);
    clearFieldError('email');
  }

  async function submit(): Promise<boolean> {
    const errors: Record<string, string> = {};
    if (!name || name.trim().length < 2) {
      errors.name = 'Nama minimal 2 karakter';
    }
    if (!email || !EMAIL_REGEX.test(email)) {
      errors.email = 'Masukkan alamat email yang valid';
    }
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return false;
    }

    setIsSaving(true);
    try {
      const response = await updateProfile({name, email});
      if (!response.success) {
        showToast(response.message);
        setFieldErrors(response.data as unknown as Record<string, string>);
        return false;
      }
      updateUser(response.data);
      showToast(response.message);
      return true;
    } catch {
      showToast('Tidak dapat terhubung.');
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  return {
    user,
    name,
    email,
    fieldErrors,
    isSaving,
    setName,
    setEmail,
    submit,
  };
}
