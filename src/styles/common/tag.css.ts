import { glass, flex } from '@styles/recipe/index.css';
import { vars } from '@styles/theme.css';
import { style } from '@vanilla-extract/css';

export const tagItem = style([
  glass({}),
  flex({}),
  {
    margin: '0.5rem',
    padding: '1rem',
    fontSize: '0.75rem',
    backgroundColor: vars.themes.glass.reverse,
    color: vars.themes.text.reverse,
    borderRadius: '1rem',
    position: 'relative',
    boxShadow: `0 0 1rem ${vars.themes.glass.reverse}`,
    cursor: 'pointer',
    transition: 'all 0.2s ease-in',
    selectors: {
      '&:hover': {
        backgroundColor: vars.themes.glass.normal,
        boxShadow: `0 0 1rem ${vars.themes.glass.normal}`,
        color: vars.themes.text.normal
      }
    }
  }
]);
