import { useEffect, useRef, useState } from 'react';

import './styles.css';
import { GamePadButtonType } from './types';

export default function GamePadButton({ value, name, gamePadButtonStyle, onInput }: GamePadButtonType & {
  onInput: (key: string, down: boolean) => boolean;
}) {
  const [isClicked, setIsClicked] = useState(false);
  const pressed = useRef(false);
  const inputRef = useRef(onInput);
  inputRef.current = onInput;

  const handlePress = () => {
    if (pressed.current || !onInput(value, true)) return;
    pressed.current = true;
    setIsClicked(true);
  };

  const handleRelease = () => {
    if (!pressed.current) return;
    onInput(value, false);
    pressed.current = false;
    setIsClicked(false);
  };

  useEffect(() => () => {
    if (pressed.current) inputRef.current(value, false);
    pressed.current = false;
  }, [value]);

  useEffect(() => {
    if (!isClicked) return;
    const handleCancel = () => {
      if (pressed.current) inputRef.current(value, false);
      pressed.current = false;
      setIsClicked(false);
    };
    const handleVisibilityChange = () => {
      if (document.hidden) handleCancel();
    };
    window.addEventListener('blur', handleCancel);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('blur', handleCancel);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isClicked, value]);

  return (
    <button
      type="button"
      className={`pad-button ${isClicked ? 'is-clicked' : ''}`}
      aria-pressed={isClicked}
      onBlur={handleRelease}
      onContextMenu={(e) => {
        e.preventDefault();
        handleRelease();
      }}
      onPointerDown={handlePress}
      onPointerUp={handleRelease}
      onPointerLeave={handleRelease}
      onPointerCancel={handleRelease}
      onKeyDown={(event) => {
        if (event.key !== ' ' && event.key !== 'Enter') return;
        event.preventDefault();
        event.stopPropagation();
        handlePress();
      }}
      onKeyUp={(event) => {
        if (event.key !== ' ' && event.key !== 'Enter') return;
        event.preventDefault();
        event.stopPropagation();
        handleRelease();
      }}
      style={gamePadButtonStyle}
    >
      {name}
    </button>
  );
}
