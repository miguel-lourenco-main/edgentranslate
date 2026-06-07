/** Billing UI types shared between plan pickers and page-counter widgets. */
export interface CurrentBillingInfo {
  /** Display name of the matched product (Free, Pro, Business). */
  productName: string;
  /** Human-readable tier rate, e.g. "$0.25 / page". */
  tierText: string;
  /** Zero-based index into the product's tier list. */
  tierIndex: number;
}

/** Checkout redirect paths passed into pricing tables. */
export interface Paths {
  signUp: string;
  return: string;
}

/** Billing interval selector value. */
export type Interval = 'month' | 'year';