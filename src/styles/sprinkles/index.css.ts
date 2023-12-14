import { createSprinkles } from "@vanilla-extract/sprinkles";
import { colorProperties } from "./color.css.js";
import { directionProperties } from "./direction.css.js";
import { displayProperties } from "./display.css.js";
import { fontSizeProperties } from "./fontSize.css.js";
import { gridProperties } from "./grid.css.js";
import { marginProperties } from "./margin.css.js";
import { paddingProperties } from "./padding.css.js";
import { positionProperties } from "./position.css.js";
import { sizeProperties } from "./size.css.js";

export const sprinkles: any = createSprinkles(
  colorProperties,
  directionProperties,
  displayProperties,
  gridProperties,
  marginProperties,
  paddingProperties,
  positionProperties,
  fontSizeProperties,
  sizeProperties
);
