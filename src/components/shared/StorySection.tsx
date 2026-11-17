import React from 'react';
import {View, Text, Linking} from 'react-native';
import {HtmlContent} from '@/components/shared/HtmlContent';
import {EmptyState} from '@/components/ui/EmptyState';
import {FileText} from '@solar-icons/react-native/Linear';

interface StorySectionProps {
  htmlContent?: string | null;
  waNumber?: string;
}

export function StorySection({
  htmlContent,
  waNumber = '6281381111453',
}: StorySectionProps): React.JSX.Element {
  function handleReport(): void {
    const url = `https://api.whatsapp.com/send?phone=${waNumber}&text=Assalamu%27alaikum%20saya%20ingin%20melaporkan%20program%20donasi`;
    Linking.openURL(url).catch(() => {});
  }

  return (
    <View className="px-4 py-2 gap-4">
      {/* Title Badge "Kenapa Perlu Membantu?" */}
      <View className="flex-row items-center gap-2">
        <View className="px-4 py-1.5 rounded-full bg-primary-50 border border-primary-200">
          <Text className="text-xs font-semibold text-primary-700">
            Kenapa Perlu Membantu?
          </Text>
        </View>
      </View>

      {/* HTML Story Content */}
      {htmlContent ? (
        <View className="py-1">
          <HtmlContent html={htmlContent} />
        </View>
      ) : (
        <EmptyState icon={FileText} title="Belum ada cerita program" />
      )}

      {/* Disclaimer Box */}
      <View className="bg-amber-50 border-l-4 border-amber-400 p-3.5 rounded-r-md mt-2">
        <Text className="text-xs text-amber-900 leading-relaxed">
          <Text className="font-bold">Disclaimer: </Text>
          Informasi, opini dan foto yang ada di halaman galang dana ini adalah milik dan tanggung jawab penggalang dana. Jika ada masalah/kecurigaan silakan{' '}
          <Text
            className="text-amber-950 font-bold underline"
            onPress={handleReport}>
            lapor kepada kami disini.
          </Text>
        </Text>
      </View>
    </View>
  );
}

