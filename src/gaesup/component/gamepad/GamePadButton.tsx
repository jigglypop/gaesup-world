import { useState } from 'react';
import { useKeyboard } from '../../hooks/useKeyboard';
import './style.css';
import { GamePadButtonType } from './types';

export default function GamePadButton({ value, name, gamePadButtonStyle }: GamePadButtonType) {
  const [isClicked, setIsClicked] = useState(false);
  const { pushKey } = useKeyboard();

  const onMouseDown = () => {
    pushKey(value, true);
    setIsClicked(true);
  };

  const onMouseLeave = () => {
    pushKey(value, false);
    setIsClicked(false);
  };

  return (
    <button
      className={`pad-button ${isClicked ? 'is-clicked' : ''}`}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseLeave}
      onMouseLeave={onMouseLeave}
      onContextMenu={(e) => {
        e.preventDefault();
        onMouseLeave();
      }}
      onPointerDown={onMouseDown}
      onPointerUp={onMouseLeave}
      style={gamePadButtonStyle}
    >
      {name}
    </button>
  );
}
