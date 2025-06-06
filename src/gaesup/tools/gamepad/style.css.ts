import { globalStyle, style } from '@vanilla-extract/css';
import { commonButton } from '../shared.css';

export const gamePad = style({
  display: 'grid',
  alignItems: 'center',
  justifyContent: 'center',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gridTemplateRows: 'repeat(3, 1fr)',
});

export const padButton = style([
  commonButton,
  {
    position: 'relative',
    fontSize: '1rem',
    margin: '0.5rem',
    borderRadius: '50%',
    selectors: {
      '&::after': {
        content: '""',
        position: 'absolute',
        width: '4rem',
        height: '4rem',
        borderRadius: '50%',
        background: 'rgba(0, 0, 0, 0.2)',
        zIndex: 100000,
      },
    },
  },
]);

export const isClicked = style({
  background:
    'radial-gradient(circle at center, rgba(245, 177, 97, 1) 0.4%, rgba(236, 54, 110, 1) 100.2%)',
  boxShadow: '0 0 1rem rgba(245, 177, 97, 1)',
  color: 'black',
  transition: 'all 0.3s ease-in',
  borderRadius: '50%',
  selectors: {
    '&:hover': {
      boxShadow: '0 0 2rem rgba(245, 177, 97, 1)',
    },
  },
});
globalStyle(`${gamePad} *`, {
  WebkitTouchCallout: 'none',
  WebkitUserSelect: 'none',
  MozUserSelect: 'none',
  msUserSelect: 'none',
  userSelect: 'none',
});
