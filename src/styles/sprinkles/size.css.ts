import { persent, rem, size } from "@styles/constants/constant.css";
import { defineProperties } from "@vanilla-extract/sprinkles";

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
