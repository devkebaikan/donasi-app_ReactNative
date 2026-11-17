import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui/Icon';
import { ArrowLeft, DangerCircle } from '@solar-icons/react-native/Linear';
import type {
  RootStackNavigationProp,
  RegisterOtpScreenProps,
} from '@/types/navigation';
import { useRegisterOtp } from '@/hooks/useRegisterOtp';
import { OtpInput } from '@/components/ui/OtpInput';
import { colors } from '@/theme';

type Props = RegisterOtpScreenProps;

export default function RegisterOtpScreen({ route }: Props): React.JSX.Element {
  const { phone, name, email, expiresIn } = route.params;
  const navigation = useNavigation<RootStackNavigationProp>();
  const insets = useSafeAreaInsets();

  const {
    otp,
    countdown,
    isLoadingVerify,
    isLoadingResend,
    fieldErrors,
    setOtp,
    verify,
    resend,
  } = useRegisterOtp(phone, name, email, expiresIn);

  async function handleOtpComplete(value: string): Promise<void> {
    const success = await verify(value);
    if (success) {
      navigation.navigate('RegisterPassword', { phone });
    }
  }

  async function handleVerify(): Promise<void> {
    const success = await verify();
    if (success) {
      navigation.navigate('RegisterPassword', { phone });
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
    <View className="flex-1 bg-neutral-50" style={{ paddingTop: insets.top }}>
      {/* Header Bar */}
      <View className="h-14 flex-row items-center px-4 border-b border-neutral-100 bg-white">
        <TouchableOpacity
          className="w-10 h-10 items-center justify-center -ml-2"
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Icon icon={ArrowLeft} size={22} color={colors.neutral[800]} />
        </TouchableOpacity>
        <Text className="flex-1 text-center font-bold text-base text-neutral-800 -ml-2">
          Verifikasi OTP
        </Text>
        <View className="w-8" />
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerClassName="flex-grow justify-center px-8 py-8"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Logo & Headline */}
          <View className="items-center text-center mb-8">
            <Image
              source={require('@/assets/images/logo/logo-short-color.png')}
              className="h-16 w-16 mb-6"
              resizeMode="contain"
            />
            <Text className="text-lg font-semibold text-gray-800 text-center leading-snug">
              Pastikan Kepemilikan{'\n'}Akun Ini
            </Text>
            <Text className="text-xs text-gray-400 mt-2 text-center">
              Masukkan 6 digit kode yang dikirimkan ke nomor{' '}
              <Text className="font-semibold text-gray-600">{phone}</Text>
            </Text>
          </View>

          {/* Alert Error */}
          {fieldErrors?.otp ? (
            <View className="flex-row items-center gap-2 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 mb-4">
              <Icon icon={DangerCircle} size={18} color="#DC2626" />
              <Text className="flex-1 text-xs text-red-600 font-medium">
                {fieldErrors.otp}
              </Text>
            </View>
          ) : null}

          {/* OTP Input */}
          <View className="w-full items-center mb-6">
            <OtpInput
              value={otp}
              onChange={setOtp}
              onComplete={handleOtpComplete}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className={`w-full bg-primary-500 rounded-full py-4 items-center justify-center ${
              isVerifyDisabled ? 'opacity-60' : 'active:bg-primary-600'
            }`}
            onPress={handleVerify}
            disabled={isVerifyDisabled}
            accessibilityRole="button"
            accessibilityLabel="Verifikasi"
            accessibilityState={{ disabled: isVerifyDisabled }}>
            {isLoadingVerify ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text className="text-white text-sm font-semibold">Verifikasi</Text>
            )}
          </TouchableOpacity>

          {/* Resend Section */}
          <View className="text-center items-center mt-6 gap-y-1">
            <Text className="text-xs text-gray-400">
              Belum menerima kode OTP?
            </Text>
            {!canResend ? (
              <Text className="text-xs text-gray-500">
                Kirim ulang dalam{' '}
                <Text className="font-semibold text-primary-600">
                  {formatCountdown(countdown)}
                </Text>
              </Text>
            ) : (
              <TouchableOpacity
                className="w-full border border-primary-400 rounded-full py-3.5 items-center justify-center mt-2"
                onPress={resend}
                disabled={isLoadingResend}
                accessibilityRole="button"
                accessibilityLabel="Kirim ulang kode OTP">
                {isLoadingResend ? (
                  <ActivityIndicator color={colors.primary[500]} size="small" />
                ) : (
                  <Text className="text-primary-600 text-sm font-semibold">
                    Kirim Ulang Kode
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
