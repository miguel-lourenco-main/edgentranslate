import { z } from 'zod';
import { BillingConfig, getProductPlanPair } from '~/lib/schemas/create-billing-schema';

export const getPolydocPlanPickerSchema = (config: BillingConfig, refinedMessage?: string) => {

  return (
    z.object({
      planId: z.string(),
      productId: z.string(),
      pageCount: z.number(),
      interval: z.string().optional(),
    })
    .refine(
      (data) => {
        try {
          const { product, plan } = getProductPlanPair(
            config,
            data.planId,
          );

          return product && plan;
        } catch {
          return false;
        }
      },
      { message: refinedMessage ?? 'No Plan Chosen', path: ['planId'] },
    )
  )
}
