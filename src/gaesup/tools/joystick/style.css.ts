import { fixed, flex } from '@styles/recipe/index.css';
import { style } from '@vanilla-extract/css';

export const joyStick = style([
  fixed({
    south: true
  }),
  flex({
    column: '6'
  }),
  {
    width: '100%'
  }
]);

export const joyStickInner = style([
  flex({
    row: 'center'
  }),
  {
    margin: '3rem',
    padding: '4rem',
    borderRadius: '50%',
    background: 'rgba(0, 0, 0, 0.5)',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)'
  }
]);

export const joystickBall = style([
  {
    position: 'fixed',
    width: '4rem',
    height: '4rem',
    transform: 'translate(-50%, -50%)',
    borderRadius: '50%',
    background: 'rgba(0, 0, 0, 0.5)',
    boxShadow: '0 0 10px  rgba(0, 0, 0, 0.5)',
    cursor: 'pointer'
  }
]);
