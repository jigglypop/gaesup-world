import { useCursor } from "@react-three/drei";
import { useCallback, useState } from "react";

export const initCursorCallback = () => {
  const [hover, setHover] = useState(false);

  const useCursorCallback = useCallback(() => {
    useCursor(hover);
  }, [hover, setHover, useCursor]);
  useCursorCallback();

  const setHoverCallback = useCallback(
    (_hover: boolean) => {
      setHover(_hover);
    },
    [setHover]
  );

  return {
    hover,
    setHover,
    setHoverCallback,
    useCursorCallback,
  };
};
