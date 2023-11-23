'use client';
import { controlAtom } from '@gaesup/stores/control';
import { optionsAtom } from '@gaesup/stores/options';
import { useAtom, useAtomValue } from 'jotai';
import { useEffect } from 'react';
import GameBoy from './gameboy';
import JoyStick from './joystick';
import JumpPoint from './jumpPoint';
import KeyBoardToolTip from './keyBoardToolTip';
import MiniMap from './minimap';

export default function GaeSupTools({
  keyboardMap
}: {
  keyboardMap: { name: string; keys: string[] }[];
}) {
  const options = useAtomValue(optionsAtom);
  const [control, setControl] = useAtom(controlAtom);
  const { controllerType } = options;
  useEffect(() => {
    const keyboard = keyboardMap.reduce((maps, keyboardMapItem) => {
      maps[keyboardMapItem.name] = false;
      return maps;
    }, {});
    setControl((control) => ({
      ...Object.assign(control, keyboard)
    }));
  }, []);
  return (
    <>
      {controllerType === 'joystick' && <JoyStick />}
      {controllerType === 'gameboy' && <GameBoy />}

      {options.minimap && <MiniMap />}
      {controllerType === 'keyboard' && (
        <KeyBoardToolTip keyboardMap={keyboardMap} />
      )}
      <JumpPoint />
    </>
  );
}
