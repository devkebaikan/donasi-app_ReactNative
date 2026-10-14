export type InfakTab = 'online' | 'qr' | 'history';

export interface InfakPayload {
  amount: number;
  paymentMethodId: string;
  donaturName: string;
  prayer?: string;
  isForOther: boolean;
  otherName?: string;
}
