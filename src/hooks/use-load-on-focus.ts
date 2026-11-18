import { useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';

/**
 * Carga un recurso al enfocar la pantalla.
 * Evita fetch en el montaje global de providers (mejor en dispositivos lentos).
 */
export function useLoadOnFocus(
  load: () => void | Promise<void>,
  options?: { /** Si true, recarga cada vez que se enfoca. Default: solo la 1ª vez. */ everyFocus?: boolean },
) {
  const loadedRef = useRef(false);
  const everyFocus = options?.everyFocus ?? false;

  useFocusEffect(
    useCallback(() => {
      if (!everyFocus && loadedRef.current) return;
      loadedRef.current = true;
      void load();
    }, [load, everyFocus]),
  );
}
