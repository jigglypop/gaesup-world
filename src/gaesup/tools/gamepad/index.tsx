// GamePad.tsx
import { useSnapshot } from 'valtio';
import { gameStore } from '../../store/gameStore';
import GamePadButton from './GamePadButton';
import './style.css';
import { gameBoyDirectionType, gamepadType } from './type';

export const gamepadDefault = {
  on: true,
};

export function GamePad(props: gamepadType) {
  const { gamePadStyle, gamePadButtonStyle, label } = props;
  const inputSystem = useSnapshot(gameStore.input);
  const mode = useSnapshot(gameStore.ui.mode);
  const keyboard = inputSystem.keyboard;
  const GamePadDirections = Object.keys(keyboard)
    .map((key: string) => {
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
