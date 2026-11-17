import React, {useEffect, useRef, useState} from 'react';
import {Animated, Image, Text} from 'react-native';
import {formatCurrency} from '@/utils/formatCurrency';
import type {SalesNotifItem} from '@/types/programDetail';

interface SalesNotifCardProps {
  items: SalesNotifItem[];
}

const DISPLAY_DURATION_MS = 3000;
const HIDE_DELAY_MS = 1500;
const FADE_DURATION_MS = 500;

export function SalesNotifCard({
  items,
}: SalesNotifCardProps): React.JSX.Element | null {
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const opacity = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    activeIndexRef.current = 0;
    setActiveIndex(0);
    opacity.setValue(0.85);

    if (items.length <= 1) {
      return;
    }

    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout>;

    const runAnimationCycle = () => {
      // 1. Tampil selama DISPLAY_DURATION_MS, lalu fade out
      timeoutId = setTimeout(() => {
        if (!isMounted) return;

        Animated.timing(opacity, {
          toValue: 0,
          duration: FADE_DURATION_MS,
          useNativeDriver: true,
        }).start(({finished}) => {
          if (!finished || !isMounted) return;

          // 2. Jeda hilang selama 3 detik sebelum muncul lagi
          timeoutId = setTimeout(() => {
            if (!isMounted) return;

            const nextIndex = (activeIndexRef.current + 1) % items.length;
            activeIndexRef.current = nextIndex;
            setActiveIndex(nextIndex);

            // 3. Fade in muncul lagi
            Animated.timing(opacity, {
              toValue: 0.85,
              duration: FADE_DURATION_MS,
              useNativeDriver: true,
            }).start(({finished: fadeInFinished}) => {
              if (fadeInFinished && isMounted) {
                runAnimationCycle();
              }
            });
          }, HIDE_DELAY_MS);
        });
      }, DISPLAY_DURATION_MS);
    };

    runAnimationCycle();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      opacity.stopAnimation();
    };
  }, [items, opacity]);

  if (items.length === 0) {
    return null;
  }

  const current = items[activeIndex] as SalesNotifItem;
  const label = `${current.donaturName} baru saja berdonasi sebesar ${formatCurrency(current.amount)}`;

  return (
    <Animated.View
    style={{opacity}}
    className="flex-row max-w-[200px] mx-auto items-center gap-3 p-3 rounded-xl bg-white/95 backdrop-blur-md shadow-sm border border-neutral-100"
      accessibilityRole="text"
      accessibilityLabel={label}>
      <Image
        source={require('@/assets/images/logo/logo-short-color.png')}
        className="h-8 w-8"
        resizeMode="contain"
      />
      <Text className="flex-1 text-xs text-neutral-600 leading-tight">
        <Text className="font-semibold text-primary-600">{current.donaturName}</Text> baru saja
        berdonasi sebesar{'\n'}
        <Text className="font-semibold text-primary-600">{formatCurrency(current.amount)}</Text>
      </Text>
    </Animated.View>
  );
}
