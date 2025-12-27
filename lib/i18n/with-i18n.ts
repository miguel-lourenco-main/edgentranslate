export function withI18n<TProps>(
  Component: (props: TProps) => React.ReactNode | Promise<React.ReactNode>,
) {
  // In this simplified repo we rely on the root `I18nextProvider` for client components
  // and `createI18nServerInstance()` for metadata/server lookups.
  return function WithI18nWrapper(props: TProps) {
    return Component(props);
  };
}




