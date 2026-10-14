import React, { useEffect } from 'react';
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
import { ArrowLeft, HandHeart } from '@solar-icons/react-native/Linear';
import { FloatingOrbs } from '@/components/shared/FloatingOrbs';
import type { RootStackNavigationProp, RootStackParamList } from '@/types/navigation';
import { useLoginOtp } from '@/hooks/useLoginOtp';
import { showToast } from '@/utils/toast';
import { colors, spacing, radius, fontSize, fontWeight, shadows, authGradient } from '@/theme';

export function LoginOtpPhoneScreen(): React.JSX.Element {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'LoginOtpPhone'>>();
  const redirectTo = route.params?.redirectTo;
  const insets = useSafeAreaInsets();

  const { phone, isLoading, error, toast, setPhone, submit, clearToast } =
    useLoginOtp();

  useEffect(() => {
    if (!toast) {
      return;
    }
    showToast(toast);
    const t = setTimeout(clearToast, 100);
    return () => clearTimeout(t);
  }, [toast, clearToast]);

  async function handleSubmit(): Promise<void> {
    const result = await submit();
    if (result) {
      navigation.navigate('LoginOtpVerify', {
        phone,
        expiresIn: result.expiresIn,
        redirectTo,
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
              <Text style={styles.titleAccent}>Masuk</Text>
              {' tanpa password.'}
            </Text>

            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>Nomor Telepon</Text>
              <TextInput
                style={[styles.input, error?.phone ? styles.inputError : null]}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="Masukkan nomor telepon"
                placeholderTextColor={colors.neutral[400]}
                autoComplete="off"
                textContentType="telephoneNumber"
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
                accessibilityLabel="Input nomor telepon"
                accessibilityRole="none"
              />
              {error?.phone ? (
                <Text style={styles.errorText} accessibilityLiveRegion="polite">
                  {error.phone}
                </Text>
              ) : null}
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading ? styles.buttonDisabled : null]}
              onPress={handleSubmit}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel="Kirim Kode OTP"
              accessibilityState={{ disabled: isLoading }}>
              {isLoading ? (
                <ActivityIndicator color={colors.neutral[0]} />
              ) : (
                <Text style={styles.buttonText}>Kirim Kode OTP</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

export default LoginOtpPhoneScreen;

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
    borderColor: colors.neutral[200],
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
});
