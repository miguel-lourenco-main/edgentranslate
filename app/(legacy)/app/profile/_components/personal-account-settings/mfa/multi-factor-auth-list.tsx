'use client';

import { useCallback, useState } from 'react';

import type { Factor } from '@supabase/supabase-js';

import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Alert, AlertDescription, AlertTitle } from '~/components/shadcn/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/shadcn/alert-dialog';
import { Badge } from '~/components/shadcn/badge';
import { Button } from '~/components/shadcn/button';
import { If } from '~/components/if';
import { Spinner } from '~/components/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/shadcn/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/shadcn/tooltip';
import { Trans } from '~/components/trans';

import { MultiFactorAuthSetupDialog } from './multi-factor-auth-setup-dialog';

export function MultiFactorAuthFactorsList(props: { userId: string }) {
  return (
    <div className={'flex flex-col space-y-4'}>
      <FactorsTableContainer userId={props.userId} />

      <div>
        <MultiFactorAuthSetupDialog userId={props.userId} />
      </div>
    </div>
  );
}

function FactorsTableContainer(props: { userId: string }) {

  let isLoading = true

  setTimeout(() => { isLoading = false})

  if (isLoading) {
    return (
      <div className={'flex items-center space-x-4'}>
        <Spinner />

        <div>
          <Trans i18nKey={'account:loadingFactors'} />
        </div>
      </div>
    );
  }

  /**
   * if (isError) {
        return (
          <div>
            <Alert variant={'destructive'}>
              <ExclamationTriangleIcon className={'h-4'} />

              <AlertTitle>
                <Trans i18nKey={'account:factorsListError'} />
              </AlertTitle>

              <AlertDescription>
                <Trans i18nKey={'account:factorsListErrorDescription'} />
              </AlertDescription>
            </Alert>
          </div>
        );
      }
   */

  return (
    <div className={'flex flex-col space-y-4'}>
      <Alert>
        <ShieldCheck className={'h-4'} />

        <AlertTitle>
          <Trans i18nKey={'account:multiFactorAuthHeading'} />
        </AlertTitle>

        <AlertDescription>
          <Trans i18nKey={'account:multiFactorAuthDescription'} />
        </AlertDescription>
      </Alert>
    </div>
  );
}

function ConfirmUnenrollFactorModal(
  props: React.PropsWithChildren<{
    factorId: string;
    userId: string;
    setIsModalOpen: (isOpen: boolean) => void;
  }>,
) {
  const { t } = useTranslation();

  const onUnenrollRequested = useCallback(
    (factorId: string) => {
      toast.success(t(`account:unenrollFactorSuccess`))
    },
    [props, t],
  );

  return (
    <AlertDialog open={!!props.factorId} onOpenChange={props.setIsModalOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <Trans i18nKey={'account:unenrollFactorModalHeading'} />
          </AlertDialogTitle>

          <AlertDialogDescription>
            <Trans i18nKey={'account:unenrollFactorModalDescription'} />
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>
            <Trans i18nKey={'common:cancel'} />
          </AlertDialogCancel>

          <AlertDialogAction
            type={'button'}
            disabled={false}
            onClick={() => onUnenrollRequested(props.factorId)}
          >
            <Trans i18nKey={'account:unenrollFactorModalButtonLabel'} />
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function FactorsTable({
  factors,
  userId,
}: React.PropsWithChildren<{
  factors: Factor[];
  userId: string;
}>) {
  const [unEnrolling, setUnenrolling] = useState<string>();

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Trans i18nKey={'account:factorName'} />
            </TableHead>
            <TableHead>
              <Trans i18nKey={'account:factorType'} />
            </TableHead>
            <TableHead>
              <Trans i18nKey={'account:factorStatus'} />
            </TableHead>

            <TableHead />
          </TableRow>
        </TableHeader>

        <TableBody>
          {factors.map((factor) => (
            <TableRow key={factor.id}>
              <TableCell>
                <span className={'block truncate'}>{factor.friendly_name}</span>
              </TableCell>

              <TableCell>
                <Badge variant={'info'} className={'inline-flex uppercase'}>
                  {factor.factor_type}
                </Badge>
              </TableCell>

              <td>
                <Badge
                  className={'inline-flex capitalize'}
                  variant={factor.status === 'verified' ? 'success' : 'outline'}
                >
                  {factor.status}
                </Badge>
              </td>

              <td className={'flex justify-end'}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={'ghost'}
                        size={'icon'}
                        onClick={() => setUnenrolling(factor.id)}
                      >
                        <X className={'h-4'} />
                      </Button>
                    </TooltipTrigger>

                    <TooltipContent>
                      <Trans i18nKey={'account:unenrollTooltip'} />
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </td>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <If condition={unEnrolling}>
        {(factorId) => (
          <ConfirmUnenrollFactorModal
            userId={userId}
            factorId={factorId}
            setIsModalOpen={() => setUnenrolling(undefined)}
          />
        )}
      </If>
    </>
  );
}
