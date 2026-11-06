import React from 'react';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface QuranProgressBarProps {
  percentage: number; // 0..100
  /** Warna track — dipakai saat bar berdiri di atas card gelap. */
  trackColor?: string;
  fillColor?: string;
}

export function QuranProgressBar({
  percentage,
  trackColor,
  fillColor,
}: QuranProgressBarProps): React.JSX.Element {
  return (
    <ProgressBar
      progress={percentage}
      height={6}
      trackColor={trackColor}
      fillColor={fillColor}
    />
  );
}
