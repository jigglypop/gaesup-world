import { useKeyboard } from '@hooks/useKeyboard';
import { useGaesupStore } from '@stores/gaesupStore';

import GamePadButton from './GamePadButton';
import './styles.css';
import { gamepadType } from './types';

export const gamepadDefault = {
  on: true,
};

const DEFAULT_LABELS: Readonly<Record<string, string>> = {
  forward: '앞으로', backward: '뒤로', leftward: '왼쪽', rightward: '오른쪽',
  shift: '달리기', space: '점프', escape: '취소',
  keyZ: '동작 Z', keyR: '동작 R', keyF: '동작 F', keyE: '동작 E',
};

export function GamePad(props: gamepadType) {
  const { gamePadStyle, gamePadButtonStyle, label } = props;
  const keyboard = useGaesupStore((state) => state.interaction?.keyboard);
  const mode = useGaesupStore((state) => state.mode);
  const { pushKey } = useKeyboard(true, true, undefined, mode?.controller === 'gamepad', false);
  if (mode?.controller !== 'gamepad') return null;

  return (
    <div
      className="gamepad-container"
      style={{
        ...gamePadStyle,
        display: 'flex',
      }}
    >
      {Object.keys(keyboard ?? {}).map((key) => (
        <GamePadButton
          key={key}
          value={key}
          name={label?.[key] ?? DEFAULT_LABELS[key] ?? key}
          onInput={pushKey}
          gamePadButtonStyle={gamePadButtonStyle}
        />
      ))}
    </div>
  );
}

export default GamePad;
export { GamePad as Gamepad };
