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
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui/Icon';
import { ArrowLeft, Eye, EyeClosed, HandHeart } from '@solar-icons/react-native/Linear';
import { FloatingOrbs } from '@/components/shared/FloatingOrbs';
import type { RootStackNavigationProp, RootStackParamList } from '@/types/navigation';
import { useLogin } from '@/hooks/useLogin';
import { colors, spacing, radius, fontSize, fontWeight, shadows, authGradient } from '@/theme';

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
    fieldErrors,
    setPhone,
    setPassword,
    togglePasswordVisible,
    validateField,
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

  const isDisabled = isLoading;
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

      {/* Back button — di luar scroll agar tidak ikut scroll, top pakai insets */}
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

          {/* Logo — mengambang di atas gradient, identik gaya authGateIconWrapper */}
          <View style={styles.logoSection}>
            <View style={styles.logoMark}>
              <Icon icon={HandHeart} size={40} color={colors.primary[500]} />
            </View>
          </View>

          {/* Card form — identik gaya authGateCard */}
          <View style={styles.card}>
            <Text style={styles.title}>
              <Text style={styles.titleAccent}>Masuk</Text>
              {' ke akun Anda.'}
            </Text>

            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>Nomor Telepon</Text>
              <TextInput
                style={[
                  styles.input,
                  fieldErrors?.phone ? styles.inputError : null,
                ]}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="Masukkan nomor telepon"
                placeholderTextColor={colors.neutral[400]}
                autoComplete="off"
                textContentType="telephoneNumber"
                returnKeyType="next"
                onBlur={() => validateField('phone')}
                onSubmitEditing={() => passwordRef.current?.focus()}
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
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  ref={passwordRef}
                  style={[
                    styles.input,
                    styles.passwordInput,
                    fieldErrors?.password ? styles.inputError : null,
                  ]}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible}
                  placeholder="Masukkan password"
                  placeholderTextColor={colors.neutral[400]}
                  textContentType="password"
                  returnKeyType="done"
                  onBlur={() => validateField('password')}
                  onSubmitEditing={handleSubmit}
                  accessibilityLabel="Input password"
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
                <Text style={styles.errorText} accessibilityLiveRegion="polite">
                  {fieldErrors.password}
                </Text>
              ) : null}
              <TouchableOpacity
                style={styles.forgotWrapper}
                onPress={() => navigation.navigate('ForgotPassword')}
                accessibilityRole="button"
                accessibilityLabel="Lupa password">
                <Text style={styles.forgotText}>Lupa Password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, isDisabled ? styles.buttonDisabled : null]}
              onPress={handleSubmit}
              disabled={isDisabled}
              accessibilityRole="button"
              accessibilityLabel="Masuk"
              accessibilityState={{ disabled: isDisabled }}>
              {isLoading ? (
                <ActivityIndicator color={colors.neutral[0]} />
              ) : (
                <Text style={styles.buttonText}>Masuk</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.otpButton}
              onPress={() => navigation.navigate('LoginOtpPhone', { redirectTo })}
              accessibilityRole="button"
              accessibilityLabel="Masuk dengan OTP">
              <Text style={styles.otpButtonText}>Masuk dengan OTP</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.registerRow}
              onPress={() => navigation.navigate('Register')}
              accessibilityRole="button"
              accessibilityLabel="Belum punya akun? Daftar sekarang">
              <Text style={styles.registerText}>
                Belum punya akun?{' '}
                <Text style={styles.registerLink}>Daftar Sekarang</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

export default LoginScreen;

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
  logoIcon: {
    fontSize: fontSize['2xl'],
    color: colors.primary[600],
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
    fontSize: fontSize.sm,
    color: colors.semantic.error,
  },
  forgotWrapper: {
    alignSelf: 'flex-end',
    minHeight: 44,
    justifyContent: 'center',
  },
  forgotText: {
    fontSize: fontSize.sm,
    color: colors.primary[500],
    fontWeight: fontWeight.medium,
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
  otpButton: {
    height: 52,
    borderWidth: 1.5,
    borderColor: colors.primary[400],
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[0],
  },
  otpButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.primary[600],
  },
  registerRow: {
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  registerText: {
    fontSize: fontSize.sm,
    color: colors.neutral[600],
  },
  registerLink: {
    fontWeight: fontWeight.semiBold,
    color: colors.primary[600],
  },
});
