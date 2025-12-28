'use client';


import { UpdateEmailForm } from './update-email-form';

export function UpdateEmailFormContainer(props: { callbackPath: string }) {

  /**
   *  if (isPending) {
        return <LoadingOverlay fullPage={false} />;
      }

      if (!user) {
        return null;
      }
   */

  return <UpdateEmailForm callbackPath={props.callbackPath} user={{email: "johndoe@gmail.com"}} />;
}
