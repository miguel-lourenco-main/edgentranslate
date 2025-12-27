export interface CurrentBillingInfo {
  productName: string;
  tierText: string;
  tierIndex: number;
}

export interface Paths {
  signUp: string;
  return: string;
}

export type Interval = 'month' | 'year';