import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  AltArrowLeft,
  VerifiedCheck,
  Buildings,
  ShieldCheck,
  UsersGroupTwoRounded,
} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '@/types/navigation';

export type MitraListScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'MitraList'
>;

interface MitraItem {
  id: string;
  name: string;
  type: string;
  desc: string;
  logoUrl?: string;
  isVerified: boolean;
}

const MITRA_LIST: MitraItem[] = [
  {
    id: '1',
    name: 'Yayasan Sahabat Beramal Bersama',
    type: 'Yayasan Resmi',
    desc: 'Lembaga pengelola platform beramalbersama.com yang menghadirkan penyaluran profesional dan amanah.',
    logoUrl: 'https://cdn.beramalbersama.com/mitra-logo/beramalbersama.webp',
    isVerified: true,
  },
  {
    id: '7',
    name: 'Relawan Penggerak Kebaikan',
    type: 'Relawan Sosial',
    desc: 'Mitra respon cepat dan penyaluran bantuan pangan santri pelosok nusantara.',
    logoUrl: 'https://cdn.beramalbersama.com/mitra-logo/relawan_penggerak_kebaikan.png',
    isVerified: true,
  },
  {
    id: '44',
    name: 'Temani Hati',
    type: 'Komunitas Dakwah',
    desc: 'Ruang kebaikan muslimah untuk saling menguatkan dan menebar manfaat sosial di Solo Raya.',
    logoUrl: 'https://cdn.beramalbersama.com/mitra-logo/temani_hati.png',
    isVerified: true,
  },
  {
    id: '2',
    name: 'Rumah Zakat',
    type: 'Lembaga Zakat',
    desc: 'Mitra penyaluran program zakat dan infak untuk dhuafa dan mustahik di seluruh Indonesia.',
    isVerified: true,
  },
  {
    id: '3',
    name: 'Dompet Dhuafa',
    type: 'LSM Sosial',
    desc: 'Kolaborasi program kesehatan dan pemberdayaan ekonomi keluarga mustahik.',
    isVerified: true,
  },
  {
    id: '4',
    name: 'Yayasan Peduli Anak',
    type: 'Lembaga Pendidikan',
    desc: 'Program beasiswa dan perlindungan anak yatim dan dhuafa di berbagai pelosok.',
    isVerified: true,
  },
];

export default function MitraListScreen({
  navigation,
}: MitraListScreenProps): React.JSX.Element {
  const insets = useSafeAreaInsets();

  function handleSelectMitra(m: MitraItem) {
    navigation.navigate('PerLembaga', {
      lembagaId: m.id,
      lembagaName: m.name,
    });
  }

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View
        style={{paddingTop: Math.max(insets.top, 12)}}
        className="bg-white px-4 pb-3 flex-row items-center border-b border-gray-100 shadow-xs z-10">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full items-center justify-center bg-gray-50 active:bg-gray-100 mr-2"
          accessibilityLabel="Kembali">
          <Icon icon={AltArrowLeft} size={22} color="#1F2937" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-base font-bold text-gray-900">Lembaga Mitra</Text>
          <Text className="text-[11px] text-gray-400">
            Mitra resmi & terverifikasi Beramalbersama
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{padding: 16, paddingBottom: insets.bottom + 40}}
        showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View className="bg-emerald-800 rounded-2xl p-5 mb-4 overflow-hidden relative shadow-sm">
          <View className="bg-emerald-700/80 self-start px-2.5 py-1 rounded-full flex-row items-center gap-1.5 mb-2.5">
            <Icon icon={ShieldCheck} size={13} color="#A7F3D0" />
            <Text className="text-[11px] font-bold text-emerald-100">
              Terakreditasi & Amanah
            </Text>
          </View>
          <Text className="text-xl font-black text-white leading-tight">
            Bersama Kami Melayani
          </Text>
          <Text className="text-xs text-emerald-100/90 mt-1.5 leading-relaxed">
            Beramalbersama bermitra dengan lembaga dan organisasi sosial yang
            telah terbukti kiprahnya di lapangan demi memastikan setiap donasi
            tersalurkan tepat sasaran.
          </Text>
        </View>

        {/* Section Title */}
        <Text className="text-sm font-bold text-gray-800 mb-3 px-1">
          Daftar Lembaga Mitra
        </Text>

        {/* Cards */}
        <View className="space-y-3">
          {MITRA_LIST.map(m => (
            <TouchableOpacity
              key={m.id}
              onPress={() => handleSelectMitra(m)}
              activeOpacity={0.7}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex-row items-start gap-3.5">
              {m.logoUrl ? (
                <Image
                  source={{uri: m.logoUrl}}
                  className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100"
                  resizeMode="contain"
                />
              ) : (
                <View className="w-12 h-12 rounded-xl bg-emerald-100 items-center justify-center">
                  <Icon icon={Buildings} size={22} color="#059669" />
                </View>
              )}

              <View className="flex-1 min-w-0">
                <View className="flex-row items-center justify-between mb-0.5">
                  <Text className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                    {m.type}
                  </Text>
                  {m.isVerified && (
                    <View className="flex-row items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded">
                      <Icon icon={VerifiedCheck} size={11} color="#059669" />
                      <Text className="text-[9px] font-semibold text-emerald-700">
                        Terverifikasi
                      </Text>
                    </View>
                  )}
                </View>

                <Text
                  numberOfLines={1}
                  className="text-sm font-bold text-gray-900 mb-1">
                  {m.name}
                </Text>

                <Text
                  numberOfLines={2}
                  className="text-xs text-gray-500 leading-relaxed">
                  {m.desc}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
