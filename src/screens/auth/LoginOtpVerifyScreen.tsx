import React, {useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {HeaderColor} from '@/components/shared/HeaderColor';
import type {
  RootStackNavigationProp,
  LoginOtpVerifyScreenProps,
} from '@/types/navigation';
import {useValidateLoginOtp} from '@/hooks/useValidateLoginOtp';
import {OtpInput} from '@/components/ui/OtpInput';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';

type Props = LoginOtpVerifyScreenProps;

export default function LoginOtpVerifyScreen({route}: Props): React.JSX.Element {
  const {phone, expiresIn, redirectTo} = route.params;
  const navigation = useNavigation<RootStackNavigationProp>();

  const {
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
  } = useValidateLoginOtp(phone, expiresIn);

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timer = setTimeout(clearToast, 3000);
    return () => clearTimeout(timer);
  }, [toast, clearToast]);

  function goToDestination(): void {
    if (redirectTo) {
      navigation.reset({
        index: 0,
        routes: [{name: redirectTo.screen, params: redirectTo.params}],
      });
    } else {
      navigation.reset({index: 0, routes: [{name: 'Home'}]});
    }
  }

  async function handleOtpComplete(value: string): Promise<void> {
    const success = await verify(value);
    if (success) {
      goToDestination();
    }
  }

  async function handleVerify(): Promise<void> {
    const success = await verify();
    if (success) {
      goToDestination();
    }
  }

  function formatCountdown(seconds: number): string {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  const canResend = countdown === 0 && !isLoadingResend;
  const isVerifyDisabled = isLoadingVerify;

  return (
    <View style={styles.root}>
      <HeaderColor title="Verifikasi OTP" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView
        style={styles.cardWrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.card}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.phoneRow}>
              <Text style={styles.phoneLabel}>Kode dikirim ke </Text>
              <Text style={styles.phoneValue}>{phone}</Text>
              <TouchableOpacity
                style={styles.changeButton}
                onPress={() => navigation.goBack()}
                accessibilityRole="button"
                accessibilityLabel="Ubah nomor telepon">
                <Text style={styles.changeText}>Ubah</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.otpWrapper}>
              <OtpInput
                value={otp}
                onChange={setOtp}
                onComplete={handleOtpComplete}
              />
              {error?.otp ? (
                <Text
                  style={styles.errorText}
                  accessibilityLiveRegion="polite">
                  {error.otp}
                </Text>
              ) : null}
            </View>

            <View style={styles.resendRow}>
              {canResend ? (
                <TouchableOpacity
                  onPress={resend}
                  accessibilityRole="button"
                  accessibilityLabel="Kirim ulang OTP">
                  {isLoadingResend ? (
                    <ActivityIndicator
                      size="small"
                      color={colors.primary[500]}
                    />
                  ) : (
                    <Text style={styles.resendActive}>Kirim ulang</Text>
                  )}
                </TouchableOpacity>
              ) : (
                <Text style={styles.resendDisabled}>
                  Kirim ulang ({formatCountdown(countdown)})
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                isVerifyDisabled ? styles.buttonDisabled : null,
              ]}
              onPress={handleVerify}
              disabled={isVerifyDisabled}
              accessibilityRole="button"
              accessibilityLabel="Verifikasi OTP"
              accessibilityState={{disabled: isVerifyDisabled}}>
              {isLoadingVerify ? (
                <ActivityIndicator color={colors.neutral[0]} />
              ) : (
                <Text style={styles.buttonText}>Verifikasi</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      {toast ? (
        <View style={styles.toast} accessibilityLiveRegion="polite">
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.neutral[0],
  },
  cardWrapper: {
    flex: 1,
  },
  card: {
    flex: 1,
    backgroundColor: colors.primary[50],
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    overflow: 'hidden',
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing['2xl'],
    alignItems: 'center',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: spacing['2xl'],
  },
  phoneLabel: {
    fontSize: fontSize.md,
    color: colors.neutral[500],
  },
  phoneValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  changeButton: {
    marginLeft: spacing.xs,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  changeText: {
    fontSize: fontSize.md,
    color: colors.primary[500],
    fontWeight: fontWeight.medium,
  },
  otpWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  errorText: {
    marginTop: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.semantic.error,
    textAlign: 'center',
  },
  resendRow: {
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  resendActive: {
    fontSize: fontSize.md,
    color: colors.primary[500],
    fontWeight: fontWeight.medium,
  },
  resendDisabled: {
    fontSize: fontSize.md,
    color: colors.neutral[400],
  },
  button: {
    height: 52,
    width: '100%',
    backgroundColor: colors.secondary[500],
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.neutral[300],
  },
  buttonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[0],
  },
  toast: {
    position: 'absolute',
    bottom: spacing['2xl'],
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.neutral[800],
    borderRadius: radius.md,
    padding: spacing.md,
  },
  toastText: {
    color: colors.neutral[0],
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
});
