import { defineProperties } from "@vanilla-extract/sprinkles";
import { persent, rem, size } from "../constants/constant.css.js";

const properties = { ...persent, ...size, ...rem };

export const sizeProperties = defineProperties({
  conditions: {
    mobile: {},
    tablet: { "@media": "(min-width: 768px)" },
    laptop: { "@media": "(min-width: 1024px)" },
    desktop: { "@media": "(min-width: 1440px)" },
  },
  defaultCondition: "mobile",
  properties: {
    width: properties,
    height: properties,
  },
  shorthands: {
    w: ["width"],
    h: ["height"],
  },
});
