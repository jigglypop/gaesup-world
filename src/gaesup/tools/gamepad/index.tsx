// GamePad.tsx
import { useContext } from 'react';
import { useAtomValue } from 'jotai';
import { GaesupWorldContext } from '../../world/context';
import { modeAtom } from '../../atoms';
import GamePadButton from './GamePadButton';
import * as S from './style.css';
import { gameBoyDirectionType, gamepadType } from './type';

export const gamepadDefault = {
  on: true,
};

export function GamePad(props: gamepadType) {
  const { gamePadStyle, gamePadButtonStyle, label } = props;
  const { control } = useContext(GaesupWorldContext);
  const mode = useAtomValue(modeAtom);
  const GamePadDirections = Object.keys(control)
    .map((key) => {
      const name = label?.[key] || key;
      if (key !== 'forward' && key !== 'backward' && key !== 'leftward' && key !== 'rightward')
        return {
          tag: key,
          value: key,
          name: name,
        };
    })
    .filter((item) => item !== undefined)
    .filter((item: gameBoyDirectionType) => !(item.tag === 'run'));

  return (
    <>
      {mode.controller === 'clicker' && (
        <div className={S.gamePad} style={gamePadStyle}>
          {GamePadDirections.map((item: gameBoyDirectionType, key: number) => {
            return (
              <GamePadButton
                key={key}
                value={item.value}
                name={item.name}
                gamePadButtonStyle={gamePadButtonStyle}
              />
            );
          })}
        </div>
      )}
    </>
  );
}
