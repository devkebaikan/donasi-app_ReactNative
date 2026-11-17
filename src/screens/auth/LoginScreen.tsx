import React, { useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui/Icon';
import {
  ArrowLeft,
  Eye,
  EyeClosed,
  Phone,
  LockPassword,
  DangerCircle,
} from '@solar-icons/react-native/Linear';
import type { RootStackNavigationProp, RootStackParamList } from '@/types/navigation';
import { useLogin } from '@/hooks/useLogin';
import { colors } from '@/theme';

export function LoginScreen(): React.JSX.Element {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'Login'>>();
  const redirectTo = route.params?.redirectTo;
  const insets = useSafeAreaInsets();
  const passwordRef = useRef<TextInput>(null);

  const {
    phone,
    password,
    isPasswordVisible,
    isLoading,
    errorMessage,
    setPhone,
    setPassword,
    togglePasswordVisible,
    submit,
  } = useLogin();

  async function handleSubmit(): Promise<void> {
    const success = await submit();
    if (success) {
      if (redirectTo?.screen === 'AlurDonasi') {
        navigation.replace('AlurDonasi', redirectTo.params);
      } else if (redirectTo?.screen === 'DetailProjectSalur') {
        navigation.replace('DetailProjectSalur', redirectTo.params);
      } else if (redirectTo?.screen === 'DoaList') {
        navigation.replace('DoaList', redirectTo.params);
      } else if (redirectTo?.screen === 'DoaCreate') {
        navigation.replace('DoaCreate');
      } else if (redirectTo?.screen === 'AmalanHome') {
        navigation.replace('AmalanHome', redirectTo.params);
      } else if (redirectTo?.screen === 'DonasiBersamaList') {
        navigation.replace('DonasiBersamaList');
      } else if (redirectTo?.screen === 'DonasiBersamaCreate') {
        navigation.replace('DonasiBersamaCreate');
      } else if (redirectTo?.screen === 'DonasiBersamaDetail') {
        navigation.replace('DonasiBersamaDetail', redirectTo.params);
      } else if (redirectTo?.screen === 'DonasiBersamaUrun') {
        navigation.replace('DonasiBersamaUrun', redirectTo.params);
      } else if (redirectTo?.screen === 'TantanganList') {
        navigation.replace('TantanganList', redirectTo.params);
      } else if (redirectTo?.screen === 'TantanganDetail') {
        navigation.replace('TantanganDetail', redirectTo.params);
      } else if (redirectTo?.screen === 'TantanganJurnal') {
        navigation.replace('TantanganJurnal', redirectTo.params);
      } else if (redirectTo?.screen === 'DonasiRutinSetup') {
        navigation.replace('DonasiRutinSetup', redirectTo.params);
      } else if (redirectTo?.screen === 'Home') {
        navigation.replace('Home', redirectTo.params);
      } else if (redirectTo?.screen === 'Notifikasi') {
        navigation.replace('Notifikasi');
      } else if (redirectTo?.screen === 'QuranWelcome') {
        navigation.replace('QuranWelcome');
      } else {
        navigation.replace('Home');
      }
    }
  }

  const canGoBack = navigation.canGoBack();

  return (
    <View className="flex-1 bg-neutral-50" style={{ paddingTop: insets.top }}>
      {/* Header Bar */}
      <View className="h-14 flex-row items-center px-4 border-b border-neutral-100 bg-white">
        {canGoBack ? (
          <TouchableOpacity
            className="w-10 h-10 items-center justify-center -ml-2"
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Kembali"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Icon icon={ArrowLeft} size={22} color={colors.neutral[800]} />
          </TouchableOpacity>
        ) : (
          <View className="w-8" />
        )}
        <Text className="flex-1 text-center font-bold text-base text-neutral-800 -ml-2">
          Login
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
              Setiap Donasi Adalah{'\n'}Langkah Kebaikan
            </Text>
          </View>

          {/* Alert Error Box */}
          {errorMessage ? (
            <View className="flex-row items-center gap-2 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 mb-4">
              <Icon icon={DangerCircle} size={18} color="#DC2626" />
              <Text className="flex-1 text-xs text-red-600 font-medium">
                {errorMessage}
              </Text>
            </View>
          ) : null}

          {/* Form */}
          <View className="gap-y-4">
            {/* Input Phone */}
            <View className="relative flex-row items-center bg-gray-100 rounded-full h-14 px-5 border border-transparent focus:border-primary-400">
              <Icon icon={Phone} size={20} color={colors.neutral[400]} />
              <TextInput
                className="flex-1 ml-3 text-sm text-gray-800 font-medium p-0"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="Nomor telepon"
                placeholderTextColor={colors.neutral[400]}
                autoComplete="tel"
                textContentType="telephoneNumber"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                accessibilityLabel="Input nomor telepon"
              />
            </View>

            {/* Input Password */}
            <View className="relative flex-row items-center bg-gray-100 rounded-full h-14 px-5 border border-transparent focus:border-primary-400">
              <Icon icon={LockPassword} size={20} color={colors.neutral[400]} />
              <TextInput
                ref={passwordRef}
                className="flex-1 ml-3 mr-2 text-sm text-gray-800 font-medium p-0"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
                placeholder="Password"
                placeholderTextColor={colors.neutral[400]}
                textContentType="password"
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
                accessibilityLabel="Input password"
              />
              <TouchableOpacity
                className="p-1"
                onPress={togglePasswordVisible}
                accessibilityRole="button"
                accessibilityLabel={
                  isPasswordVisible
                    ? 'Sembunyikan password'
                    : 'Tampilkan password'
                }>
                <Icon
                  icon={isPasswordVisible ? Eye : EyeClosed}
                  size={20}
                  color={colors.neutral[400]}
                />
              </TouchableOpacity>
            </View>

            {/* Lupa Password */}
            <View className="flex-row justify-end px-2">
              <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword')}
                accessibilityRole="button"
                accessibilityLabel="Lupa password">
                <Text className="text-xs font-medium text-primary-600">
                  Lupa Password?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              className={`w-full bg-primary-500 rounded-full py-4 items-center justify-center mt-2 ${
                isLoading ? 'opacity-60' : 'active:bg-primary-600'
              }`}
              onPress={handleSubmit}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel="Masuk"
              accessibilityState={{ disabled: isLoading }}>
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text className="text-white text-sm font-semibold">Masuk</Text>
              )}
            </TouchableOpacity>

            {/* Masuk dengan OTP */}
            <TouchableOpacity
              className="w-full border border-primary-500 rounded-full py-3.5 items-center justify-center"
              onPress={() => navigation.navigate('LoginOtpPhone', { redirectTo })}
              accessibilityRole="button"
              accessibilityLabel="Masuk dengan OTP">
              <Text className="text-primary-600 text-sm font-semibold">
                Masuk dengan OTP
              </Text>
            </TouchableOpacity>

            {/* Footer: Belum punya akun? */}
            <TouchableOpacity
              className="mt-4 py-2 items-center"
              onPress={() => navigation.navigate('Register')}
              accessibilityRole="button"
              accessibilityLabel="Belum punya akun? Daftar disini">
              <Text className="text-xs text-center text-gray-500">
                Belum punya akun?{' '}
                <Text className="font-semibold text-primary-600">
                  Daftar disini
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
