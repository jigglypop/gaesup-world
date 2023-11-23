import { fraction } from '@styles/constants/constant.css';
import {
  gridTemplateColumns,
  gridTemplateRows
} from '@styles/constants/grid.css';
import { defineProperties } from '@vanilla-extract/sprinkles';

export const gridProperties = defineProperties({
  conditions: {
    mobile: {},
    tablet: { '@media': '(min-width: 768px)' },
    laptop: { '@media': '(min-width: 1024px)' },
    desktop: { '@media': '(min-width: 1440px)' }
  },
  defaultCondition: 'mobile',
  properties: {
    gridTemplateColumns: gridTemplateColumns,
    gridTemplateRows: gridTemplateRows,
    gridColumn: fraction,
    gridRow: fraction
  },
  shorthands: {
    gtc: ['gridTemplateColumns'],
    gtr: ['gridTemplateRows'],
    gc: ['gridColumn'],
    gr: ['gridRow']
  }
});
