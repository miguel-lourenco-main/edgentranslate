import { createContext } from 'react';

// Legacy sidebar collapse state used by custom sidebar wrappers.
const SidebarContext = createContext<{
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}>({
  collapsed: false,
  setCollapsed: (_) => _,
});

export { SidebarContext };
