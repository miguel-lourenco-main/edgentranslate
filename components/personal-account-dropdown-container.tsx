'use client';

import { PersonalAccountDropdown } from './personal-account-dropdown';

import pathsConfig from '~/lib/config/paths.config';

// Thin wrapper wiring app paths and feature flags into the account dropdown.
const paths = {
  app: pathsConfig.app.app,
};

const features = {
  enableThemeToggle: true,
};

export function ProfileAccountDropdownContainer(props: {
  account: {
    id: string | null;
    name: string | null;
    picture_url: string | null;
    email: string | null;
  };
}) {
  return (
    <PersonalAccountDropdown
      className={'w-full'}
      paths={paths}
      features={features}
      account={props.account}
    />
  );
}
