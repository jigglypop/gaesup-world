import { useKeyboard } from '@hooks/useKeyboard';
import { useGaesupStore } from '@stores/gaesupStore';

import GamePadButton from './GamePadButton';
import './styles.css';
import { gamepadType } from './types';

export const gamepadDefault = {
  on: true,
};

export function GamePad(props: gamepadType) {
  const { gamePadStyle, gamePadButtonStyle, label } = props;
  const keyboard = useGaesupStore((state) => state.interaction?.keyboard);
  const { mode } = useGaesupStore();
  useKeyboard();

  const GamePadDirections = Object.keys(keyboard || {})
    .map((key: string) => {
      const name = label?.[key] || key;
      if (
        key === 'forward' ||
        key === 'backward' ||
        key === 'leftward' ||
        key === 'rightward'
      ) {
        return {
          key,
          name,
          type: 'direction',
          active: keyboard?.[key as keyof typeof keyboard] || false,
        };
      }
      return {
        key,
        name,
        type: 'action',
        active: keyboard?.[key as keyof typeof keyboard] || false,
      };
    })
    .filter(Boolean);

  return (
    <div
      className="gamepad-container"
      style={{
        ...gamePadStyle,
        display: mode?.controller === 'gamepad' ? 'flex' : 'none',
      }}
    >
      {GamePadDirections.map((direction) => (
        <GamePadButton
          key={direction.key}
          value={direction.key}
          name={direction.name}
          gamePadButtonStyle={gamePadButtonStyle}
        />
      ))}
    </div>
  );
}

export default GamePad;
export { GamePad as Gamepad };
