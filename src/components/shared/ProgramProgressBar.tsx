import React from 'react';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface ProgramProgressBarProps {
  progress: number;
}

export function ProgramProgressBar({
  progress,
}: ProgramProgressBarProps): React.JSX.Element {
  return <ProgressBar progress={progress} height={8} />;
}
