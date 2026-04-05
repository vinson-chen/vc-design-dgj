import React, { createContext, useContext } from 'react';
import type { TableRowHoverStore } from './tableRowHoverStore';

export const TableRowHoverStoreContext = createContext<TableRowHoverStore | null>(null);

export function useTableRowHoverStore(): TableRowHoverStore {
  const s = useContext(TableRowHoverStoreContext);
  if (s == null) {
    throw new Error('useTableRowHoverStore must be used within TableRows');
  }
  return s;
}
