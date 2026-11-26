import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {AltArrowLeft, VerifiedCheck} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {ProgressBar} from '@/components/ui/ProgressBar';
import {getRutinPrograms} from '@/services/recurringDonationService';
import {formatCurrency} from '@/utils/formatCurrency';
import {colors} from '@/theme';
import type {DonasiRutinProgramScreenProps} from '@/types/navigation';

export default function DonasiRutinProgramScreen({
  navigation,
}: DonasiRutinProgramScreenProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const [programs, setPrograms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchPrograms = useCallback(async () => {
    try {
      const res = await getRutinPrograms();
      if (res.success && Array.isArray(res.data)) {
        setPrograms(res.data);
      } else {
        setPrograms([]);
      }
    } catch {
      setPrograms([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  function handleRefresh(): void {
    setIsRefreshing(true);
    fetchPrograms();
  }

  function handlePressProgram(item: any): void {
    navigation.navigate('DonasiRutinSetup', {
      programId: String(item.id),
      programTitle: item.title,
      programImageUrl: item.image,
    });
  }

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header Bar */}
      <View
        style={{paddingTop: insets.top}}
        className="bg-white border-b border-slate-100 flex-row items-center px-4 py-3">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center -ml-2 rounded-full active:bg-slate-100"
          accessibilityRole="button"
          accessibilityLabel="Kembali">
          <Icon icon={AltArrowLeft} size={22} color={colors.neutral[800]} />
        </TouchableOpacity>
        <Text className="text-base font-bold text-slate-900 ml-2">
          Pilih Program Donasi Rutin
        </Text>
      </View>

      <FlatList
        data={programs}
        keyExtractor={(item, index) => `${item.id || 'program'}-${index}`}
        contentContainerStyle={{paddingBottom: 40}}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary[500]]}
          />
        }
        ListHeaderComponent={
          /* Hero Stats Banner */
          <View className="mb-4">
            <LinearGradient
              colors={[colors.primary[500], colors.primary[700]]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              className="p-5 rounded-b-3xl">
              <Text className="text-xs text-primary-100 font-medium mb-1">
                Program tersedia
              </Text>
              <Text className="text-2xl font-bold text-white mb-1">
                {isLoading ? '...' : `${programs.length} Program`}
              </Text>
              <Text className="text-xs text-primary-100">
                Pilih program terbaik untuk donasi rutinmu
              </Text>
            </LinearGradient>
          </View>
        }
        renderItem={({item}) => {
          const progress = Math.min(
            1,
            Math.max(
              0,
              (Number(item.nominal_achieved) || 0) /
                (Number(item.nominal_target) || 1),
            ),
          );

          return (
            <View className="px-4 mb-3">
              <TouchableOpacity
                onPress={() => handlePressProgram(item)}
                activeOpacity={0.7}
                className="bg-white rounded-2xl border border-slate-100 p-3 flex-row gap-3 shadow-2xs active:bg-slate-50">
                {item.image ? (
                  <Image
                    source={{uri: item.image}}
                    className="w-28 h-24 rounded-xl bg-slate-100"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-28 h-24 rounded-xl bg-primary-50 items-center justify-center">
                    <Text className="text-2xl">🤲</Text>
                  </View>
                )}

                <View className="flex-1 justify-between py-0.5">
                  <View>
                    <Text
                      numberOfLines={2}
                      className="text-xs font-bold text-slate-800 leading-snug mb-1">
                      {item.title}
                    </Text>

                    <View className="flex-row items-center gap-1 mb-2">
                      <Text
                        numberOfLines={1}
                        className="text-[10px] text-slate-500 font-medium max-w-[120px]">
                        {item.mitra?.name || 'Mitra Penyalur'}
                      </Text>
                      <Icon
                        icon={VerifiedCheck}
                        size={12}
                        color={colors.primary[500]}
                      />
                    </View>
                  </View>

                  <View className="gap-1.5">
                    <ProgressBar progress={progress} height={4} />

                    <View className="flex-row items-center justify-between">
                      <View>
                        <Text className="text-[9px] text-slate-400">Terkumpul</Text>
                        <Text className="text-[11px] font-bold text-primary-600">
                          {formatCurrency(Number(item.nominal_achieved) || 0)}
                        </Text>
                      </View>

                      {item.time_target != null && (
                        <View className="items-end">
                          <Text className="text-[9px] text-slate-400">Sisa hari</Text>
                          <Text className="text-[11px] font-semibold text-slate-700">
                            {item.time_target} hari
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          isLoading ? (
            <View className="p-4 gap-3">
              {[1, 2, 3, 4].map(n => (
                <View
                  key={n}
                  className="bg-white rounded-2xl border border-slate-100 p-3 flex-row gap-3">
                  <View className="w-28 h-24 rounded-xl bg-slate-200 animate-pulse" />
                  <View className="flex-1 justify-between py-1">
                    <View className="gap-2">
                      <View className="w-3/4 h-3 bg-slate-200 rounded animate-pulse" />
                      <View className="w-1/2 h-2.5 bg-slate-200 rounded animate-pulse" />
                    </View>
                    <View className="w-full h-2 bg-slate-200 rounded animate-pulse" />
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="py-12 items-center justify-center px-4">
              <Text className="text-sm font-semibold text-slate-600">
                Belum ada program rutin tersedia
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}
