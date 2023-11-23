import { defineProperties } from '@vanilla-extract/sprinkles';

export const positionProperties = defineProperties({
  conditions: {
    mobile: {},
    tablet: { '@media': '(min-width: 768px)' },
    laptop: { '@media': '(min-width: 1024px)' },
    desktop: { '@media': '(min-width: 1440px)' }
  },
  defaultCondition: 'mobile',
  properties: {
    position: ['static', 'relative', 'absolute', 'fixed']
  }
});
