import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import {AltArrowLeft, AltArrowRight} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {
  getMyDonationCalendar,
  type DonationCalendarDay,
} from '@/services/donationService';
import {formatCurrency} from '@/utils/formatCurrency';
import {showToast} from '@/utils/toast';
import {colors} from '@/theme';

const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const LOGO_SHORT_COLOR = require('@/assets/images/logo/logo-short-color.png');

function formatDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

interface KalenderDonasiProps {
  isAuthenticated: boolean;
}

export function KalenderDonasi({isAuthenticated}: KalenderDonasiProps): React.JSX.Element {
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
  const [donationMap, setDonationMap] = useState<Map<string, DonationCalendarDay>>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  const todayStr = useMemo(() => {
    const d = new Date();
    return formatDateStr(d.getFullYear(), d.getMonth(), d.getDate());
  }, []);

  const fetchCalendarData = useCallback(async (year: number, month: number) => {
    if (!isAuthenticated) {
      setDonationMap(new Map());
      return;
    }
    const lastDay = new Date(year, month + 1, 0).getDate();
    const startDate = formatDateStr(year, month, 1);
    const endDate = formatDateStr(year, month, lastDay);

    setIsLoading(true);
    try {
      const res = await getMyDonationCalendar({
        start_date: startDate,
        end_date: endDate,
        status: 'Paid',
      });
      if (res.success && Array.isArray(res.data)) {
        const map = new Map<string, DonationCalendarDay>();
        res.data.forEach(item => {
          map.set(item.date, item);
        });
        setDonationMap(map);
      } else {
        setDonationMap(new Map());
      }
    } catch {
      setDonationMap(new Map());
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCalendarData(currentYear, currentMonth);
  }, [currentYear, currentMonth, fetchCalendarData]);

  function handlePrevMonth(): void {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  }

  function handleNextMonth(): void {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  }

  // Generate calendar cells
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const totalCells = Math.ceil((daysInMonth + startingDayOfWeek) / 7) * 7;
  const cells: Array<{day: number; dateStr: string; isCurrentMonth: boolean}> = [];

  for (let i = 0; i < totalCells; i++) {
    if (i < startingDayOfWeek || i >= startingDayOfWeek + daysInMonth) {
      cells.push({day: 0, dateStr: '', isCurrentMonth: false});
    } else {
      const dayNum = i - startingDayOfWeek + 1;
      cells.push({
        day: dayNum,
        dateStr: formatDateStr(currentYear, currentMonth, dayNum),
        isCurrentMonth: true,
      });
    }
  }

  function handleDayPress(dayNum: number, dateStr: string): void {
    if (!dayNum) return;
    const donation = donationMap.get(dateStr);
    if (donation && donation.count > 0) {
      showToast(
        `Donasi ${dayNum} ${MONTH_NAMES[currentMonth]}: ${donation.count}x (${formatCurrency(
          donation.total_nominal,
        )})`,
      );
    }
  }

  return (
    <View className="mx-4 mb-6 rounded-3xl border border-amber-100 bg-white shadow-xs p-4">
      {/* Header Info */}
      <View className="mb-3">
        <Text className="text-sm font-bold text-slate-900">
          Perjalanan Kebaikan
        </Text>
        <Text className="text-[11px] text-slate-500 mt-0.5">
          Setiap pemberian punya arti
        </Text>
      </View>

      {/* Month Navigation */}
      <View className="flex-row items-center justify-between rounded-2xl bg-slate-50 px-2 py-1.5 mb-3">
        <TouchableOpacity
          onPress={handlePrevMonth}
          className="w-8 h-8 items-center justify-center rounded-xl bg-white shadow-2xs active:bg-slate-100"
          accessibilityRole="button"
          accessibilityLabel="Bulan sebelumnya">
          <Icon icon={AltArrowLeft} size={16} color={colors.neutral[600]} />
        </TouchableOpacity>

        <Text className="text-sm font-bold text-slate-900">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </Text>

        <TouchableOpacity
          onPress={handleNextMonth}
          className="w-8 h-8 items-center justify-center rounded-xl bg-white shadow-2xs active:bg-slate-100"
          accessibilityRole="button"
          accessibilityLabel="Bulan berikutnya">
          <Icon icon={AltArrowRight} size={16} color={colors.neutral[600]} />
        </TouchableOpacity>
      </View>

      {/* Day of Week Header */}
      <View className="flex-row justify-between mb-2">
        {DAY_NAMES.map(name => (
          <View key={name} className="flex-1 items-center">
            <Text className="text-[11px] font-semibold text-slate-400">
              {name}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      {isLoading ? (
        <View className="h-48 items-center justify-center">
          <ActivityIndicator size="small" color={colors.primary[500]} />
        </View>
      ) : (
        <View className="flex-row flex-wrap">
          {cells.map((cell, idx) => {
            if (!cell.isCurrentMonth) {
              return <View key={idx} className="w-[14.28%] h-11" />;
            }

            const donation = donationMap.get(cell.dateStr);
            const hasDonation = Boolean(donation && donation.count > 0);
            const isToday = cell.dateStr === todayStr;

            return (
              <TouchableOpacity
                key={idx}
                activeOpacity={hasDonation ? 0.7 : 1}
                onPress={() => handleDayPress(cell.day, cell.dateStr)}
                className={`w-[14.28%] h-11 items-center justify-center rounded-xl ${
                  isToday && !hasDonation
                    ? 'border border-dashed border-amber-400'
                    : ''
                }`}>
                {hasDonation ? (
                  <View className="w-8 h-8 items-center justify-center relative">
                    <Image
                      source={LOGO_SHORT_COLOR}
                      className="w-7 h-7 absolute"
                      resizeMode="contain"
                    />
                    <Text className="text-[11px] font-bold text-white z-10">
                      {cell.day}
                    </Text>
                  </View>
                ) : (
                  <Text
                    className={`text-xs font-medium ${
                      isToday ? 'font-bold text-amber-600' : 'text-slate-600'
                    }`}>
                    {cell.day}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Legend */}
      <View className="mt-3 flex-row items-center justify-center gap-5 border-t border-slate-100 pt-3">
        <View className="flex-row items-center gap-1.5">
          <Image
            source={LOGO_SHORT_COLOR}
            className="w-3.5 h-3.5"
            resizeMode="contain"
          />
          <Text className="text-[10px] font-medium text-slate-500">
            Hari donasi
          </Text>
        </View>

        <View className="flex-row items-center gap-1.5">
          <View className="w-3 h-3 rounded-full border border-dashed border-amber-400" />
          <Text className="text-[10px] font-medium text-slate-500">
            Hari ini
          </Text>
        </View>
      </View>
    </View>
  );
}
