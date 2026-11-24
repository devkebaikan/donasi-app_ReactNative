import React from 'react';
import {View, Text, TouchableOpacity, Image, type ImageSourcePropType} from 'react-native';
import {Widget} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {sanitizeImageUrl} from '@/utils/imageUrl';
import {colors} from '@/theme';

export interface MenuItem {
  id: number;
  name: string;
  image_url: string;
  screen: string;
  is_new?: boolean;
}

const MAX_TILES = 4;

// Metro bundler membutuhkan require statis. Mapping ini memetakan
// nama screen ke file asset lokal di src/assets/images/home/.
const LOCAL_MENU_ICONS: Record<string, ImageSourcePropType> = {
  Donations: require('@/assets/images/home/donasi.png'),
  Infak: require('@/assets/images/home/infaq.png'),
  Zakat: require('@/assets/images/home/zakat.png'),
  RecurringDonation: require('@/assets/images/home/rutin.png'),
};

interface MenuUtamaGridProps {
  items?: MenuItem[];
  onPressItem: (screen: string) => void;
  onPressMore?: () => void;
}

export function MenuUtamaGrid({
  items = [],
  onPressItem,
  onPressMore,
}: MenuUtamaGridProps): React.JSX.Element {
  if (items.length === 0) {
    return <View />;
  }

  const hasMore = items.length > MAX_TILES;
  const displayItems = items.slice(
    0,
    hasMore ? MAX_TILES - 1 : MAX_TILES,
  );

  return (
    <View className="px-4 py-4">
      <View className="flex-row justify-between">
        {displayItems.map(item => {
          // Prioritaskan icon lokal, atau gunakan remote URI jika berawalan http
          const safeUrl = sanitizeImageUrl(item.image_url);
          const iconSource =
            LOCAL_MENU_ICONS[item.screen] ??
            (safeUrl?.startsWith('http') ? {uri: safeUrl} : undefined);

          return (
            <TouchableOpacity
              key={item.id}
              className="flex-1 items-center gap-2"
              onPress={() => onPressItem(item.screen)}
              accessibilityRole="button"
              accessibilityLabel={item.name}>
              <View className="relative h-14 w-14 items-center justify-center rounded-full bg-neutral-100">
                {iconSource && (
                  <Image
                    source={iconSource}
                    className="h-full w-full"
                    resizeMode="contain"
                  />
                )}

                {item.is_new && (
                  <View className="absolute -right-1 -top-1 rounded-full bg-secondary-500 px-1.5 py-0.5">
                    <Text className="text-[8px] font-bold text-white">
                      NEW
                    </Text>
                  </View>
                )}
              </View>

              <Text className="text-center text-xs text-neutral-500">
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        })}

        {hasMore && (
          <TouchableOpacity
            className="flex-1 items-center gap-2"
            onPress={onPressMore}
            accessibilityRole="button"
            accessibilityLabel="Lainnya">
            <View className="h-[45px] w-[45px] items-center justify-center rounded-full bg-primary-100">
              <Icon
                icon={Widget}
                size={22}
                color={colors.primary[600]}
              />
            </View>

            <Text className="text-center text-xs font-medium text-neutral-900">
              Lainnya
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
