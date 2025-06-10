import { createSprinkles } from "@vanilla-extract/sprinkles";

import { colorProperties } from "./color.css";
import { directionProperties } from "./direction.css";
import { displayProperties } from "./display.css";
import { gridProperties } from "./grid.css";
import { positionProperties } from "./position.css";

export const sprinkles = createSprinkles(
  colorProperties,
  directionProperties,
  displayProperties,
  gridProperties,
  positionProperties
);
