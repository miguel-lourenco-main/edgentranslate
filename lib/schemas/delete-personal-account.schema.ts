import { z } from 'zod';

/** Requires typing "DELETE" to confirm irreversible account removal. */
export const DeletePersonalAccountSchema = z.object({
  confirmation: z.string().refine((value) => value === 'DELETE'),
});
