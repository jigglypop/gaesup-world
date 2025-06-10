import {
  gridTemplateColumns,
  gridTemplateRows,
} from "@styles/constants/grid.css";
import { defineProperties } from "@vanilla-extract/sprinkles";

export const gridProperties = defineProperties({
  conditions: {
    mobile: {},
    tablet: { "@media": "(min-width: 768px)" },
    laptop: { "@media": "(min-width: 1024px)" },
    desktop: { "@media": "(min-width: 1440px)" },
  },
  defaultCondition: "mobile",
  properties: {
    gridTemplateColumns: gridTemplateColumns,
    gridTemplateRows: gridTemplateRows,
  },
  shorthands: {
    gtc: ["gridTemplateColumns"],
    gtr: ["gridTemplateRows"],
  },
});
