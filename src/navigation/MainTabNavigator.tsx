import React from 'react';
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import type {MainTabParamList} from '@/types/navigation';
import {BottomTabBar} from '@/components/shared/BottomTabBar';
import HomeScreen from '@/screens/home/HomeScreen';
import AllDonationsScreen from '@/screens/donations/AllDonationsScreen';
import MyDonationsScreen from '@/screens/myDonations/MyDonationsScreen';
import RecurringDonationScreen from '@/screens/myDonations/RecurringDonationScreen';
import AccountScreen from '@/screens/account/AccountScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

function renderTabBar(props: BottomTabBarProps): React.JSX.Element {
  return <BottomTabBar {...props} />;
}

export function MainTabNavigator(): React.JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={{headerShown: false}}
      tabBar={renderTabBar}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Donations" component={AllDonationsScreen} />
      <Tab.Screen name="MyDonations" component={MyDonationsScreen} />
      <Tab.Screen name="RecurringDonation" component={RecurringDonationScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}
