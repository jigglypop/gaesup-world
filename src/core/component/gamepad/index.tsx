import GamePadButton from './GamePadButton';
import './style.css';
import { gameBoyDirectionType, gamepadType, GamepadProps } from './types';
import { useKeyboard } from '@hooks/useKeyboard';
import { useGaesupStore } from '@stores/gaesupStore';

export const gamepadDefault = {
  on: true,
};

export function GamePad(props: gamepadType) {
  const { gamePadStyle, gamePadButtonStyle, label } = props;
  const { input, mode } = useGaesupStore();
  const keyboard = input.keyboard;
  useKeyboard();

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

export function Gamepad({ children }: GamepadProps) {
  useKeyboard();
  return <>{children}</>;
}
