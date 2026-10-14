import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {RootStackParamList} from '@/types/navigation';
import SplashScreen from '@/screens/onboarding/SplashScreen';
import OnboardingScreen from '@/screens/onboarding/OnboardingScreen';
import {MainTabNavigator} from '@/navigation/MainTabNavigator';
import {LoginScreen} from '@/screens/auth/LoginScreen';
import LoginOtpPhoneScreen from '@/screens/auth/LoginOtpPhoneScreen';
import LoginOtpVerifyScreen from '@/screens/auth/LoginOtpVerifyScreen';
import ForgotPasswordScreen from '@/screens/auth/ForgotPasswordScreen';
import ForgotPasswordOtpScreen from '@/screens/auth/ForgotPasswordOtpScreen';
import ForgotPasswordCreatePasswordScreen from '@/screens/auth/ForgotPasswordCreatePasswordScreen';
import RegisterScreen from '@/screens/auth/RegisterScreen';
import RegisterOtpScreen from '@/screens/auth/RegisterOtpScreen';
import RegisterPasswordScreen from '@/screens/auth/RegisterPasswordScreen';
import MyProfileScreen from '@/screens/account/MyProfileScreen';
import EditProfileScreen from '@/screens/account/EditProfileScreen';
import AboutScreen from '@/screens/account/AboutScreen';
import FaqScreen from '@/screens/account/FaqScreen';
import SettingsScreen from '@/screens/account/SettingsScreen';
import WebViewScreen from '@/screens/account/WebViewScreen';
import NotifikasiScreen from '@/screens/notifikasi/NotifikasiScreen';
import {SearchScreen} from '@/screens/search/SearchScreen';
import DetailProgramScreen from '@/screens/donations/DetailProgramScreen';
import DetailProjectSalurScreen from '@/screens/donations/DetailProjectSalurScreen';
import PerLembagaScreen from '@/screens/donations/PerLembagaScreen';
import AllProjectSalurScreen from '@/screens/donations/AllProjectSalurScreen';
import AllReportSalurScreen from '@/screens/donations/AllReportSalurScreen';
import AlurDonasiScreen from '@/screens/donations/AlurDonasiScreen';
import PaymentInvoiceScreen from '@/screens/donations/PaymentInvoiceScreen';
import DonasiRutinSetupScreen from '@/screens/donations/DonasiRutinSetupScreen';
import DonasiRutinJenisScreen from '@/screens/donations/DonasiRutinJenisScreen';
import DonasiRutinProgramScreen from '@/screens/donations/DonasiRutinProgramScreen';
import DonasiRutinSuksesScreen from '@/screens/donations/DonasiRutinSuksesScreen';
import DetailDonasiRutinScreen from '@/screens/myDonations/DetailDonasiRutinScreen';
import InfakScreen from '@/screens/donations/InfakScreen';
import TopupScreen from '@/screens/topup/TopupScreen';
import NewsScreen from '@/screens/news/NewsScreen';
import NewsDetailScreen from '@/screens/news/NewsDetailScreen';
import DoaListScreen from '@/screens/doa/DoaListScreen';
import DoaCreateScreen from '@/screens/doa/DoaCreateScreen';
import AmalanHomeScreen from '@/screens/amalan/AmalanHomeScreen';
import DonasiBersamaListScreen from '@/screens/donasiBersama/DonasiBersamaListScreen';
import TantanganListScreen from '@/screens/tantangan/TantanganListScreen';
import TantanganCreateScreen from '@/screens/tantangan/TantanganCreateScreen';
import TantanganDetailScreen from '@/screens/tantangan/TantanganDetailScreen';
import TantanganInviteScreen from '@/screens/tantangan/TantanganInviteScreen';
import TantanganJurnalScreen from '@/screens/tantangan/TantanganJurnalScreen';
import DonasiBersamaCreateScreen from '@/screens/donasiBersama/DonasiBersamaCreateScreen';
import DonasiBersamaSuksesScreen from '@/screens/donasiBersama/DonasiBersamaSuksesScreen';
import DonasiBersamaDetailScreen from '@/screens/donasiBersama/DonasiBersamaDetailScreen';
import DonasiBersamaMembersScreen from '@/screens/donasiBersama/DonasiBersamaMembersScreen';
import DonasiBersamaMemberDetailScreen from '@/screens/donasiBersama/DonasiBersamaMemberDetailScreen';
import DonasiBersamaInviteScreen from '@/screens/donasiBersama/DonasiBersamaInviteScreen';
import DonasiBersamaUrunScreen from '@/screens/donasiBersama/DonasiBersamaUrunScreen';
import DonasiBersamaMyContributionsScreen from '@/screens/donasiBersama/DonasiBersamaMyContributionsScreen';
import DonasiBersamaBatchesScreen from '@/screens/donasiBersama/DonasiBersamaBatchesScreen';
import DonasiBersamaBatchContributionsScreen from '@/screens/donasiBersama/DonasiBersamaBatchContributionsScreen';
import ImpactMapScreen from '@/screens/impact/ImpactMapScreen';
import DistributionReportScreen from '@/screens/impact/DistributionReportScreen';
import ReflectionListScreen from '@/screens/reflection/ReflectionListScreen';
import ReflectionDetailScreen from '@/screens/reflection/ReflectionDetailScreen';
import EventScreen from '@/screens/event/EventScreen';
import PerTemaScreen from '@/screens/donations/PerTemaScreen';
import TrackingScreen from '@/screens/myDonations/TrackingScreen';
import ZakatScreen from '@/screens/zakat/ZakatScreen';
import ZakatKalkulatorScreen from '@/screens/zakat/ZakatKalkulatorScreen';
import PrayerScheduleScreen from '@/screens/prayer/PrayerScheduleScreen';
import PrayerSettingScreen from '@/screens/prayer/PrayerSettingScreen';
import KiblatScreen from '@/screens/prayer/KiblatScreen';
import QuranWelcomeScreen from '@/screens/quran/QuranWelcomeScreen';
import {QuranTabNavigator} from '@/navigation/QuranTabNavigator';
import QuranSearchScreen from '@/screens/quran/QuranSearchScreen';
import QuranReaderScreen from '@/screens/quran/QuranReaderScreen';
import QuranChallengeScreen from '@/screens/quran/QuranChallengeScreen';
import QuranMyChallengeScreen from '@/screens/quran/QuranMyChallengeScreen';
import QuranScheduleDetailScreen from '@/screens/quran/QuranScheduleDetailScreen';
import QuranScheduleFormScreen from '@/screens/quran/QuranScheduleFormScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{headerShown: false, animation: 'fade'}}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="LoginOtpPhone" component={LoginOtpPhoneScreen} />
        <Stack.Screen name="LoginOtpVerify" component={LoginOtpVerifyScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen
          name="ForgotPasswordOtp"
          component={ForgotPasswordOtpScreen}
        />
        <Stack.Screen
          name="ForgotPasswordCreatePassword"
          component={ForgotPasswordCreatePasswordScreen}
        />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="RegisterOtp" component={RegisterOtpScreen} />
        <Stack.Screen
          name="RegisterPassword"
          component={RegisterPasswordScreen}
        />
        <Stack.Screen name="Home" component={MainTabNavigator} />
        <Stack.Screen name="MyProfile" component={MyProfileScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
        <Stack.Screen name="Faq" component={FaqScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="WebView" component={WebViewScreen} />
        <Stack.Screen name="Notifikasi" component={NotifikasiScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="DetailProgram" component={DetailProgramScreen} />
        <Stack.Screen
          name="DetailProjectSalur"
          component={DetailProjectSalurScreen}
        />
        <Stack.Screen name="PerLembaga" component={PerLembagaScreen} />
        <Stack.Screen
          name="AllProjectSalur"
          component={AllProjectSalurScreen}
        />
        <Stack.Screen name="AllReportSalur" component={AllReportSalurScreen} />
        <Stack.Screen name="AlurDonasi" component={AlurDonasiScreen} />
        <Stack.Screen name="PaymentInvoice" component={PaymentInvoiceScreen} />
        <Stack.Screen
          name="DonasiRutinJenis"
          component={DonasiRutinJenisScreen}
        />
        <Stack.Screen
          name="DonasiRutinProgram"
          component={DonasiRutinProgramScreen}
        />
        <Stack.Screen
          name="DonasiRutinSetup"
          component={DonasiRutinSetupScreen}
        />
        <Stack.Screen
          name="DonasiRutinSukses"
          component={DonasiRutinSuksesScreen}
        />
        <Stack.Screen name="Topup" component={TopupScreen} />
        <Stack.Screen
          name="DetailDonasiRutin"
          component={DetailDonasiRutinScreen}
        />
        <Stack.Screen name="News" component={NewsScreen} />
        <Stack.Screen name="NewsDetail" component={NewsDetailScreen} />
        <Stack.Screen name="ImpactMap" component={ImpactMapScreen} />
        <Stack.Screen
          name="DistributionReport"
          component={DistributionReportScreen}
        />
        <Stack.Screen name="Renungan" component={ReflectionListScreen} />
        <Stack.Screen
          name="RenunganDetail"
          component={ReflectionDetailScreen}
        />
        <Stack.Screen name="Event" component={EventScreen} />
        <Stack.Screen name="PerTema" component={PerTemaScreen} />
        <Stack.Screen name="DoaList" component={DoaListScreen} />
        <Stack.Screen name="DoaCreate" component={DoaCreateScreen} />
        <Stack.Screen name="AmalanHome" component={AmalanHomeScreen} />
        <Stack.Screen
          name="DonasiBersamaList"
          component={DonasiBersamaListScreen}
        />
        <Stack.Screen
          name="DonasiBersamaCreate"
          component={DonasiBersamaCreateScreen}
        />
        <Stack.Screen
          name="DonasiBersamaSukses"
          component={DonasiBersamaSuksesScreen}
        />
        <Stack.Screen
          name="DonasiBersamaDetail"
          component={DonasiBersamaDetailScreen}
        />
        <Stack.Screen
          name="DonasiBersamaMembers"
          component={DonasiBersamaMembersScreen}
        />
        <Stack.Screen
          name="DonasiBersamaMemberDetail"
          component={DonasiBersamaMemberDetailScreen}
        />
        <Stack.Screen
          name="DonasiBersamaInvite"
          component={DonasiBersamaInviteScreen}
        />
        <Stack.Screen
          name="DonasiBersamaUrun"
          component={DonasiBersamaUrunScreen}
        />
        <Stack.Screen
          name="DonasiBersamaMyContributions"
          component={DonasiBersamaMyContributionsScreen}
        />
        <Stack.Screen
          name="DonasiBersamaBatches"
          component={DonasiBersamaBatchesScreen}
        />
        <Stack.Screen
          name="DonasiBersamaBatchContributions"
          component={DonasiBersamaBatchContributionsScreen}
        />
        <Stack.Screen name="TantanganList" component={TantanganListScreen} />
        <Stack.Screen
          name="TantanganCreate"
          component={TantanganCreateScreen}
        />
        <Stack.Screen
          name="TantanganDetail"
          component={TantanganDetailScreen}
        />
        <Stack.Screen
          name="TantanganInvite"
          component={TantanganInviteScreen}
        />
        <Stack.Screen
          name="TantanganJurnal"
          component={TantanganJurnalScreen}
        />
        <Stack.Screen name="Tracking" component={TrackingScreen} />
        <Stack.Screen name="Zakat" component={ZakatScreen} />
        <Stack.Screen
          name="ZakatKalkulator"
          component={ZakatKalkulatorScreen}
        />
        <Stack.Screen name="Infak" component={InfakScreen} />
        <Stack.Screen
          name="PrayerSchedule"
          component={PrayerScheduleScreen}
        />
        <Stack.Screen name="PrayerSetting" component={PrayerSettingScreen} />
        <Stack.Screen name="Kiblat" component={KiblatScreen} />
        <Stack.Screen name="QuranWelcome" component={QuranWelcomeScreen} />
        <Stack.Screen name="QuranTabs" component={QuranTabNavigator} />
        <Stack.Screen name="QuranSearch" component={QuranSearchScreen} />
        <Stack.Screen name="QuranReader" component={QuranReaderScreen} />
        <Stack.Screen name="QuranChallenge" component={QuranChallengeScreen} />
        <Stack.Screen
          name="QuranMyChallenge"
          component={QuranMyChallengeScreen}
        />
        <Stack.Screen
          name="QuranScheduleDetail"
          component={QuranScheduleDetailScreen}
        />
        <Stack.Screen
          name="QuranScheduleForm"
          component={QuranScheduleFormScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
