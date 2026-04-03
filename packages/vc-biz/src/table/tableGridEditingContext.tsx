import React, { createContext, useContext } from 'react';
import type { TableGridEditingState } from './useTableGridEditing';

const TableGridEditingContext = createContext<TableGridEditingState | null>(null);

export function useTableGridEditingContext(): TableGridEditingState {
  const v = useContext(TableGridEditingContext);
  if (v == null) {
    throw new Error('useTableGridEditingContext must be used within TableRows');
  }
  return v;
}

export const TableGridEditingContextProvider = TableGridEditingContext.Provider;
