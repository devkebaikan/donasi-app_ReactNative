import React from 'react';
import type {ImageSourcePropType} from 'react-native';
import {HomeBackgroundGradient} from '@/components/shared/HomeBackgroundGradient';
import {HomeBackgroundImage} from '@/components/shared/HomeBackgroundImage';

type BackgroundMode = 'gradient' | 'image';

const BACKGROUND_MODE: BackgroundMode = 'gradient';

interface UseHomeBackgroundResult {
  Component: React.ComponentType<{children: React.ReactNode}>;
  imageSource?: ImageSourcePropType;
}

export function useHomeBackground(): UseHomeBackgroundResult {
  if (BACKGROUND_MODE === 'gradient') {
    return {
      Component: HomeBackgroundGradient,
    };
  }

  return {
    Component: HomeBackgroundImage,
    imageSource: undefined,
  };
}
