import {colors} from '@/theme';
import type {ProjectSalurStatus} from '@/types/programDetail';

export const PROJECT_SALUR_STATUS_LABEL: Record<ProjectSalurStatus, string> = {
  menunggu: 'Menunggu Salur',
  proses: 'Proses Salur',
  selesai: 'Selesai Salur',
};

export const PROJECT_SALUR_STATUS_COLOR: Record<
  ProjectSalurStatus,
  {bg: string; text: string}
> = {
  menunggu: {bg: colors.semantic.warningLight, text: colors.semantic.warning},
  proses: {bg: colors.semantic.infoLight, text: colors.semantic.info},
  selesai: {bg: colors.semantic.successLight, text: colors.semantic.success},
};
