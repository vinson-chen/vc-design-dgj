import React, { createContext, useContext } from 'react';
import type { TableGridEditingState } from './useTableGridEditing';

export const TableGridEditingDispatchersRefContext = createContext<React.MutableRefObject<
  TableGridEditingState | null
> | null>(null);

export function useTableGridEditingDispatchersRef(): React.MutableRefObject<TableGridEditingState | null> {
  const r = useContext(TableGridEditingDispatchersRefContext);
  if (r == null) {
    throw new Error('useTableGridEditingDispatchersRef must be used within TableRows');
  }
  return r;
}
