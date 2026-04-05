import React, { createContext, useContext } from 'react';
import type { BodyRowSelectionStore } from './bodyRowSelectionStore';

export const BodyRowSelectionStoreContext = createContext<BodyRowSelectionStore | null>(null);

export function useBodyRowSelectionStore(): BodyRowSelectionStore {
  const s = useContext(BodyRowSelectionStoreContext);
  if (s == null) {
    throw new Error('useBodyRowSelectionStore must be used within TableRows');
  }
  return s;
}
