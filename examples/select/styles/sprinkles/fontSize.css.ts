import { defineProperties } from "@vanilla-extract/sprinkles";
import { persent, size } from "../constants/constant.css.js";

const persentSizeRem = {
  ...persent,
  ...size,
};

export const fontSizeProperties = defineProperties({
  conditions: {
    mobile: {},
    tablet: { "@media": "(min-width: 768px)" },
    laptop: { "@media": "(min-width: 1024px)" },
    desktop: { "@media": "(min-width: 1440px)" },
  },
  defaultCondition: "mobile",
  properties: {
    fontSize: persentSizeRem,
    lineHeight: persentSizeRem,
  },
  shorthands: {
    fs: ["fontSize"],
    lh: ["lineHeight"],
  },
});
