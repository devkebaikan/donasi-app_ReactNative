import {useMutation, useQueryClient} from '@tanstack/react-query';
import {createDoa} from '@/services/doaService';
import {showToast} from '@/utils/toast';
import type {CreateDoaPayload, Doa} from '@/types/doa';

const NETWORK_ERROR_MESSAGE = 'Tidak dapat terhubung.';

// Hasil submit dipulangkan sebagai union, bukan boolean + state error terpisah:
// screen selalu tahu persis mana yang harus dirender tanpa menebak dari
// kombinasi flag. Toast sudah ditangani di sini karena pesannya milik API.
export type CreateDoaOutcome =
  | {ok: true; doa: Doa}
  | {ok: false; fieldErrors: Record<string, string> | null};

type State = {
  isSubmitting: boolean;
};

type Actions = {
  submit: (payload: CreateDoaPayload) => Promise<CreateDoaOutcome>;
};

function toFieldErrors(data: unknown): Record<string, string> | null {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return null;
  }
  const entries = Object.entries(data as Record<string, unknown>).filter(
    (entry): entry is [string, string] => typeof entry[1] === 'string',
  );
  return entries.length ? Object.fromEntries(entries) : null;
}

export function useCreateDoa(): State & Actions {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: CreateDoaPayload) => createDoa(payload),
  });

  async function submit(payload: CreateDoaPayload): Promise<CreateDoaOutcome> {
    try {
      const response = await mutation.mutateAsync(payload);

      if (!response.success) {
        showToast(response.message);
        return {ok: false, fieldErrors: toFieldErrors(response.data)};
      }

      // invalidateQueries (bukan setQueryData seperti di toggle aamiin/favorit):
      // satu doa baru menggeser isi seluruh halaman dan mempengaruhi ketiga tab
      // sekaligus, jadi seluruh cache list memang harus dianggap basi.
      queryClient.invalidateQueries({queryKey: ['doa', 'list']});
      showToast(response.message);
      return {ok: true, doa: response.data};
    } catch {
      showToast(NETWORK_ERROR_MESSAGE);
      return {ok: false, fieldErrors: null};
    }
  }

  return {
    isSubmitting: mutation.isPending,
    submit,
  };
}
