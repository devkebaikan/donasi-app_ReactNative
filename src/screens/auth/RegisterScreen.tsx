import React, { useRef } from 'react';
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
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui/Icon';
import { ArrowLeft, HandHeart } from '@solar-icons/react-native/Linear';
import { FloatingOrbs } from '@/components/shared/FloatingOrbs';
import type { RootStackNavigationProp } from '@/types/navigation';
import { useRegister } from '@/hooks/useRegister';
import { colors, spacing, radius, fontSize, fontWeight, shadows, authGradient } from '@/theme';

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
    fieldErrors,
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
    <View style={styles.container}>
      <LinearGradient
        colors={authGradient.colors}
        // locations={authGradient.locations}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      />
      <FloatingOrbs />

      {canGoBack ? (
        <TouchableOpacity
          style={[styles.backButton, { top: insets.top + spacing.sm }]}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Kembali">
          <Icon icon={ArrowLeft} size={22} color={colors.primary[700]} />
        </TouchableOpacity>
      ) : null}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + spacing['4xl'] },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          <View style={styles.logoSection}>
            <View style={styles.logoMark}>
              <Icon icon={HandHeart} size={40} color={colors.primary[500]} />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>
              <Text style={styles.titleAccent}>Daftar</Text>
              {' akun baru.'}
            </Text>

            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>Nama Lengkap</Text>
              <TextInput
                style={[styles.input, fieldErrors?.name ? styles.inputError : null]}
                value={name}
                onChangeText={setName}
                placeholder="Nama lengkap"
                placeholderTextColor={colors.neutral[400]}
                textContentType="name"
                returnKeyType="next"
                onSubmitEditing={() => phoneRef.current?.focus()}
                accessibilityLabel="Input nama lengkap"
                accessibilityRole="none"
              />
              {fieldErrors?.name ? (
                <Text style={styles.errorText} accessibilityLiveRegion="polite">
                  {fieldErrors.name}
                </Text>
              ) : null}
            </View>

            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>Nomor Telepon</Text>
              <TextInput
                ref={phoneRef}
                style={[styles.input, fieldErrors?.phone ? styles.inputError : null]}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="Masukkan nomor telepon"
                placeholderTextColor={colors.neutral[400]}
                autoComplete="off"
                textContentType="telephoneNumber"
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
                accessibilityLabel="Input nomor telepon"
                accessibilityRole="none"
              />
              {fieldErrors?.phone ? (
                <Text style={styles.errorText} accessibilityLiveRegion="polite">
                  {fieldErrors.phone}
                </Text>
              ) : null}
            </View>

            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>Email (opsional)</Text>
              <TextInput
                ref={emailRef}
                style={[styles.input, fieldErrors?.email ? styles.inputError : null]}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="nama@email.com"
                placeholderTextColor={colors.neutral[400]}
                textContentType="emailAddress"
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
                accessibilityLabel="Input email"
                accessibilityRole="none"
              />
              {fieldErrors?.email ? (
                <Text style={styles.errorText} accessibilityLiveRegion="polite">
                  {fieldErrors.email}
                </Text>
              ) : null}
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading ? styles.buttonDisabled : null]}
              onPress={handleSubmit}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel="Daftar"
              accessibilityState={{ disabled: isLoading }}>
              {isLoading ? (
                <ActivityIndicator color={colors.neutral[0]} />
              ) : (
                <Text style={styles.buttonText}>Daftar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginRow}
              onPress={() => navigation.navigate('Login')}
              accessibilityRole="button"
              accessibilityLabel="Sudah punya akun? Masuk">
              <Text style={styles.loginText}>
                Sudah punya akun?{' '}
                <Text style={styles.loginLink}>Masuk</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[0],
  },
  flex: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 999,
  },
  backButton: {
    position: 'absolute',
    left: spacing.lg,
    zIndex: 10,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  logoSection: {
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  logoMark: {
    width: 88,
    height: 88,
    borderRadius: radius.full,
    backgroundColor: colors.primary[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.primary[200],
    borderRadius: radius['2xl'],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['2xl'],
    gap: spacing.md,
    ...shadows.sm,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
  titleAccent: {
    color: colors.primary[500],
  },
  fieldWrapper: {
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[700],
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.primary[200],
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.md,
    color: colors.neutral[900],
    backgroundColor: colors.primary[100],
  },
  inputError: {
    borderColor: colors.semantic.error,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.semantic.error,
  },
  button: {
    height: 52,
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
  loginRow: {
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  loginText: {
    fontSize: fontSize.sm,
    color: colors.neutral[600],
  },
  loginLink: {
    fontWeight: fontWeight.semiBold,
    color: colors.primary[600],
  },
});
