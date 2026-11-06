import React from 'react';
import {View, Text} from 'react-native';

interface SectionTitleProps {
  title: string;
  description?: string;
  border?: boolean;
  className?: string;
}

export function SectionTitle({
  title,
  description,
  border = true,
  className = '',
}: SectionTitleProps): React.JSX.Element {
  return (
    <View
      className={`px-4 mb-3 ${border ? 'pb-3 border-b border-neutral-200' : ''} ${className}`}>
      <Text className="text-base font-bold text-neutral-800 tracking-tight">
        {title}
      </Text>
      {Boolean(description) && (
        <Text className="text-xs text-neutral-500 mt-0.5 leading-snug">
          {description}
        </Text>
      )}
    </View>
  );
}
