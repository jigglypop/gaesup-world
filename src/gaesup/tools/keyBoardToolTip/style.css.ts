import { fixed, flex } from '@styles/recipe/index.css';
import { style } from '@vanilla-extract/css';

export const keyBoardToolTip = style([
  fixed({
    south: true
  }),
  flex({}),
  {
    width: '100vw'
  }
]);

export const keyBoardTooInner = style([
  flex({}),
  {
    display: 'grid',
    gridTemplateColumns: 'repeat(20, 2.5rem)',
    gridTemplateRows: 'repeat(10, 2.5rem)',
    gap: '0.5rem',
    width: '40rem',
    height: '20rem'
  }
]);

export const keyCap = style([
  flex({}),
  {
    fontSize: '0.8rem',
    borderRadius: '5px',
    width: '100%',
    height: '100%',
    color: 'white',
    background: 'rgba(0, 0, 0, 0.2)',
    boxShadow: '0 0 5px 0 rgba(0, 0, 0, 0.2)',
    transition: 'all 0.2s ease-in'
  }
]);
