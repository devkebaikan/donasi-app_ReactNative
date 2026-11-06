import React from 'react';
import {View, Text, ScrollView} from 'react-native';
import {ProgramCard} from '@/components/shared/ProgramCard';
import type {Program} from '@/types/program';

interface FeaturedDonationsSectionProps {
  programs: Program[];
  onPressProgram: (program: Program) => void;
  className?: string;
}

export function FeaturedDonationsSection({
  programs,
  onPressProgram,
  className = '',
}: FeaturedDonationsSectionProps): React.JSX.Element | null {
  if (programs.length === 0) {
    return null;
  }

  return (
    <View className={`gap-3 py-3 ${className}`}>
      <Text className="text-base font-semibold text-neutral-900 px-4">
        Program Pilihan
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="px-4 gap-2">
        {programs.map(program => (
          <View
            key={program.id}
            testID={`featured-program-item-${program.id}`}
            style={{width: 320}}>
            <ProgramCard program={program} onPress={onPressProgram} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
