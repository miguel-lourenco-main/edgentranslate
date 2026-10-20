'use client';

import { UpdateAccountDetailsForm } from './update-account-details-form';

export function UpdateAccountDetailsFormContainer({
  user,
}: {
  user: {
    name: string | null;
    id: string;
  };
}) {

  return (
    <UpdateAccountDetailsForm
      displayName={user.name ?? ''}
      userId={user.id}
      onUpdate={() => {}}
    />
  );
}
