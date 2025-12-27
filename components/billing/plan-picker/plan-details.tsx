import { Separator } from "~/components/shadcn/separator";
import { Trans } from "~/components/trans";
import { LineItemDetails } from "../line-item-details";
import { LineItemSchema } from "~/lib/schemas/create-billing-schema";
import { If } from '~/components/if';
import { z } from "zod";
import FeaturesList from "../features-list";
import { Interval } from "~/lib/interfaces";

export function PlanDetails({
  selectedProduct,
  selectedInterval,
  selectedPlan,
  pageCount,
}: {
  selectedProduct: {
    id: string;
    name: string;
    description: string;
    currency: string;
    features: string[];
  };

  selectedInterval: string;

  selectedPlan: {
    lineItems: z.infer<typeof LineItemSchema>[];
    paymentType: string;
  };
  pageCount?: number;  
}) {

  const isRecurring = selectedPlan.paymentType === 'recurring';

  return (
    <div
      className={
        'fade-in animate-in zoom-in-95 flex w-full flex-col space-y-4 py-2 lg:px-8'
      }
    >
      <div className={'flex flex-col space-y-0.5'}>
        <span className={'text-sm font-medium'}>
          <b>
            <Trans
              i18nKey={`billing:plans.${selectedProduct.id}.name`}
              defaults={selectedProduct.name}
            />
          </b>{' '}
          <If condition={isRecurring}>
            / <Trans i18nKey={`billing:billingInterval.${selectedInterval}`} />
          </If>
        </span>

        <p>
          <span className={'text-muted-foreground text-sm'}>
            <Trans
              i18nKey={`billing:plans.${selectedProduct.id}.description`}
              defaults={selectedProduct.description}
            />
          </span>
        </p>
      </div>
      <If condition={selectedPlan.lineItems.length > 0}>
        <Separator />

        <div className={'flex flex-col space-y-2'}>
          <span className={'text-sm font-semibold'}>
            <Trans i18nKey={'billing:detailsLabel'} />
          </span>

          <LineItemDetails
            lineItems={selectedPlan.lineItems ?? []}
            selectedInterval={isRecurring ? selectedInterval : undefined}
            currency={selectedProduct.currency}
            pageCount={pageCount}
          />
        </div>
      </If>

      <Separator />

      <div className={'flex flex-col space-y-2'}>
        <span className={'text-sm font-semibold'}>
          <Trans i18nKey={'billing:featuresLabel'} />
        </span>

        <FeaturesList 
          features={selectedProduct.features} 
          interval={selectedInterval as Interval} 
          pageCount={pageCount ?? 0} 
        />
      </div>
    </div>
  );
}