'use client';

import { Alert } from '~/components/shadcn/alert';
import { LoadingOverlay } from '~/components/global-loader';
import { Trans } from '~/components/trans';

import { UpdatePasswordForm } from './update-password-form';

export function UpdatePasswordFormContainer(
  props: React.PropsWithChildren<{
    callbackPath: string;
  }>,
) {

  return <UpdatePasswordForm callbackPath={props.callbackPath} user={{email: "johndoe@gmail.com"}} />;
}

function WarnCannotUpdatePasswordAlert() {
  return (
    <Alert variant={'warning'}>
      <Trans i18nKey={'account:cannotUpdatePassword'} />
    </Alert>
  );
}
