import { z } from 'zod';

/** Email change form schema factory (requires matching confirmation field). */
export const UpdateEmailSchema = {
  withTranslation: (errorMessage: string) => {
    return z
      .object({
        email: z.string().email(),
        repeatEmail: z.string().email(),
      })
      .refine(
        (values) => {
          return values.email === values.repeatEmail;
        },
        {
          path: ['repeatEmail'],
          message: errorMessage,
        },
      );
  },
};
