import React from 'react';
import {View, Text, TouchableOpacity, StatusBar, StyleSheet} from 'react-native';
import {ArrowLeft, Share} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {colors, fontSize, fontWeight} from '@/theme';

interface DetailProgramHeaderProps {
  title: string;
  onPressBack: () => void;
  onPressShare: () => void;
}

export function DetailProgramHeader({
  title,
  onPressBack,
  onPressShare,
}: DetailProgramHeaderProps): React.JSX.Element {
  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primary[500]}
        translucent={false}
      />
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onPressBack}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Kembali">
          <Icon icon={ArrowLeft} size={22} color={colors.neutral[800]} />
        </TouchableOpacity>

        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={onPressShare}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Bagikan program">
          <Icon icon={Share} size={20} color={colors.neutral[800]} />
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  title: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
    textAlign: 'center',
    marginHorizontal: 4,
  },
});
