import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import {Icon} from '@/components/ui/Icon';
import {User} from '@solar-icons/react-native/Linear';
import {colors, radius} from '@/theme';

interface AvatarProps {
  uri: string | null;
  name: string;
  size: number;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '';
  }
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
  return `${first}${last}`.toUpperCase();
}

export function Avatar({uri, name, size}: AvatarProps): React.JSX.Element {
  const dimensionStyle = {width: size, height: size, borderRadius: size / 2};

  if (uri) {
    return (
      <Image
        source={{uri}}
        style={[styles.image, dimensionStyle]}
        accessibilityRole="image"
        accessibilityLabel={`Foto profil ${name}`}
      />
    );
  }

  const initials = getInitials(name);

  return (
    <View
      style={[styles.fallback, dimensionStyle]}
      accessibilityRole="image"
      accessibilityLabel={`Foto profil ${name}`}>
      {initials ? (
        <Text style={[styles.initials, {fontSize: size / 2.5}]}>
          {initials}
        </Text>
      ) : (
        <Icon icon={User} size={size * 0.6} color={colors.neutral[0]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.neutral[200],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  fallback: {
    backgroundColor: colors.primary[400],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  initials: {
    color: colors.neutral[0],
    fontWeight: '700',
  },
});
