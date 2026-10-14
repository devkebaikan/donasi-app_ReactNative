import React from 'react';
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import type {QuranTabParamList} from '@/types/navigation';
import {QuranBottomMenu} from '@/components/shared/QuranBottomMenu';
import QuranHomeScreen from '@/screens/quran/QuranHomeScreen';
import QuranSurahListScreen from '@/screens/quran/QuranSurahListScreen';
import QuranProgressScreen from '@/screens/quran/QuranProgressScreen';
import QuranSettingScreen from '@/screens/quran/QuranSettingScreen';

const Tab = createBottomTabNavigator<QuranTabParamList>();

function renderTabBar(props: BottomTabBarProps): React.JSX.Element {
  return <QuranBottomMenu {...props} />;
}

// QuranBottomMenu merender dari route yang terdaftar di sini, jadi urutan
// tab mengikuti urutan Tab.Screen di bawah.
export function QuranTabNavigator(): React.JSX.Element {
  return (
    <Tab.Navigator screenOptions={{headerShown: false}} tabBar={renderTabBar}>
      <Tab.Screen name="QuranHome" component={QuranHomeScreen} />
      <Tab.Screen name="QuranSurahList" component={QuranSurahListScreen} />
      <Tab.Screen name="QuranProgress" component={QuranProgressScreen} />
      <Tab.Screen name="QuranSetting" component={QuranSettingScreen} />
    </Tab.Navigator>
  );
}
