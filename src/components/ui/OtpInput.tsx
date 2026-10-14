import React, {useRef} from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from 'react-native';
import {colors, spacing, radius, fontSize} from '@/theme';

const OTP_LENGTH = 6;

type Props = {
  value: string;
  onChange: (value: string) => void;
  onComplete: (value: string) => void;
};

export function OtpInput({value, onChange, onComplete}: Props): React.JSX.Element {
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const digits = value.split('').concat(Array(OTP_LENGTH).fill('')).slice(0, OTP_LENGTH);

  function handleChange(text: string, index: number): void {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const next = digits.slice();
    next[index] = digit;
    const newValue = next.join('');
    onChange(newValue);

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newValue.replace(/\s/g, '').length === OTP_LENGTH && !newValue.includes('')) {
      onComplete(newValue);
    }
  }

  function handleKeyPress(
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ): void {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  return (
    <View style={styles.row} accessibilityLabel="Input kode OTP" accessibilityRole="none">
      {digits.map((digit, index) => (
        <TextInput
          key={index}
          ref={ref => {
            inputRefs.current[index] = ref;
          }}
          style={[styles.box, digit ? styles.boxFilled : null]}
          value={digit}
          onChangeText={text => handleChange(text, index)}
          onKeyPress={e => handleKeyPress(e, index)}
          keyboardType="number-pad"
          maxLength={2}
          textContentType="oneTimeCode"
          selectTextOnFocus
          accessibilityLabel={`Digit ${index + 1} dari 6`}
          accessibilityRole="none"
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  box: {
    width: 44,
    height: 52,
    borderWidth: 1.5,
    borderColor: colors.neutral[300],
    borderRadius: radius.md,
    textAlign: 'center',
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.neutral[900],
    backgroundColor: colors.neutral[0],
  },
  boxFilled: {
    borderColor: colors.primary[500],
  },
});
