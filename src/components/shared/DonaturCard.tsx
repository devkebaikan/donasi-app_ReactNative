import React from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet} from 'react-native';
import {Pen} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';

interface DonaturCardProps {
  name: string;
  isEditing: boolean;
  onChangeName: (value: string) => void;
  onToggleEdit: () => void;
}

export function DonaturCard({
  name,
  isEditing,
  onChangeName,
  onToggleEdit,
}: DonaturCardProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Data Donatur</Text>
      <View style={styles.row}>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={onChangeName}
            placeholder="Nama donatur"
            placeholderTextColor={colors.neutral[400]}
            autoFocus
            accessibilityLabel="Nama donatur"
          />
        ) : (
          <Text style={styles.name} numberOfLines={1}>
            {name || 'Hamba Allah'}
          </Text>
        )}
        <TouchableOpacity
          style={styles.editButton}
          onPress={onToggleEdit}
          accessibilityRole="button"
          accessibilityLabel={
            isEditing ? 'Selesai edit nama donatur' : 'Edit nama donatur'
          }>
          {isEditing ? (
            <Text style={styles.editButtonText}>Selesai</Text>
          ) : (
            <Icon icon={Pen} size={16} color={colors.primary[500]} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[700],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    minHeight: 44,
  },
  name: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.md,
    color: colors.neutral[900],
  },
  editButton: {
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.primary[500],
  },
});
