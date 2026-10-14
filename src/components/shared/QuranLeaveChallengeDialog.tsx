import React from 'react';
import {QuranConfirmDialog} from '@/components/shared/QuranConfirmDialog';

interface QuranLeaveChallengeDialogProps {
  visible: boolean;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// Pembungkus tipis di atas QuranConfirmDialog — menyimpan copy khusus
// keluar challenge di satu tempat.
export function QuranLeaveChallengeDialog({
  visible,
  isLoading,
  onConfirm,
  onCancel,
}: QuranLeaveChallengeDialogProps): React.JSX.Element {
  return (
    <QuranConfirmDialog
      visible={visible}
      title="Keluar dari challenge ini?"
      description="Progres bacaanmu tetap tersimpan."
      confirmLabel="Keluar"
      isLoading={isLoading}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
