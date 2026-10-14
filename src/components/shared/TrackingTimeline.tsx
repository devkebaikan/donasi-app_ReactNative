import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {CheckCircle, CloseCircle} from '@solar-icons/react-native/Bold';
import {Icon} from '@/components/ui/Icon';
import {colors, spacing, radius, fontSize, fontWeight, lineHeight} from '@/theme';
import type {TrackingStatusStep} from '@/types/tracking';

interface TrackingTimelineProps {
  steps: TrackingStatusStep[];
}

export function TrackingTimeline({steps}: TrackingTimelineProps): React.JSX.Element {
  const activeStep = steps.find(step => step.state === 'current' || step.state === 'error');

  return (
    <View
      accessibilityRole="summary"
      accessibilityLabel={`Status donasi saat ini: ${activeStep?.title ?? steps[0]?.title ?? ''}`}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const isCompleted = step.state === 'completed';
        const isError = step.state === 'error';
        const isPending = step.state === 'pending';
        // Node "menunggu pembayaran" pakai warna warning/kuning — beda dari
        // node salur yang sedang berjalan (warna brand/primary), walau
        // keduanya sama-sama state 'current'. Bedakan lewat key, sama pola
        // dengan versi sebelumnya.
        const isWaitingPayment = step.key === 'payment' && step.state === 'current';
        const isCurrent = step.state === 'current' && !isWaitingPayment;

        return (
          <View
            key={step.key}
            style={styles.row}
            accessibilityRole="text"
            accessibilityLabel={`${step.title}, ${step.description}`}>
            <View style={styles.indicatorColumn}>
              <View
                style={[
                  styles.dot,
                  isCompleted && styles.dotCompleted,
                  isCurrent && styles.dotCurrent,
                  isWaitingPayment && styles.dotWaiting,
                  isError && styles.dotError,
                ]}>
                {isCompleted ? (
                  <Icon icon={CheckCircle} size={14} color={colors.neutral[0]} />
                ) : null}
                {isError ? (
                  <Icon icon={CloseCircle} size={14} color={colors.neutral[0]} />
                ) : null}
              </View>
              {!isLast ? (
                <View style={[styles.connector, isCompleted && styles.connectorActive]} />
              ) : null}
            </View>
            <View style={[styles.content, isPending && styles.contentPending]}>
              <Text
                style={[
                  styles.title,
                  isCompleted && styles.titleCompleted,
                  isCurrent && styles.titleCurrent,
                  isWaitingPayment && styles.titleWaiting,
                  isError && styles.titleError,
                ]}>
                {step.title}
              </Text>
              <Text
                style={[
                  styles.description,
                  isCurrent && styles.descriptionCurrent,
                  isWaitingPayment && styles.descriptionWaiting,
                  isError && styles.descriptionError,
                ]}>
                {step.description}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  indicatorColumn: {
    width: 24,
    alignItems: 'center',
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[0],
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotCompleted: {
    borderWidth: 0,
    backgroundColor: colors.primary[500],
  },
  dotCurrent: {
    borderWidth: 0,
    backgroundColor: colors.primary[500],
  },
  dotWaiting: {
    borderWidth: 0,
    backgroundColor: colors.semantic.warning,
  },
  dotError: {
    borderWidth: 0,
    backgroundColor: colors.semantic.error,
  },
  connector: {
    width: 2,
    flex: 1,
    // Gap vertikal antar node dibuat lebih besar dari versi sebelumnya
    // (spacing.xl) — sesuai ketentuan "gap vertical lebih besar".
    minHeight: spacing['2xl'],
    backgroundColor: colors.neutral[200],
  },
  connectorActive: {
    backgroundColor: colors.primary[500],
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
    paddingBottom: spacing['2xl'],
    gap: spacing.xs,
  },
  contentPending: {
    opacity: 0.5,
  },
  title: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[400],
  },
  titleCompleted: {
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  titleCurrent: {
    fontWeight: fontWeight.bold,
    color: colors.primary[700],
  },
  titleWaiting: {
    fontWeight: fontWeight.bold,
    color: colors.semantic.warning,
  },
  titleError: {
    fontWeight: fontWeight.bold,
    color: colors.semantic.error,
  },
  description: {
    fontSize: fontSize.xs,
    lineHeight: fontSize.xs * lineHeight.normal,
    color: colors.neutral[400],
  },
  descriptionCurrent: {
    color: colors.primary[600],
  },
  descriptionWaiting: {
    color: colors.semantic.warning,
  },
  descriptionError: {
    color: colors.semantic.error,
  },
});
