// GamePad.tsx
import { useAtomValue } from 'jotai';
import { inputAtom, modeStateAtom } from '../../atoms';
import GamePadButton from './GamePadButton';
import './style.css';
import { gameBoyDirectionType, gamepadType } from './type';

export const gamepadDefault = {
  on: true,
};

export function GamePad(props: gamepadType) {
  const { gamePadStyle, gamePadButtonStyle, label } = props;
  const inputSystem = useAtomValue(inputAtom);
  const mode = useAtomValue(modeStateAtom);
  const keyboard = inputSystem.keyboard;
  const GamePadDirections = Object.keys(keyboard)
    .map((key) => {
      const name = label?.[key] || key;
      if (
        key !== 'forward' &&
        key !== 'backward' &&
        key !== 'leftward' &&
        key !== 'rightward' &&
        key !== 'run'
      )
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
        <div className="game-pad" style={gamePadStyle}>
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
