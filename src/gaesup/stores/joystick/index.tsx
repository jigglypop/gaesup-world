import { atom, useAtom } from 'jotai';
import { useCallback } from 'react';

export type joyStickBallType = {
  x: string;
  y: string;
  position: string;
  background: string;
  boxShadow: string;
};

export type joyStickOriginType = {
  x: number;
  y: number;
  angle: number;
  currentRadius: number;
  originRadius: number;
  isIn: boolean;
  isOn: boolean;
};

export const joyStickBallAtom = atom<joyStickBallType>({
  x: '50%',
  y: '50%',
  position: 'absolute',
  background: 'rgba(0, 0, 0, 0.5)',
  boxShadow: '0 0 10px  rgba(0, 0, 0, 0.5)'
});

export const joyStickOriginAtom = atom<joyStickOriginType>({
  x: 0,
  y: 0,
  angle: Math.PI / 2,
  currentRadius: 0,
  originRadius: 0,
  isIn: true,
  isOn: false
});

joyStickOriginAtom.debugPrivate = true;
joyStickBallAtom.debugPrivate = true;

export default function useJoyStick() {
  const [joyStickOrigin, setJoyStickOrigin] = useAtom(joyStickOriginAtom);
  const [joyStickBall, setJoyStickBall] = useAtom(joyStickBallAtom);
  const setBall = useCallback(
    (ball: joyStickBallType) => {
      setJoyStickBall((JoyStick) => ({ ...JoyStick, ...ball }));
    },
    [joyStickBall, setJoyStickBall]
  );

  const setOrigin = useCallback(
    (origin: joyStickOriginType) => {
      setJoyStickOrigin((JoyStick) => ({
        ...JoyStick,
        ...origin
      }));
    },
    [joyStickBall, setJoyStickBall]
  );
  return {
    joyStickOrigin,
    joyStickBall,
    setJoyStickBall,
    setJoyStickOrigin,
    setBall,
    setOrigin
  };
}
