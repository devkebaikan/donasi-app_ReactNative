import {useState, useEffect, useRef, useCallback} from 'react';
import {
  requestResetPassword,
  validateResetPassword,
} from '@/services/authService';
import {showToast} from '@/utils/toast';

type State = {
  otp: string;
  countdown: number;
  isLoadingVerify: boolean;
  isLoadingResend: boolean;
  fieldErrors: Record<string, string> | null;
};

type Actions = {
  setOtp: (value: string) => void;
  verify: (otpValue?: string) => Promise<boolean>;
  resend: () => Promise<void>;
};

export function useForgotPasswordOtp(
  phone: string,
  initialExpiresIn: number,
): State & Actions {
  const [otp, setOtpState] = useState('');
  const [countdown, setCountdown] = useState(initialExpiresIn);
  const [isLoadingVerify, setIsLoadingVerify] = useState(false);
  const [isLoadingResend, setIsLoadingResend] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<
    string,
    string
  > | null>(null);

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

  function setOtp(value: string): void {
    setOtpState(value);
    setFieldErrors(prev => {
      if (!prev || !('otp' in prev)) {
        return prev;
      }
      const next = Object.fromEntries(
        Object.entries(prev).filter(([k]) => k !== 'otp'),
      );
      return Object.keys(next).length ? next : null;
    });
  }

  async function verify(otpValue?: string): Promise<boolean> {
    const code = otpValue ?? otp;
    if (code.length !== 6) {
      setFieldErrors({otp: 'Masukkan 6 digit kode OTP'});
      return false;
    }

    setFieldErrors(null);
    setIsLoadingVerify(true);
    try {
      const response = await validateResetPassword({phone, otp: code});
      if (!response.success) {
        showToast(response.message);
        setFieldErrors(response.data as unknown as Record<string, string>);
        return false;
      }
      return true;
    } catch {
      showToast('Tidak dapat terhubung.');
      return false;
    } finally {
      setIsLoadingVerify(false);
    }
  }

  async function resend(): Promise<void> {
    setFieldErrors(null);
    setOtpState('');
    setIsLoadingResend(true);
    try {
      const response = await requestResetPassword({phone});
      if (!response.success) {
        showToast(response.message);
        return;
      }
      startTimer(response.data.expiresIn);
    } catch {
      showToast('Tidak dapat terhubung.');
    } finally {
      setIsLoadingResend(false);
    }
  }

  return {
    otp,
    countdown,
    isLoadingVerify,
    isLoadingResend,
    fieldErrors,
    setOtp,
    verify,
    resend,
  };
}
