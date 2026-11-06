import React, {useEffect, useRef, useState} from 'react';
import {View, Text, Image, Animated, StyleSheet} from 'react-native';
import {apiClient} from '@/services/apiClient';
import {formatCurrency} from '@/utils/formatCurrency';

interface RawDonorItem {
  user?: {name?: string};
  name?: string;
  total?: number;
  nominal_donasi?: number;
}

interface RawDonorResponse {
  data?: {
    data?: RawDonorItem[];
  } | RawDonorItem[];
}

interface DonorItem {
  name: string;
  total: number;
}

interface DonorNotifSectionProps {
  className?: string;
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    zIndex: 50,
    maxWidth: 290,
  },
});

export function DonorNotifSection({
  className = '',
}: DonorNotifSectionProps): React.JSX.Element | null {
  const [donors, setDonors] = useState<DonorItem[]>([]);
  const [currentDonor, setCurrentDonor] = useState<DonorItem | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(12)).current;
  const indexRef = useRef(0);

  useEffect(() => {
    let isMounted = true;

    async function fetchDonors(): Promise<void> {
      try {
        const res = await apiClient.get<RawDonorResponse>('/donors/list?limit=5');
        const raw = res.data?.data;
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
          ? raw.data
          : [];

        if (list.length > 0 && isMounted) {
          const mapped: DonorItem[] = list.map((d: RawDonorItem) => ({
            name: d.user?.name ?? d.name ?? 'Hamba Allah',
            total: Number(d.total ?? d.nominal_donasi ?? 0),
          }));
          setDonors(mapped);
          setCurrentDonor(mapped[0] ?? null);
        }
      } catch {
        // Abaikan bila gagal mengambil ticker
      }
    }

    fetchDonors();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (donors.length === 0) return;

    let isEffectActive = true;
    let timer: ReturnType<typeof setInterval>;
    let hideTimeout: ReturnType<typeof setTimeout>;

    function showItem(): void {
      if (!isEffectActive) return;

      // Fade in & slide up
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (!isEffectActive) return;

        // Tunggu 3.5 detik lalu fade out
        hideTimeout = setTimeout(() => {
          if (!isEffectActive) return;

          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 350,
              useNativeDriver: true,
            }),
            Animated.timing(translateYAnim, {
              toValue: 10,
              duration: 350,
              useNativeDriver: true,
            }),
          ]).start(() => {
            if (!isEffectActive) return;
            indexRef.current = (indexRef.current + 1) % donors.length;
            setCurrentDonor(donors[indexRef.current] ?? null);
          });
        }, 3500);
      });
    }

    showItem();
    timer = setInterval(showItem, 5500);

    return () => {
      isEffectActive = false;
      clearInterval(timer);
      clearTimeout(hideTimeout);
      fadeAnim.stopAnimation();
      translateYAnim.stopAnimation();
    };
  }, [donors, fadeAnim, translateYAnim]);

  if (!currentDonor) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.floatingContainer,
        {
          opacity: fadeAnim,
          transform: [{translateY: translateYAnim}],
        },
      ]}>
      <View className={`flex-row items-center gap-2 bg-white rounded-xl px-3 py-2 border border-neutral-200 shadow-md ${className}`}>
        <View className="w-5 h-5 shrink-0 items-center justify-center">
          <Image
            source={require('@/assets/images/logo/logo-short-color.png')}
            className="w-full h-full"
            resizeMode="contain"
          />
        </View>

        <Text className="text-[11px] leading-tight flex-shrink text-neutral-600" numberOfLines={2}>
          <Text className="font-bold text-primary-600">{currentDonor.name}</Text>
          <Text> baru saja berdonasi sebesar </Text>
          <Text className="font-bold text-primary-600">
            {formatCurrency(currentDonor.total)}
          </Text>
        </Text>
      </View>
    </Animated.View>
  );
}
