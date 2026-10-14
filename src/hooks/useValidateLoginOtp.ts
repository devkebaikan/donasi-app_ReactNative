import {useState, useEffect, useRef, useCallback} from 'react';
import {sendLoginOtp, validateLoginOtp} from '@/services/authService';
import {useAuthStore} from '@/stores/authStore';

type State = {
  otp: string;
  countdown: number;
  isLoadingVerify: boolean;
  isLoadingResend: boolean;
  error: Record<string, string> | null;
  toast: string | null;
};

type Actions = {
  setOtp: (otp: string) => void;
  verify: (otpValue?: string) => Promise<boolean>;
  resend: () => Promise<void>;
  clearToast: () => void;
};

export function useValidateLoginOtp(
  phone: string,
  initialExpiresIn: number,
): State & Actions {
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(initialExpiresIn);
  const [isLoadingVerify, setIsLoadingVerify] = useState(false);
  const [isLoadingResend, setIsLoadingResend] = useState(false);
  const [error, setError] = useState<Record<string, string> | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const setAccessToken = useAuthStore(s => s.setAccessToken);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback((seconds: number): void => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setCountdown(seconds);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    startTimer(initialExpiresIn);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [initialExpiresIn, startTimer]);

  async function verify(otpValue?: string): Promise<boolean> {
    const code = otpValue ?? otp;
    if (code.length !== 6) {
      setError({otp: 'Kode OTP harus 6 digit'});
      return false;
    }

    setError(null);
    setIsLoadingVerify(true);
    try {
      const res = await validateLoginOtp({phone, otp: code});
      if (res.success) {
        setAccessToken(res.data.access_token);
        return true;
      }
      setToast(res.message);
      if (res.data && typeof res.data === 'object') {
        setError(res.data as unknown as Record<string, string>);
      }
      return false;
    } catch {
      setToast('Terjadi kesalahan. Coba lagi.');
      return false;
    } finally {
      setIsLoadingVerify(false);
    }
  }

  async function resend(): Promise<void> {
    setError(null);
    setOtp('');
    setIsLoadingResend(true);
    try {
      const res = await sendLoginOtp({phone});
      if (res.success) {
        startTimer(res.data.expires_in);
      } else {
        setToast(res.message);
      }
    } catch {
      setToast('Terjadi kesalahan. Coba lagi.');
    } finally {
      setIsLoadingResend(false);
    }
  }

  function clearToast(): void {
    setToast(null);
  }

  return {
    otp,
    countdown,
    isLoadingVerify,
    isLoadingResend,
    error,
    toast,
    setOtp,
    verify,
    resend,
    clearToast,
  };
}
