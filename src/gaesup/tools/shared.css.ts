import { style } from '@vanilla-extract/css';

export const flexCenter = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
});

export const commonButton = style([
  flexCenter,
  {
    width: '5rem',
    height: '5rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease-in',
    boxShadow: '0 0 0.5rem rgba(0, 0, 0, 0.5)',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: 'white',
    selectors: {
      '&:hover': {
        boxShadow: '0 0 1rem rgba(0, 0, 0, 0.5)',
      },
    },
  },
]);

export const minimapSize = {
  width: '18rem',
  height: '18rem',
  '@media': {
    'screen and (max-width: 1024px)': {
      width: '17rem',
      height: '17rem',
    },
    'screen and (max-width: 768px)': {
      width: '16rem',
      height: '16rem',
    },
  },
};
