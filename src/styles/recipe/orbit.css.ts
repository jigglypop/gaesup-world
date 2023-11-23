import {
  orbit1,
  orbit10,
  orbit2,
  orbit3,
  orbit4,
  orbit5,
  orbit6,
  orbit7,
  orbit8,
  orbit9
} from '@styles/constants/orbit.css';
import { recipe } from '@vanilla-extract/recipes';

export const orbit = recipe({
  base: [
    {
      animationDuration: '5s',
      animationIterationCount: 'infinite',
      animationTimingFunction: 'linear'
    }
  ],
  variants: {
    '1': {
      true: {
        animation: orbit1,
        animationDuration: '5s',
        animationIterationCount: 'infinite',
        animationTimingFunction: 'linear'
      }
    },
    '2': {
      true: {
        animation: orbit2,
        animationDuration: '5s',
        animationIterationCount: 'infinite',
        animationTimingFunction: 'linear'
      }
    },
    '3': {
      true: {
        animation: orbit3,
        animationDuration: '5s',
        animationIterationCount: 'infinite',
        animationTimingFunction: 'linear'
      }
    },
    '4': {
      true: {
        animation: orbit4,
        animationDuration: '5s',
        animationIterationCount: 'infinite',
        animationTimingFunction: 'linear'
      }
    },
    '5': {
      true: {
        animation: orbit5,
        animationDuration: '5s',
        animationIterationCount: 'infinite',
        animationTimingFunction: 'linear'
      }
    },
    '6': {
      true: {
        animation: orbit6,
        animationDuration: '5s',
        animationIterationCount: 'infinite',
        animationTimingFunction: 'linear'
      }
    },
    '7': {
      true: {
        animation: orbit7,
        animationDuration: '5s',
        animationIterationCount: 'infinite',
        animationTimingFunction: 'linear'
      }
    },
    '8': {
      true: {
        animation: orbit8,
        animationDuration: '5s',
        animationIterationCount: 'infinite',
        animationTimingFunction: 'linear'
      }
    },
    '9': {
      true: {
        animation: orbit9,
        animationDuration: '5s',
        animationIterationCount: 'infinite',
        animationTimingFunction: 'linear'
      }
    },
    '10': {
      true: {
        animation: orbit10,
        animationDuration: '5s',
        animationIterationCount: 'infinite',
        animationTimingFunction: 'linear'
      }
    }
  },
  compoundVariants: []
});
