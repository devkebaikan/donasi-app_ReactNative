import React, {useState} from 'react';
import {View, Text, TouchableOpacity, Linking} from 'react-native';
import {AltArrowDown, AltArrowUp} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {colors} from '@/theme';
import type {ProgramOrganization} from '@/types/programDetail';

interface PenggalangDanaAccordionProps {
  organization?: ProgramOrganization | null;
}

export function PenggalangDanaAccordion({
  organization,
}: PenggalangDanaAccordionProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  const orgName = organization?.name ?? 'Yayasan Beramal Bersama';

  function handleOpenLink(url: string): void {
    Linking.openURL(url).catch(() => {});
  }

  return (
    <View className="mx-4 mt-3 rounded-xl border border-primary-200 bg-white overflow-hidden shadow-xs">
      {/* Header Accordion */}
      <TouchableOpacity
        className="flex-row items-center justify-between p-3.5 bg-neutral-50/50"
        onPress={() => setIsOpen(prev => !prev)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Tentang Penggalang Dana">
        <View className="flex-1 pr-2">
          <Text className="text-xs font-bold text-neutral-900">
            Tentang Penggalang Dana
          </Text>
          <Text className="text-[11px] text-neutral-500 mt-0.5" numberOfLines={1}>
            informasi seputar lembaga, perizinan, dan kontak
          </Text>
        </View>
        <View className="w-6 h-6 rounded-full bg-primary-100 items-center justify-center">
          <Icon
            icon={isOpen ? AltArrowUp : AltArrowDown}
            size={14}
            color={colors.primary[600]}
          />
        </View>
      </TouchableOpacity>

      {/* Accordion Body */}
      {isOpen ? (
        <View className="p-3.5 pt-2 border-t border-neutral-100 space-y-3">
          <View>
            <Text className="text-xs font-bold text-neutral-900 mb-1">
              {orgName} - Berbagi dan Beramal Bersama
            </Text>
            <Text className="text-[11px] text-neutral-600 leading-relaxed">
              Kantor layanan masyarakat untuk memfasilitasi pendistribusian informasi rencana.
            </Text>
          </View>

          {/* Media Sosial */}
          <View className="gap-1 py-1">
            <View className="flex-row items-center">
              <Text className="text-[11px] text-neutral-500 w-20">Instagram</Text>
              <TouchableOpacity onPress={() => handleOpenLink('https://instagram.com/beramalbersama')}>
                <Text className="text-[11px] text-secondary-500 font-medium">: @beramalbersama</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row items-center">
              <Text className="text-[11px] text-neutral-500 w-20">Facebook</Text>
              <TouchableOpacity onPress={() => handleOpenLink('https://facebook.com/beramalbersama.official')}>
                <Text className="text-[11px] text-secondary-500 font-medium">: Beramalbersama Official</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Deskripsi Singkat */}
          <View>
            <Text className="text-xs font-bold text-neutral-900 mb-1">
              Tentang Beramalbersama.com
            </Text>
            <Text className="text-[11px] text-neutral-600 leading-relaxed">
              Beramalbersama.com berkomitmen memfasilitasi kemudahan berdonasi, menghadirkan transparansi dana, dan memastikan setiap program berjalan secara amanah dan berkelanjutan untuk kemaslahatan umat.
            </Text>
          </View>

          {/* Informasi Legalitas */}
          <View>
            <Text className="text-xs font-bold text-neutral-900 mb-2">
              LEGALITAS
            </Text>

            <View className="border border-neutral-200 rounded-lg p-3 bg-white space-y-2.5">
              <View>
                <Text className="text-[11px] font-bold text-neutral-900">
                  AKTA PENDIRIAN
                </Text>
                <Text className="text-[10px] text-neutral-600">
                  No. 12, Januari 2021
                </Text>
              </View>

              <View>
                <Text className="text-[11px] font-bold text-neutral-900">
                  SK Kementrian Hukum dan HAM
                </Text>
                <Text className="text-[10px] text-neutral-600">
                  AHU-0012345.AH.01.04. Tahun 2021
                </Text>
              </View>

              <View>
                <Text className="text-[11px] font-bold text-neutral-900">
                  Izin Dinas Sosial Kota Surakarta
                </Text>
                <Text className="text-[10px] text-neutral-600">
                  Nomor : 460/012/IV/2021
                </Text>
              </View>

              <View>
                <Text className="text-[11px] font-bold text-neutral-900">
                  SK Kementerian Sosial Republik Indonesia
                </Text>
                <Text className="text-[10px] text-neutral-600">
                  No. 237/HUK-PS/2021
                </Text>
              </View>

              <View>
                <Text className="text-[11px] font-bold text-neutral-900">
                  Nomor Induk Berusaha (NIB)
                </Text>
                <Text className="text-[10px] text-neutral-600">
                  1289210041152
                </Text>
              </View>

              <View className="flex-row items-center justify-between pt-1">
                <View>
                  <Text className="text-[11px] font-bold text-neutral-900">
                    SK Mitra Pengelola Zakat
                  </Text>
                  <Text className="text-[10px] text-neutral-600">
                    Wilayah Surakarta
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleOpenLink('https://beramalbersama.com/legalitas')}>
                  <Text className="text-[11px] font-semibold text-primary-600">
                    Lihat detail {'>'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Alamat Kantor & Kontak */}
          <View className="space-y-1.5 pt-1">
            <View className="flex-row">
              <Text className="text-[11px] font-bold text-neutral-800 w-24">Alamat Kantor :</Text>
              <Text className="text-[11px] text-neutral-600 flex-1 leading-snug">
                Jl. Letjen Sutoyo No. 14, Prawit, Nusukan, Banjarsari, Kota Surakarta, Jawa Tengah, 57138
              </Text>
            </View>

            <View className="pt-1">
              <Text className="text-[11px] font-bold text-neutral-800">Kontak Kami</Text>
              <Text className="text-[11px] text-neutral-600">Whatsapp : <Text className="text-primary-600 font-medium">0813 8111 1453</Text></Text>
              <Text className="text-[11px] text-neutral-600">Email : <Text className="text-primary-600 font-medium">support@beramalbersama.com</Text></Text>
            </View>

            <View className="pt-1">
              <Text className="text-[11px] font-bold text-neutral-800">Kritik, Saran dan Masukan :</Text>
              <TouchableOpacity onPress={() => handleOpenLink('https://beramalbersama.com/kontak')}>
                <Text className="text-[11px] text-primary-600 underline">
                  https://beramalbersama.com/kontak
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

