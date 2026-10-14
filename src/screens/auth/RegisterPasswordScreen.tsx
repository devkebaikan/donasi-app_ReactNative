import React, {useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Icon} from '@/components/ui/Icon';
import {Eye, EyeClosed} from '@solar-icons/react-native/Linear';
import {HeaderColor} from '@/components/shared/HeaderColor';
import type {
  RootStackNavigationProp,
  RegisterPasswordScreenProps,
} from '@/types/navigation';
import {useRegisterPassword} from '@/hooks/useRegisterPassword';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';

type Props = RegisterPasswordScreenProps;

export default function RegisterPasswordScreen({
  route,
}: Props): React.JSX.Element {
  const {phone} = route.params;
  const navigation = useNavigation<RootStackNavigationProp>();
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
  } = useRegisterPassword(phone);

  async function handleSubmit(): Promise<void> {
    const success = await submit();
    if (success) {
      navigation.replace('Home');
    }
  }

  const isDisabled = isLoading;

  return (
    <View style={styles.root}>
      <HeaderColor title="Buat Password" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView
        style={styles.cardWrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.card}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>Password Baru</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.input,
                    styles.passwordInput,
                    fieldErrors?.password ? styles.inputError : null,
                  ]}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible}
                  placeholder="Password baru"
                  placeholderTextColor={colors.neutral[400]}
                  textContentType="newPassword"
                  returnKeyType="next"
                  onSubmitEditing={() => confirmRef.current?.focus()}
                  accessibilityLabel="Input password baru"
                  accessibilityRole="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={togglePasswordVisible}
                  accessibilityRole="button"
                  accessibilityLabel={
                    isPasswordVisible
                      ? 'Sembunyikan password'
                      : 'Tampilkan password'
                  }>
                  <Icon
                    icon={isPasswordVisible ? EyeClosed : Eye}
                    size={20}
                    color={colors.neutral[400]}
                  />
                </TouchableOpacity>
              </View>
              {fieldErrors?.password ? (
                <Text
                  style={styles.errorText}
                  accessibilityLiveRegion="polite">
                  {fieldErrors.password}
                </Text>
              ) : null}
            </View>

            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>Konfirmasi Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  ref={confirmRef}
                  style={[
                    styles.input,
                    styles.passwordInput,
                    fieldErrors?.password_confirmation
                      ? styles.inputError
                      : null,
                  ]}
                  value={passwordConfirmation}
                  onChangeText={setPasswordConfirmation}
                  secureTextEntry={!isConfirmVisible}
                  placeholder="Konfirmasi password"
                  placeholderTextColor={colors.neutral[400]}
                  textContentType="newPassword"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                  accessibilityLabel="Input konfirmasi password"
                  accessibilityRole="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={toggleConfirmVisible}
                  accessibilityRole="button"
                  accessibilityLabel={
                    isConfirmVisible
                      ? 'Sembunyikan password'
                      : 'Tampilkan password'
                  }>
                  <Icon
                    icon={isConfirmVisible ? EyeClosed : Eye}
                    size={20}
                    color={colors.neutral[400]}
                  />
                </TouchableOpacity>
              </View>
              {fieldErrors?.password_confirmation ? (
                <Text
                  style={styles.errorText}
                  accessibilityLiveRegion="polite">
                  {fieldErrors.password_confirmation}
                </Text>
              ) : null}
            </View>

            <TouchableOpacity
              style={[styles.button, isDisabled ? styles.buttonDisabled : null]}
              onPress={handleSubmit}
              disabled={isDisabled}
              accessibilityRole="button"
              accessibilityLabel="Simpan Password"
              accessibilityState={{disabled: isDisabled}}>
              {isLoading ? (
                <ActivityIndicator color={colors.neutral[0]} />
              ) : (
                <Text style={styles.buttonText}>Simpan Password</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
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
  },
  fieldWrapper: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[700],
    marginBottom: spacing.xs,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.md,
    color: colors.neutral[900],
    backgroundColor: colors.neutral[0],
  },
  inputError: {
    borderColor: colors.semantic.error,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: spacing['4xl'],
  },
  eyeButton: {
    position: 'absolute',
    right: spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    minWidth: 44,
    minHeight: 44,
    alignItems: 'flex-end',
  },
  errorText: {
    marginTop: spacing.xs,
    fontSize: fontSize.sm,
    color: colors.semantic.error,
  },
  button: {
    height: 52,
    backgroundColor: colors.secondary[500],
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  buttonDisabled: {
    backgroundColor: colors.neutral[300],
  },
  buttonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[0],
  },
});
