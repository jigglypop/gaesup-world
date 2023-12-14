import { recipe } from "@vanilla-extract/recipes";
import { fraction, repeat } from "../constants/constant.css.js";
import { clock, direction } from "../constants/direction.css.js";
import { aligns } from "../constants/flex.css.js";
import { gridTemplateAll } from "../constants/grid.css.js";
import {
  absolute_base,
  fixed_base,
  flex_base,
  glass_base,
  grid_base,
  relative_base,
} from "./base.css.js";

export const glass = recipe({
  base: [glass_base],
});

export const baseVarients = {
  ...direction,
  ...clock,
  ...aligns,
  fullXY: {
    width: "full",
    height: "full",
  },
};

export const gridVarient = {
  ...repeat,
  ...gridTemplateAll,
};

export const gridVarients = {
  gridTemplateRows: gridVarient,
  gridTemplateColumns: gridVarient,
  gtr: gridVarient,
  gtc: gridVarient,
  gr: fraction,
  gc: fraction,
};

export const gridBaseVarients = {
  ...baseVarients,
  ...gridVarients,
};

// relative
export const relative = recipe({
  base: [relative_base],
  variants: gridBaseVarients,
});
// absolute
export const absolute = recipe({
  base: [absolute_base],
  variants: {
    ...gridBaseVarients,
    center: {
      true: {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      },
    },
  },
});
// fixed 모음
export const fixed = recipe({
  base: [fixed_base],
  variants: baseVarients,
});

export const flex = recipe({
  base: [flex_base],
  variants: { ...baseVarients, ...gridVarients },
});

export const grid = recipe({
  base: [grid_base],
  variants: gridBaseVarients,
});
// flex_relative 합치기
export const flex_relative = recipe({
  base: [flex_base, relative_base],
  variants: gridBaseVarients,
});
// flex_absolute 합치기
export const flex_absolute = recipe({
  base: [flex_base, absolute_base],
  variants: {
    ...gridBaseVarients,
    center: {
      true: {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      },
    },
  },
});
// flex_fixed 합치기
export const flex_fixed = recipe({
  base: [flex_base, fixed_base],
  variants: gridBaseVarients,
});
// grid_relative 합치기
export const grid_relative = recipe({
  base: [grid_base, relative_base],
  variants: gridBaseVarients,
});
// grid_absolute 합치기
export const grid_absolute = recipe({
  base: [grid_base, absolute_base],
  variants: gridBaseVarients,
});
// grid_fixed 합치기
export const grid_fixed = recipe({
  base: [grid_base, fixed_base],
  variants: gridBaseVarients,
});

// 그라디언트 모음
export const gradient = recipe({
  base: {
    background:
      "linear-gradient(45deg, #000000, #000000) padding-box,linear-gradient(45deg, #8e2de2, #4a00e0) border-box;",
  },
  variants: {
    purple: {
      background:
        "linear-gradient(45deg, #000000, #000000) padding-box,linear-gradient(45deg, #8e2de2, #4a00e0) border-box;",
    },
  },
});
