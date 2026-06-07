'use client';

import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  BillingConfig,
  getPlanIntervals,
  getProductPlanPair,
} from '~/lib/schemas/create-billing-schema';
import {
  Form
} from '~/components/shadcn/form';
import { MAX_PAGES_SUBSCRIPTION } from '~/lib/constants';
import { PageAmountInput } from '~/components/billing/polydoc/page-counter';
import { PlanPickerComponent } from '~/components/billing/plan-picker/plan-picker-component';
import { PlanDetails } from '~/components/billing/plan-picker/plan-details';
import { getPolydocPlanPickerSchema } from './polydoc-plan-picker-schema';
import { getBillingInfoForPageCount, getTierText } from '~/lib/billing/utils';
import { CurrentBillingInfo } from '~/lib/interfaces';
import { useTranslation } from 'react-i18next';


type PolydocPlanPickerFormData = {
  planId: string;
  productId: string;
  pageCount: number;
  interval?: string;
};

export function PolydocPlanPicker(
  props: React.PropsWithChildren<{
    config: BillingConfig;
    onSubmit: (data: PolydocPlanPickerFormData) => void;
    canStartTrial?: boolean;
    pending?: boolean;
    currentSubscriptionVariantId?: string;
  }>,
) {

  const { t } = useTranslation(`billing`);

  const intervals = useMemo(
    () => getPlanIntervals(props.config),
    [props.config],
  ) as string[];

  const form = useForm<PolydocPlanPickerFormData>({
    reValidateMode: 'onChange',
    mode: 'onChange',
    resolver: zodResolver(getPolydocPlanPickerSchema(props.config, t('noPlanChosen'))),
    defaultValues: {
      interval: 'month',
      pageCount: 50,
      planId: 'pro-monthly',
      productId: 'pro',
    },
  });

  const setPageCount = (value: number) => {
    form.setValue('pageCount', value, { shouldValidate: true });
  };

  const updatePageCount = (value: number) => {
    const clampedValue = Math.min(Math.max(0, value), MAX_PAGES_SUBSCRIPTION);
    setPageCount(clampedValue);
  };

  // eslint-disable-next-line react-hooks/incompatible-library
  const { interval: selectedInterval, planId: selectedPlanId, productId, pageCount } = form.watch();

  // Snap page count to each product's valid range when the user switches plans.
  useEffect(() => {
    const planName = props.config.products.find(p => p.id === productId)?.name;

    switch(planName) {
      case 'Free':
        if(form.getValues('pageCount') > 5){
          form.setValue('pageCount', 5)
        }
        break;
      case 'Pro':
        if(form.getValues('pageCount') <= 5){
          form.setValue('pageCount', 50)
        }else if(form.getValues('pageCount') === MAX_PAGES_SUBSCRIPTION){
          form.setValue('pageCount', MAX_PAGES_SUBSCRIPTION - 1)
        }
        break;
      case 'Business':
        if(form.getValues('pageCount') !== MAX_PAGES_SUBSCRIPTION){
          form.setValue('pageCount', MAX_PAGES_SUBSCRIPTION)
        }
        break;
    }
  }, [selectedPlanId, form, props.config.products, productId]);

  // Update form values when currentPlan changes
  useEffect(() => {
    const { product, plan, tier, index } = getBillingInfoForPageCount(
      props.config.products,
      pageCount,
      selectedInterval
    );
    
    if (product && plan) {
      // Update form values
      form.setValue('planId', plan.id, { shouldValidate: true });
      form.setValue('productId', product.id, { shouldValidate: true });
      
      // Update billing info if we have all required data
      if (tier) {
        setCurrentBillingInfo({
          productName: product.name,
          tierText: getTierText(tier, plan.lineItems[0]?.unit),
          tierIndex: index
        });
      }
    }
  }, [pageCount, props.config.products, selectedInterval, form]);

  // Update the getFormValue function
  const getFormValue = (key: string) => {
    const value = form.getValues(key as keyof PolydocPlanPickerFormData);
    
    return value;
  };

  // Update the setFormValue function as well
  const setFormValue = (
    key: string,
    value: string | number,
    partial?: Partial<{
      shouldValidate: boolean;
      shouldDirty: boolean;
      shouldTouch: boolean;
    }>
  ) => {
    form.setValue(key as keyof PolydocPlanPickerFormData, value, partial);
  };

  const { product: selectedProduct, plan: selectedPlan } = getProductPlanPair(
    props.config,
    selectedPlanId,
  );

  const [currentBillingInfo, setCurrentBillingInfo] = useState<CurrentBillingInfo>({
    productName: 'Pro',
    tierText: '$0.25 / page',
    tierIndex: 0
  });

  useEffect(() => {
    const {product, plan, tier, index} = getBillingInfoForPageCount(props.config.products, pageCount, selectedInterval);
    
    if(product && tier && plan){
      setCurrentBillingInfo({
        productName: product.name,
        tierText: getTierText(tier, plan.lineItems[0]?.unit),
        tierIndex: index
      });
    }
  }, [pageCount, props.config.products, selectedInterval]);

  return (
    <Form {...form}>
      <PageAmountInput value={pageCount} onPageCountChange={updatePageCount} billingInfo={currentBillingInfo}/>
      <form
        className={'flex space-y-4 lg:flex-row lg:space-x-4 lg:space-y-0'}
        onSubmit={form.handleSubmit(props.onSubmit)}
      >
        <PlanPickerComponent 
          isFormValid={form.formState.isValid} 
          setFormValue={setFormValue} 
          getFormValue={getFormValue} 
          intervals={intervals} 
          currentSubscriptionVariantId={props.currentSubscriptionVariantId}
          contactUsURL={'mailto:sales@polydoc.ai'}
          {...props} 
        />
        <PlanDetails
          selectedInterval={selectedInterval ?? 'month'}
          selectedPlan={selectedPlan}
          selectedProduct={selectedProduct}
          pageCount={pageCount}
        />
      </form>
    </Form>
  );
}