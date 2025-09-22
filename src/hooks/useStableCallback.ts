import { useCallback, useRef } from 'react'

/**
 * Hook pour créer une fonction callback stable qui ne change pas de référence
 * Utile pour éviter les re-renders inutiles dans les useEffect
 */
export function useStableCallback<T extends (...args: any[]) => any>(callback: T): T {
  const callbackRef = useRef(callback)
  
  // Mettre à jour la référence de callback
  callbackRef.current = callback
  
  // Retourner une fonction stable qui appelle toujours la dernière version du callback
  return useCallback((...args: any[]) => {
    return callbackRef.current(...args)
  }, []) as T
}


