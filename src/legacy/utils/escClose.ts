import useUpdateRoom from "@store/update";
import { useEffect } from "react";

export const useEscCloseEffect = (cb: Function) => {
  useEffect(() => {
    const escKeyModalClose = (e: { keyCode: number }) => {
      if (e.keyCode === 27) cb();
    };
    window.addEventListener("keydown", escKeyModalClose);
    return () => window.removeEventListener("keydown", escKeyModalClose);
  }, []);
};

export const useNumberKeyEffect = ({
  zeroCb,
  oneCb,
  twoCb,
  threeCb,
  fourCb,
  fiveCb,
  sixCb,
  sevenCb,
  eightCb,
  nineCb,
}: {
  zeroCb?: Function;
  oneCb?: Function;
  twoCb?: Function;
  threeCb?: Function;
  fourCb?: Function;
  fiveCb?: Function;
  sixCb?: Function;
  sevenCb?: Function;
  eightCb?: Function;
  nineCb?: Function;
}) => {
  useEffect(() => {
    const numberKeyAction = (e: { keyCode: number }) => {
      if (e.keyCode === 48 && zeroCb) zeroCb();
      if (e.keyCode === 49 && oneCb) oneCb();
      if (e.keyCode === 50 && twoCb) twoCb();
      if (e.keyCode === 51 && threeCb) threeCb();
      if (e.keyCode === 52 && fourCb) fourCb();
      if (e.keyCode === 53 && fiveCb) fiveCb();
      if (e.keyCode === 54 && sixCb) sixCb();
      if (e.keyCode === 55 && sevenCb) sevenCb();
      if (e.keyCode === 56 && eightCb) eightCb();
      if (e.keyCode === 57 && nineCb) nineCb();
    };
    window.addEventListener("keydown", numberKeyAction);
    return () => window.removeEventListener("keydown", numberKeyAction);
  }, []);
};

export const useArrowKeyEffect = ({
  leftCb,
  rightCb,
  upCb,
  downCb,
}: {
  leftCb?: Function;
  rightCb?: Function;
  upCb?: Function;
  downCb?: Function;
}) => {
  useEffect(() => {
    const arrowKeyAction = (e: { keyCode: number }) => {
      if (e.keyCode === 37 && leftCb) leftCb();
      if (e.keyCode === 38 && upCb) upCb();
      if (e.keyCode === 39 && rightCb) rightCb();
      if (e.keyCode === 40 && downCb) downCb();
    };
    window.addEventListener("keydown", arrowKeyAction);
    return () => window.removeEventListener("keydown", arrowKeyAction);
  }, []);
};

export const useArrowKeyInit = () => {
  const { setDirection } = useUpdateRoom();
  useArrowKeyEffect({
    rightCb: () => {
      setDirection({ y: Math.PI / 2, direction: "W" });
    },
    leftCb: () => {
      setDirection({ y: (Math.PI * 3) / 2, direction: "E" });
    },
    downCb: () => {
      setDirection({ y: Math.PI * 2, direction: "S" });
    },
    upCb: () => {
      setDirection({ y: Math.PI, direction: "N" });
    },
  });
};
