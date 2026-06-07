import { z } from 'zod';

/** Validates profile display name on the account settings form. */
export const AccountDetailsSchema = z.object({
  displayName: z.string().min(2).max(100),
});
