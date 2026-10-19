'use client';

import { useState } from 'react';

import type { User } from '@supabase/supabase-js';

import { zodResolver } from '@hookform/resolvers/zod';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { Check } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Alert, AlertDescription, AlertTitle } from '~/components/shadcn/alert';
import { Button } from '~/components/shadcn/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/shadcn/form';
import { If } from '~/components//if';
import { Input } from '~/components/shadcn/input';
import { Label } from '~/components/shadcn/label';
import { Trans } from '~/components/trans';

import { PasswordUpdateSchema } from '~/lib/schemas/update-password.schema';

export const UpdatePasswordForm = ({
  user,
  callbackPath,
}: {
  user: {
    email: string | undefined
  };
  callbackPath: string;
}) => {
  const { t } = useTranslation('account');
  const [needsReauthentication, setNeedsReauthentication] = useState(false);

  const updatePasswordFromCredential = (password: string) => {

    toast.success(t(`updatePasswordSuccess`))
  };

  const updatePasswordCallback = async ({
    newPassword,
  }: {
    newPassword: string;
  }) => {
    const email = user.email;

    // if the user does not have an email assigned, it's possible they
    // don't have an email/password factor linked, and the UI is out of sync
    if (!email) {
      /* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
      return Promise.reject(t(`cannotUpdatePassword`));
    }

    updatePasswordFromCredential(newPassword);
  };

  const form = useForm({
    resolver: zodResolver(
      PasswordUpdateSchema.withTranslation(t('passwordNotMatching')),
    ),
    defaultValues: {
      newPassword: '',
      repeatPassword: '',
    },
  });

  return (
    <Form {...form}>
      <form
        data-test={'account-password-form'}
        onSubmit={form.handleSubmit(updatePasswordCallback)}
      >
        <div className={'flex flex-col space-y-4'}>

          <If condition={needsReauthentication}>
            <NeedsReauthenticationAlert />
          </If>

          <FormField
            name={'newPassword'}
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>
                    <Label>
                      <Trans i18nKey={'account:newPassword'} />
                    </Label>
                  </FormLabel>

                  <FormControl>
                    <Input
                      data-test={'account-password-form-password-input'}
                      required
                      type={'password'}
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            name={'repeatPassword'}
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>
                    <Label>
                      <Trans i18nKey={'account:repeatPassword'} />
                    </Label>
                  </FormLabel>

                  <FormControl>
                    <Input
                      data-test={'account-password-form-repeat-password-input'}
                      required
                      type={'password'}
                      {...field}
                    />
                  </FormControl>

                  <FormDescription>
                    <Trans i18nKey={'account:repeatPasswordDescription'} />
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <div>
            <Button disabled={false}>
              <Trans i18nKey={'account:updatePasswordSubmitLabel'} />
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

function SuccessAlert() {
  return (
    <Alert variant={'success'}>
      <Check className={'h-4'} />

      <AlertTitle>
        <Trans i18nKey={'account:updatePasswordSuccess'} />
      </AlertTitle>

      <AlertDescription>
        <Trans i18nKey={'account:updatePasswordSuccessMessage'} />
      </AlertDescription>
    </Alert>
  );
}

function NeedsReauthenticationAlert() {
  return (
    <Alert variant={'warning'}>
      <ExclamationTriangleIcon className={'h-4'} />

      <AlertTitle>
        <Trans i18nKey={'account:needsReauthentication'} />
      </AlertTitle>

      <AlertDescription>
        <Trans i18nKey={'account:needsReauthenticationDescription'} />
      </AlertDescription>
    </Alert>
  );
}
