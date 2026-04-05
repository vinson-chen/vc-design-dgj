import { createContext, useContextSelector } from 'use-context-selector';
import type { TableGridStaticConfig } from './tableGridTypes';

export const TableGridConfigContext = createContext<TableGridStaticConfig | null>(null);

export function useTableGridConfigContext(): TableGridStaticConfig {
  const v = useContextSelector(TableGridConfigContext, (c) => c);
  if (v == null) {
    throw new Error('useTableGridConfigContext must be used within TableRows');
  }
  return v;
}
