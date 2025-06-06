import { keyframes, style } from '@vanilla-extract/css';
import { MINIMAP_SIZE_PX, PRETENDARD_FONT } from '../constants';
const pulseWhite = keyframes({
  '0%': {
    boxShadow: '0 0 0 0 rgba(255, 255, 255, 0.7)',
    opacity: 1,
  },
  '70%': {
    boxShadow: '0 0 0 10px rgba(255, 255, 255, 0)',
    opacity: 0.7,
  },
  '100%': {
    boxShadow: '0 0 0 0 rgba(255, 255, 255, 0)',
    opacity: 1,
  },
});
export const baseStyles = {
  minimap: {
    position: 'absolute',
    bottom: '20px',
    left: '20px',
    width: `${MINIMAP_SIZE_PX}px`,
    height: `${MINIMAP_SIZE_PX}px`,
    zIndex: 100,
    cursor: 'pointer',
  },
  scale: {
    position: 'absolute',
    bottom: '20px',
    left: '230px',
    zIndex: 101,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: 'white',
    fontSize: '1rem',
    fontFamily: PRETENDARD_FONT,
    fontWeight: '400',
    background: 'rgba(0,0,0,0.5)',
    padding: '0.5rem 1rem',
    borderRadius: '1rem',
  },
  plusMinus: {
    cursor: 'pointer',
    width: '2rem',
    height: '2rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '50%',
    background: 'rgba(0,0,0,0.5)',
    fontFamily: PRETENDARD_FONT,
    fontWeight: '500',
    transition: 'all 0.2s',
    ':hover': {
      background: 'rgba(0,0,0,0.7)',
    },
  },
};
export const directionStyles = {
  color: 'white',
  fontSize: '1.5rem',
  fontFamily: PRETENDARD_FONT,
  fontWeight: 'bold',
};
export const objectStyles = {
  background: 'rgba(0,0,0,0.3)',
  boxShadow: '0 0 5px rgba(0,0,0,0.3)',
};
export const avatarStyles = {
  background: '#01fff7',
  boxShadow: '0 0 10px rgba(1,255,247,0.7)',
};
export const textStyles = {
  color: 'white',
  fontSize: '1rem',
  fontFamily: PRETENDARD_FONT,
  fontWeight: 'bold',
};
