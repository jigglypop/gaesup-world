import { useEffect } from "react";

export const useContextCloseEffect = (cb: Function) => {
  useEffect(() => {
    const contextClose = () => {
      cb();
    };
    window.addEventListener("contextmenu", contextClose);
    return () => window.removeEventListener("contextmenu", contextClose);
  }, []);
};
