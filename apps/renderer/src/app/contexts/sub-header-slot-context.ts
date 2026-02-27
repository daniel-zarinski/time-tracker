import { createContext, useContext } from 'react';

const SubHeaderSlotContext = createContext<HTMLDivElement | null>(null);

export const SubHeaderSlotProvider = SubHeaderSlotContext.Provider;

export function useSubHeaderSlot() {
  return useContext(SubHeaderSlotContext);
}
