import React, { createContext, useState, useContext, ReactNode } from 'react';

interface CompareOpenContextType {
  currentID: number;
  open: boolean;
  setCurrentID: React.Dispatch<React.SetStateAction<number>>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CompareOpenContext = createContext<CompareOpenContextType | undefined>(undefined);

interface CompareOpenProviderProps {
  children: ReactNode;
}

export const CompareOpenProvider: React.FC<CompareOpenProviderProps> = ({ children }) => {
  const [currentID, setCurrentID] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);

  const value = {
    currentID,
    open,
    setCurrentID,
    setOpen,
  };

  return (
    <CompareOpenContext.Provider value={value}>
      {children}
    </CompareOpenContext.Provider>
  );
};

export const useCompareOpen = (): CompareOpenContextType => {
  const context = useContext(CompareOpenContext);
  if (context === undefined) {
    throw new Error('useCompareOpen must be used within a CompareOpenProvider');
  }
  return context;
};
