import React, { createContext, useContext } from 'react';
import type { TableGridConfigValue } from './tableGridTypes';

const TableGridConfigContext = createContext<TableGridConfigValue | null>(null);

export function useTableGridConfigContext(): TableGridConfigValue {
  const v = useContext(TableGridConfigContext);
  if (v == null) {
    throw new Error('useTableGridConfigContext must be used within TableRows');
  }
  return v;
}

export const TableGridConfigContextProvider = TableGridConfigContext.Provider;
