import { createContext, useContext, type Dispatch, type SetStateAction } from 'react'

export const BottomNavSuppressContext = createContext<Dispatch<SetStateAction<boolean>> | null>(null)

export function useBottomNavSuppressSetter() {
  return useContext(BottomNavSuppressContext)
}
