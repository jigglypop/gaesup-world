import { persent, size } from '@styles/constants/constant.css';
import { defineProperties } from '@vanilla-extract/sprinkles';

const properties = { ...persent, ...size };

export const directionProperties = defineProperties({
  conditions: {
    mobile: {},
    tablet: { '@media': '(min-width: 768px)' },
    laptop: { '@media': '(min-width: 1024px)' },
    desktop: { '@media': '(min-width: 1440px)' }
  },
  defaultCondition: 'mobile',
  properties: {
    top: properties,
    left: properties,
    right: properties,
    bottom: properties
  },
  shorthands: {
    t: ['top'],
    l: ['left'],
    r: ['right'],
    b: ['bottom']
  }
});
