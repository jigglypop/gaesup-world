import { useCursor } from '@react-three/drei';
import { useState, useCallback, useEffect } from 'react';

/**
 * A hook to manage cursor hover state and update the cursor style.
 * @returns An object containing the hover state and a memoized callback to set it.
 */
export const useCursorState = () => {
  const [isHovered, setIsHovered] = useState(false);

  useCursor(isHovered);

  const setHovered = useCallback((hover: boolean) => {
    setIsHovered(hover);
  }, []);

  return { isHovered, setHovered };
}; 