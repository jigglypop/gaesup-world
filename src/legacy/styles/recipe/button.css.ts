import { scDream } from "@styles/fonts.css";
import { vars } from "@styles/theme.css";
import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";
import { flex, glass } from "./index.css";

export const button = style([
  glass({}),
  flex({}),
  {
    width: "100%",
    minWidth: "8rem",
    margin: "1rem",
    padding: "0.5rem",
    borderRadius: "0.5rem",
    background: vars.gradient.gray,
    boxShadow: "0 0 10px #1d1d1d",
    transition: "all 0.3s ease-in",
    fontSize: "1.3rem",
    color: "rgba(255, 255, 255, 0.8)",
    cursor: "pointer",
    fontFamily: scDream,
    userSelect: "none",
    WebkitUserSelect: "none",
    fontWeight: 400,
    selectors: {
      "&:hover": {
        boxShadow: "0 0 20px #1d1d1d",
      },
    },
    "@media": {
      "(max-width: 1024px)": {
        width: "12rem",
        fontSize: "1.4rem",
      },
    },
  },
]);

export const buttonRecipe = recipe({
  base: button,
  variants: {
    disabled: {
      true: {
        opacity: 0.2,
        background: "rgba(255, 255, 255, 0.4)",
      },
      false: {},
    },
    shape: {
      circle: {
        width: "4rem",
        height: "4rem",
        borderRadius: "50%",
      },
      square: {
        width: "5rem",
        height: "4rem",
        borderRadius: "1rem",
      },
      smallSquare: {
        width: "12rem",
        height: "3rem",
        borderRadius: "1rem",
      },
    },
    color: {
      black: {
        background: vars.gradient.black,
        color: "rgba(255, 255, 255, 0.9)",
        textShadow: `0 0 1rem rgba(255, 255, 255, 0.1)`,
        boxShadow: `0 0 10px rgba(255, 255, 255, 0.1)`,
        selectors: {
          "&:hover": {
            boxShadow: "0 0 30px rgba(255, 255, 255, 0.1)",
          },
        },
      },
      blackGlass: {
        background:
          "radial-gradient(circle, rgba(50,50,50,0.4) 0%, rgba(100,100,100,0.4) 100%)",
        color: "rgba(220, 220, 220, 0.8)",
        textShadow: `0 0 1rem rgba(220, 220, 220, 0.8)`,
        boxShadow: `0 0 10px rgba(50,50,50,0.4)`,
        selectors: {
          "&:hover": {
            boxShadow: "0 0 30px rgba(50,50,50,0.4)",
          },
        },
      },
      mintSmall: {
        background: vars.gradient.mint,
        color: "rgba(0, 0, 0, 0.7)",
        textShadow: `0 0 1rem rgba(255, 255, 255, 0.1)`,
        boxShadow: `0 0 10px #a1ffce`,
        selectors: {
          "&:hover": {
            boxShadow: "0 0 20px #a1ffce",
          },
        },
      },
      green: {
        background: vars.gradient.green,
        color: "rgba(0, 0, 0, 0.7)",
        textShadow: `0 0 1rem rgba(255, 255, 255, 0.1)`,
        boxShadow: `0 0 10px #a1ffce`,
        selectors: {
          "&:hover": {
            boxShadow: "0 0 20px #a1ffce",
          },
        },
      },
      mint: {
        background: vars.gradient.mint,
        color: "rgba(50, 50, 50, 0.9)",
        textShadow: `0 0 1rem rgba(50, 50, 50, 0.8)`,
        boxShadow: `0 0 10px rgba(99,251,215,0.8)`,
        selectors: {
          "&:hover": {
            boxShadow: "0 0 20px rgba(99,251,215,0.8)",
          },
        },
      },
      pink: {
        background: vars.gradient.cherryBlossom,
        color: "rgba(50, 50, 50, 0.9)",
        textShadow: `0 0 1rem rgba(50, 50, 50, 0.8)`,
        boxShadow: `0 0 1.5rem rgba(252,37,103,0.6)`,
        selectors: {
          "&:hover": {
            boxShadow: "0 0 2rem rgba(252,37,103,0.8)",
          },
        },
      },
      purple: {
        background: vars.gradient.purple,
        color: "rgba(255, 255, 255, 0.8)",
        textShadow: `0 0 1rem rgba(255, 255, 255, 0.1)`,
        boxShadow: `0 0 5px #8e2de2`,
        width: "5rem",
        height: "2.5rem",
        fontSize: "1.3rem",
        selectors: {
          "&:hover": {
            boxShadow: "0 0 10px #8e2de2",
          },
        },
      },
      gray: {
        background: vars.gradient.gray,
        color: "rgba(0, 0, 0, 0.9)",
        textShadow: `0 0 1rem rgba(0, 0, 0, 0.9)`,
        boxShadow: `0 0 0.5rem rgba(255, 255, 255, 0.4)`,
        selectors: {
          "&:hover": {
            boxShadow: "0 0 20px rgba(0, 0, 0, 1)",
          },
        },
      },
      bluePurple: {
        background: vars.gradient.bluePurple,
        color: "rgba(255, 255, 255, 0.8)",
        textShadow: `0 0 1rem rgba(255, 255, 255, 0.1)`,
        boxShadow: `0 0 10px #8a2be2`,
        selectors: {
          "&:hover": {
            boxShadow: "0 0 20px #8a2be2",
          },
        },
      },
      sunset: {
        background: vars.gradient.sunset,
        color: "rgba(255, 255, 255, 0.8)",
        textShadow: `0 0 1rem rgba(255, 255, 255, 0.1)`,
        boxShadow: `0 0 10px #ff4500`,
        selectors: {
          "&:hover": {
            boxShadow: "0 0 20px #ff4500",
          },
        },
      },
      peach: {
        background: "linear-gradient(120deg, #ffecd2 0%, #fcb69f 100%)",
        color: "rgba(255, 255, 255, 0.8)",
        textShadow: `0 0 1rem rgba(255, 255, 255, 0.1)`,
        boxShadow: `0 0 10px #fcb69f`,
        selectors: {
          "&:hover": {
            boxShadow: "0 0 20px #fcb69f",
          },
        },
      },
      cherryBlossom: {
        background:
          "linear-gradient(120deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)",
        color: "rgba(255, 255, 255, 0.8)",
        textShadow: `0 0 1rem rgba(255, 255, 255, 0.1)`,
        boxShadow: `0 0 10px #ff9a9e`,
        selectors: {
          "&:hover": {
            boxShadow: "0 0 20px #ff9a9e",
          },
        },
      },
      lavender: {
        background: "linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)",
        color: "rgba(255, 255, 255, 0.8)",
        textShadow: `0 0 1rem rgba(255, 255, 255, 0.1)`,
        boxShadow: `0 0 10px #e0c3fc`,
        selectors: {
          "&:hover": {
            boxShadow: "0 0 20px #e0c3fc",
          },
        },
      },
      sunrise: {
        background: "linear-gradient(120deg, #fbc2eb 0%, #a6c1ee 100%)",
        color: "rgba(255, 255, 255, 0.8)",
        textShadow: `0 0 1rem rgba(255, 255, 255, 0.1)`,
        boxShadow: `0 0 10px #fbc2eb`,
        selectors: {
          "&:hover": {
            boxShadow: "0 0 20px #fbc2eb",
          },
        },
      },
      twilight: {
        background: "linear-gradient(120deg, #0ba360 0%, #3cba92 100%)",
        color: "rgba(255, 255, 255, 0.8)",
        textShadow: `0 0 1rem rgba(255, 255, 255, 0.1)`,
        boxShadow: `0 0 10px #0ba360`,
        selectors: {
          "&:hover": {
            boxShadow: "0 0 20px #0ba360",
          },
        },
      },
      fire: {
        background: "linear-gradient(120deg, #f12711 0%, #f5af19 100%)",
        color: "rgba(255, 255, 255, 0.8)",
        textShadow: `0 0 1rem rgba(255, 255, 255, 0.1)`,
        boxShadow: `0 0 10px #f12711`,
        selectors: {
          "&:hover": {
            boxShadow: "0 0 20px #f12711",
          },
        },
      },
      sky: {
        background: "linear-gradient(120deg, #89f7fe 0%, #66a6ff 100%)",
        color: "rgba(255, 255, 255, 0.8)",
        textShadow: `0 0 1rem rgba(255, 255, 255, 0.1)`,
        boxShadow: `0 0 10px #89f7fe`,
        selectors: {
          "&:hover": {
            boxShadow: "0 0 20px #89f7fe",
          },
        },
      },
    },
    defaultVariants: {
      color: "gray",
      disabled: "false",
      shape: "square",
    },
  },
});
