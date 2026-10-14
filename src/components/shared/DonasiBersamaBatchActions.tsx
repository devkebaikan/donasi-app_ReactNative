import React, {useState} from 'react';
import {Pen, Play, TrashBinTrash} from '@solar-icons/react-native/Linear';
import {ActionSheet} from '@/components/shared/ActionSheet';
import {DonasiBersamaBatchFormSheet} from '@/components/shared/DonasiBersamaBatchFormSheet';
import {QuranConfirmDialog} from '@/components/shared/QuranConfirmDialog';
import {useDonasiBersamaBatches} from '@/hooks/useDonasiBersamaBatches';
import type {DonasiBersamaBatch} from '@/types/donasiBersama';

const ACTION_RENAME = 'rename';
const ACTION_START = 'start';
const ACTION_DELETE = 'delete';

interface DonasiBersamaBatchActionsProps {
  groupId: string;
  /** Batch yang sedang dikelola. null = menu tertutup. */
  batch: DonasiBersamaBatch | null;
  onClose: () => void;
  /** Dipanggil setelah batch benar-benar terhapus — pemakai yang memutuskan
   *  apa yang terjadi berikutnya (daftar cukup menyegarkan, screen detail
   *  batch harus keluar karena isinya sudah tidak ada). */
  onDeleted?: () => void;
}

// Seluruh mesin aksi batch (menu, sheet ubah nama, dua dialog konfirmasi)
// dikumpulkan di sini supaya daftar batch dan detail batch memakai perilaku
// yang sama persis — bukan dua salinan yang lama-lama berbeda.
export function DonasiBersamaBatchActions({
  groupId,
  batch,
  onClose,
  onDeleted,
}: DonasiBersamaBatchActionsProps): React.JSX.Element {
  const [isRenaming, setIsRenaming] = useState(false);
  const [isConfirmingStart, setIsConfirmingStart] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const {isMutating, fieldErrors, renameBatch, startBatch, deleteBatch, clearFieldErrors} =
    useDonasiBersamaBatches(groupId);

  function handleSelectAction(value: string): void {
    onClose();
    if (value === ACTION_RENAME) {
      setIsRenaming(true);
      return;
    }
    if (value === ACTION_START) {
      setIsConfirmingStart(true);
      return;
    }
    setIsConfirmingDelete(true);
  }

  function closeRename(): void {
    setIsRenaming(false);
    clearFieldErrors();
  }

  async function handleRename(label: string): Promise<void> {
    if (batch && (await renameBatch(batch.id, label))) {
      closeRename();
    }
  }

  async function handleStart(): Promise<void> {
    if (batch && (await startBatch(batch.id))) {
      setIsConfirmingStart(false);
    }
  }

  async function handleDelete(): Promise<void> {
    if (batch && (await deleteBatch(batch.id))) {
      setIsConfirmingDelete(false);
      onDeleted?.();
    }
  }

  return (
    <>
      <ActionSheet
        isOpen={batch !== null}
        title={batch?.label ?? 'Kelola Batch'}
        actions={[
          {value: ACTION_RENAME, label: 'Ubah Nama Batch', icon: Pen},
          // "Mulai" dan "Hapus" hanya untuk batch yang belum berjalan — yang
          // sudah dimulai memuat riwayat urunan.
          ...(batch?.status === 'draft'
            ? [
                {value: ACTION_START, label: 'Mulai Batch', icon: Play},
                {
                  value: ACTION_DELETE,
                  label: 'Hapus Batch',
                  icon: TrashBinTrash,
                  tone: 'danger' as const,
                },
              ]
            : []),
        ]}
        onSelect={handleSelectAction}
        onClose={onClose}
      />

      <DonasiBersamaBatchFormSheet
        isOpen={isRenaming}
        mode="rename"
        initialLabel={batch?.label ?? ''}
        isSubmitting={isMutating}
        error={fieldErrors.label}
        onSubmit={handleRename}
        onClose={closeRename}
      />

      <QuranConfirmDialog
        visible={isConfirmingStart}
        title="Mulai Batch Ini?"
        description={`${batch?.label ?? 'Batch ini'} akan jadi batch berjalan. Urunan baru masuk ke sana, dan batch yang sedang berjalan ditutup.`}
        confirmLabel="Mulai"
        isLoading={isMutating}
        onConfirm={handleStart}
        onCancel={() => setIsConfirmingStart(false)}
      />

      <QuranConfirmDialog
        visible={isConfirmingDelete}
        title="Hapus Batch Ini?"
        description={`${batch?.label ?? 'Batch ini'} belum dimulai dan belum punya urunan, jadi aman dihapus.`}
        confirmLabel="Hapus"
        isLoading={isMutating}
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmingDelete(false)}
      />
    </>
  );
}
