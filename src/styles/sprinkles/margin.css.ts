import { defineProperties } from "@vanilla-extract/sprinkles";
import { persent, rem, size } from "../constants/constant.css";

const properties = { ...persent, ...size, ...rem };

export const marginProperties = defineProperties({
  conditions: {
    mobile: {},
    tablet: { "@media": "(min-width: 768px)" },
    laptop: { "@media": "(min-width: 1024px)" },
    desktop: { "@media": "(min-width: 1440px)" },
  },
  defaultCondition: "mobile",
  properties: {
    margin: properties,
    marginBottom: properties,
    marginTop: properties,
    marginLeft: properties,
    marginRight: properties,
  },
  shorthands: {
    m: ["margin"],
    mb: ["marginBottom"],
    mt: ["marginTop"],
    ml: ["marginLeft"],
    mr: ["marginRight"],
    mX: ["marginLeft", "marginRight"],
    mY: ["marginTop", "marginBottom"],
  },
});
