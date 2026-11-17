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
  Eye,
  EyeClosed,
  LockPassword,
  DangerCircle,
} from '@solar-icons/react-native/Linear';
import type {
  RootStackNavigationProp,
  ForgotPasswordCreatePasswordScreenProps,
} from '@/types/navigation';
import { useCreatePassword } from '@/hooks/useCreatePassword';
import { colors } from '@/theme';

type Props = ForgotPasswordCreatePasswordScreenProps;

export default function ForgotPasswordCreatePasswordScreen({
  route,
}: Props): React.JSX.Element {
  const { phone } = route.params;
  const navigation = useNavigation<RootStackNavigationProp>();
  const insets = useSafeAreaInsets();
  const confirmRef = useRef<TextInput>(null);

  const {
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
  } = useCreatePassword(phone);

  async function handleSubmit(): Promise<void> {
    const success = await submit();
    if (success) {
      navigation.replace('Home');
    }
  }

  const isDisabled = isLoading;
  const errorMessage =
    fieldErrors?.password || fieldErrors?.password_confirmation || null;

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
          Buat Password Baru
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
              Buat Password{'\n'}Baru
            </Text>
            <Text className="text-xs text-gray-400 mt-2 text-center">
              Password digunakan untuk masuk ke akun{' '}
              <Text className="font-semibold text-gray-600">{phone}</Text>
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
            {/* Input Password */}
            <View className="relative flex-row items-center bg-gray-100 rounded-full h-14 px-5 border border-transparent focus:border-primary-400">
              <Icon icon={LockPassword} size={20} color={colors.neutral[400]} />
              <TextInput
                className="flex-1 ml-3 mr-2 text-sm text-gray-800 font-medium p-0"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
                placeholder="Password baru"
                placeholderTextColor={colors.neutral[400]}
                textContentType="newPassword"
                returnKeyType="next"
                onSubmitEditing={() => confirmRef.current?.focus()}
                accessibilityLabel="Input password baru"
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

            {/* Input Konfirmasi Password */}
            <View className="relative flex-row items-center bg-gray-100 rounded-full h-14 px-5 border border-transparent focus:border-primary-400">
              <Icon icon={LockPassword} size={20} color={colors.neutral[400]} />
              <TextInput
                ref={confirmRef}
                className="flex-1 ml-3 mr-2 text-sm text-gray-800 font-medium p-0"
                value={passwordConfirmation}
                onChangeText={setPasswordConfirmation}
                secureTextEntry={!isConfirmVisible}
                placeholder="Konfirmasi password"
                placeholderTextColor={colors.neutral[400]}
                textContentType="newPassword"
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
                accessibilityLabel="Input konfirmasi password"
              />
              <TouchableOpacity
                className="p-1"
                onPress={toggleConfirmVisible}
                accessibilityRole="button"
                accessibilityLabel={
                  isConfirmVisible
                    ? 'Sembunyikan konfirmasi password'
                    : 'Tampilkan konfirmasi password'
                }>
                <Icon
                  icon={isConfirmVisible ? Eye : EyeClosed}
                  size={20}
                  color={colors.neutral[400]}
                />
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              className={`w-full bg-primary-500 rounded-full py-4 items-center justify-center mt-3 ${
                isDisabled ? 'opacity-60' : 'active:bg-primary-600'
              }`}
              onPress={handleSubmit}
              disabled={isDisabled}
              accessibilityRole="button"
              accessibilityLabel="Simpan & Masuk"
              accessibilityState={{ disabled: isDisabled }}>
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text className="text-white text-sm font-semibold">
                  Simpan & Masuk
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
