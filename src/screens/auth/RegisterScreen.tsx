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
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui/Icon';
import {
  ArrowLeft,
  User,
  Phone,
  Letter,
  DangerCircle,
} from '@solar-icons/react-native/Linear';
import type { RootStackNavigationProp } from '@/types/navigation';
import { useRegister } from '@/hooks/useRegister';
import { colors } from '@/theme';

export function RegisterScreen(): React.JSX.Element {
  const navigation = useNavigation<RootStackNavigationProp>();
  const insets = useSafeAreaInsets();
  const phoneRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);

  const {
    name,
    phone,
    email,
    isLoading,
    errorMessage,
    setName,
    setPhone,
    setEmail,
    submit,
  } = useRegister();

  async function handleSubmit(): Promise<void> {
    const result = await submit();
    if (result) {
      navigation.navigate('RegisterOtp', {
        phone,
        name,
        email: email || undefined,
        expiresIn: result.expiresIn,
      });
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
          Register
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
              Mendaftar dan{'\n'}Sebarkan Kebaikan
            </Text>
            <Text className="text-xs text-gray-400 mt-2 text-center">
              Isi data diri kamu untuk mulai berdonasi
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
            {/* Input Nama */}
            <View className="relative flex-row items-center bg-gray-100 rounded-full h-14 px-5 border border-transparent focus:border-primary-400">
              <Icon icon={User} size={20} color={colors.neutral[400]} />
              <TextInput
                className="flex-1 ml-3 text-sm text-gray-800 font-medium p-0"
                value={name}
                onChangeText={setName}
                placeholder="Nama lengkap"
                placeholderTextColor={colors.neutral[400]}
                textContentType="name"
                returnKeyType="next"
                onSubmitEditing={() => phoneRef.current?.focus()}
                accessibilityLabel="Input nama lengkap"
              />
            </View>

            {/* Input Phone */}
            <View className="relative flex-row items-center bg-gray-100 rounded-full h-14 px-5 border border-transparent focus:border-primary-400">
              <Icon icon={Phone} size={20} color={colors.neutral[400]} />
              <TextInput
                ref={phoneRef}
                className="flex-1 ml-3 text-sm text-gray-800 font-medium p-0"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="Nomor telepon"
                placeholderTextColor={colors.neutral[400]}
                autoComplete="tel"
                textContentType="telephoneNumber"
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
                accessibilityLabel="Input nomor telepon"
              />
            </View>

            {/* Input Email (opsional) */}
            <View className="relative flex-row items-center bg-gray-100 rounded-full h-14 px-5 border border-transparent focus:border-primary-400">
              <Icon icon={Letter} size={20} color={colors.neutral[400]} />
              <TextInput
                ref={emailRef}
                className="flex-1 ml-3 text-sm text-gray-800 font-medium p-0"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="Email (opsional)"
                placeholderTextColor={colors.neutral[400]}
                textContentType="emailAddress"
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
                accessibilityLabel="Input email"
              />
            </View>

            {/* Terms text */}
            <Text className="text-xs text-center text-gray-400 leading-relaxed px-2 mt-1">
              Dengan mendaftar berarti kamu setuju dengan{' '}
              <Text className="text-primary-600 font-medium">Syarat & Ketentuan</Text>
              {' '}dan{' '}
              <Text className="text-primary-600 font-medium">Kebijakan Privasi</Text>
              {' '}Beramalbersama.com
            </Text>

            {/* Submit Button */}
            <TouchableOpacity
              className={`w-full bg-primary-500 rounded-full py-4 items-center justify-center mt-2 ${
                isLoading ? 'opacity-60' : 'active:bg-primary-600'
              }`}
              onPress={handleSubmit}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel="Mendaftar"
              accessibilityState={{ disabled: isLoading }}>
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text className="text-white text-sm font-semibold">Mendaftar</Text>
              )}
            </TouchableOpacity>

            {/* Footer: Sudah punya akun? */}
            <TouchableOpacity
              className="mt-3 py-2 items-center"
              onPress={() => navigation.navigate('Login')}
              accessibilityRole="button"
              accessibilityLabel="Sudah punya akun? Login disini">
              <Text className="text-xs text-center text-gray-500">
                Sudah punya akun?{' '}
                <Text className="font-semibold text-primary-600">
                  Login disini
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

export default RegisterScreen;
