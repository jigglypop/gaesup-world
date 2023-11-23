import { palette } from '@styles/constants/palette.css';
import { recipe } from '@vanilla-extract/recipes';

export const input = recipe({
  base: {
    width: '100%',
    '::-webkit-input-placeholder': {
      color: palette.gray200
    }
  },
  variants: {
    //glass
    glass: {
      true: {
        backdropFilter: 'blur(2rem)',
        WebkitBackdropFilter: 'blur(2rem)',
        borderRadius: '1rem'
      }
    },
    white: {
      true: {
        borderRadius: '1rem',
        background: 'rgba(255, 255, 255, 0.2)',
        boxShadow: '0 0 10px rgba(255, 255, 255, 0.2)'
      }
    },
    transparent: {
      true: {
        background: 'transparent'
      }
    }
  }
});
