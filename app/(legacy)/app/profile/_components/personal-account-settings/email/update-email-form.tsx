'use client';

import type { User } from '@supabase/supabase-js';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckIcon } from '@radix-ui/react-icons';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Alert, AlertDescription, AlertTitle } from '~/components/shadcn/alert';
import { Button } from '~/components/shadcn/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/shadcn/form';
import { If } from '~/components/if';
import { Input } from '~/components/shadcn/input';
import { Trans } from '~/components/trans';

import { UpdateEmailSchema } from '~/lib/schemas/update-email.schema';
import { useCallback, useState } from 'react';

function createEmailResolver(currentEmail: string, errorMessage: string) {
  return zodResolver(
    UpdateEmailSchema.withTranslation(errorMessage).refine((schema) => {
      return schema.email !== currentEmail;
    }),
  );
}

export function UpdateEmailForm({
  user,
  callbackPath,
}: {
  user: { email: string };
  callbackPath: string;
}) {
  const { t } = useTranslation('account');

  const [triggeredUpdate, setTriggeredUpdate] = useState<boolean>(false)

  const updateEmail = useCallback(({ email }: { email: string }) => {
    // then, we update the user's email address
    toast.success(t(`updateEmailSuccess`))

    setTriggeredUpdate(true)

    setTimeout(() => setTriggeredUpdate(false))
  }, [setTriggeredUpdate])

  const currentEmail = user.email;

  const form = useForm({
    resolver: createEmailResolver(currentEmail!, t('emailNotMatching')),
    defaultValues: {
      email: '',
      repeatEmail: '',
    },
  });

  return (
    <Form {...form}>
      <form
        className={'flex flex-col space-y-4'}
        data-test={'account-email-form'}
        onSubmit={form.handleSubmit(updateEmail)}
      >
        <If condition={triggeredUpdate}>
          <Alert variant={'success'}>
            <CheckIcon className={'h-4'} />

            <AlertTitle>
              <Trans i18nKey={'account:updateEmailSuccess'} />
            </AlertTitle>

            <AlertDescription>
              <Trans i18nKey={'account:updateEmailSuccessMessage'} />
            </AlertDescription>
          </Alert>
        </If>

        <div className={'flex flex-col space-y-4'}>
          <FormField
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey={'account:newEmail'} />
                </FormLabel>

                <FormControl>
                  <Input
                    data-test={'account-email-form-email-input'}
                    required
                    type={'email'}
                    placeholder={''}
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
            name={'email'}
          />

          <FormField
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey={'account:repeatEmail'} />
                </FormLabel>

                <FormControl>
                  <Input
                    {...field}
                    data-test={'account-email-form-repeat-email-input'}
                    required
                    type={'email'}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
            name={'repeatEmail'}
          />

          <div>
            <Button disabled={!triggeredUpdate}>
              <Trans i18nKey={'account:updateEmailSubmitLabel'} />
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
