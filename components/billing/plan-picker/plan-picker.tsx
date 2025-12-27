'use client';

import { useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, useForm } from 'react-hook-form';
import {
  BillingConfig,
  getPlanIntervals,
  getProductPlanPair,
} from '~/lib/schemas/create-billing-schema';
import { PlanPickerComponent } from './plan-picker-component';
import { PlanDetails } from './plan-details';
import { getPlanPickerSchema } from './plan-picker-schema';
import { useTranslation } from 'react-i18next';

type PlanPickerFormData = {
  planId: string;
  productId: string;
  interval?: string;
};

export function PlanPicker(
  props: React.PropsWithChildren<{
    config: BillingConfig;
    onSubmit: (data: { planId: string; productId: string }) => void;
    canStartTrial?: boolean;
    pending?: boolean;
    contactUsURL?: string;
  }>,
) {

  const { t } = useTranslation(`billing`);

  const intervals = useMemo(
    () => getPlanIntervals(props.config),
    [props.config],
  ) as string[];

  const planPickerSchema = getPlanPickerSchema(props.config, t('noPlanChosen'))

  const form = useForm<PlanPickerFormData>({
    reValidateMode: 'onChange',
    mode: 'onChange',
    resolver: zodResolver(planPickerSchema),
    defaultValues: {
      interval: intervals[0],
      planId: '',
      productId: '',
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const { interval: selectedInterval, productId: selectedProductId, planId: selectedPlanId } = form.watch();

  const onSubmitForm = () => {
    form.handleSubmit(props.onSubmit)
  };

  const getFormValue = (key: string) => {
    const value = form.getValues(key as keyof PlanPickerFormData);

    return value ?? '';
  };

  const setFormValue = (key: string, value: string, partial?: Partial<{
    shouldValidate: boolean;
    shouldDirty: boolean;
    shouldTouch: boolean;
  }>) => {

    form.setValue(key as keyof PlanPickerFormData, value, partial);
  };

  const { product: selectedProduct, plan: selectedPlan } = getProductPlanPair(
    props.config,
    selectedPlanId,
  );

  return (
    <Form {...form}>
      <form
        className={'flex space-y-4 lg:flex-row lg:space-x-4 lg:space-y-0'}
        onSubmit={onSubmitForm}
      >
        <PlanPickerComponent 
          isFormValid={form.formState.isValid} 
          setFormValue={setFormValue} 
          getFormValue={getFormValue} 
          intervals={intervals} 
          {...props} 
          contactUsURL={props.contactUsURL}
        />
        {selectedPlanId && selectedInterval && selectedProductId ? (
          <PlanDetails
            selectedInterval={selectedInterval}
            selectedPlan={selectedPlan}
            selectedProduct={selectedProduct}
          />
          ) : null
        }
      </form>
    </Form>
    
  );
}

