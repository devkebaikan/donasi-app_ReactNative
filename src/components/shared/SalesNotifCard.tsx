import React, {useEffect, useRef, useState} from 'react';
import {Animated, Text, StyleSheet} from 'react-native';
import {HeartAngle} from '@solar-icons/react-native/Bold';
import {Icon} from '@/components/ui/Icon';
import {formatCurrency} from '@/utils/formatCurrency';
import {colors, spacing, radius, fontSize, fontWeight, lineHeight, shadows} from '@/theme';
import type {SalesNotifItem} from '@/types/programDetail';

interface SalesNotifCardProps {
  items: SalesNotifItem[];
}

const ROTATE_INTERVAL_MS = 3000;
const FADE_DURATION_MS = 250;

export function SalesNotifCard({
  items,
}: SalesNotifCardProps): React.JSX.Element | null {
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const opacity = useRef(new Animated.Value(.85)).current;

  useEffect(() => {
    activeIndexRef.current = 0;
    setActiveIndex(0);
    opacity.setValue(.85);

    if (items.length <= 1) {
      return;
    }

    const timer = setInterval(() => {
      const nextIndex = (activeIndexRef.current + 5) % items.length;

      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_DURATION_MS,
        useNativeDriver: true,
      }).start(() => {
        activeIndexRef.current = nextIndex;
        setActiveIndex(nextIndex);

        Animated.timing(opacity, {
          toValue: .85,
          duration: FADE_DURATION_MS,
          useNativeDriver: true,
        }).start();
      });
    }, ROTATE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [items, opacity]);

  if (items.length === 0) {
    return null;
  }

  const current = items[activeIndex] as SalesNotifItem;
  const label = `${current.donaturName} baru saja berdonasi sebesar ${formatCurrency(current.amount)}`;

  return (
    <Animated.View
      style={[styles.container, {opacity}]}
      accessibilityRole="text"
      accessibilityLabel={label}>
      <Icon icon={HeartAngle} size={28} color={colors.primary[500]} />
      <Text style={styles.message}>
        <Text style={styles.highlight}>{current.donaturName}</Text> baru saja
        berdonasi sebesar{'\n'}
        <Text style={styles.highlight}>{formatCurrency(current.amount)}</Text>
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[0],
    ...shadows.sm,
  },
  message: {
    flex: 1,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
    color: colors.neutral[600],
  },
  highlight: {
    fontWeight: fontWeight.semiBold,
    color: colors.primary[600],
  },
});
