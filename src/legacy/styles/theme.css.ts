import {
  createGlobalTheme,
  createTheme,
  createThemeContract,
} from "@vanilla-extract/css";

const root = createGlobalTheme(":root", {
  fonts: {
    heading: "Georgia, Times, Times New Roman, serif",
  },
  gradient: {
    gray: "radial-gradient( circle farthest-corner at 10.2% 55.8%, #bbbbbb 0%, #cccccc 44.2% );",
    black:
      "radial-gradient( circle farthest-corner at 10.2% 55.8%,  #111111 0%, #232526 66.2% );",
    purple: "linear-gradient(45deg,#8e2de2, #4a00e0)",
    bluePurple:
      "radial-gradient( circle farthest-corner at 11.7% 80.6%,  rgba(249,185,255,1) 0%, rgba(177,172,255,1) 49.3%, rgba(98,203,255,1) 89% );",
    mint: "linear-gradient(45deg, #a1ffce, #faffd1);",
    green:
      "linear-gradient( 68.4deg,  rgba(99,251,215,1) -0.4%, rgba(5,222,250,1) 100.2% );",
    greenTransparent:
      "linear-gradient( 68.4deg,  rgba(99,251,215,0.8) -0.4%, rgba(5,222,250,0.8) 100.2% );",
    red: "linear-gradient( 68.3deg,  rgba(245,177,97,1) 0.4%, rgba(236,54,110,1) 100.2% );",
    pink: "radial-gradient( circle farthest-corner at 10.2% 55.8%,  rgba(252,37,103,1) 0%, rgba(250,38,151,1) 46.2%, rgba(186,8,181,1) 90.1% );",
    blueGreen:
      "linear-gradient(68.4deg,  rgba(0,242,96,1) 10%, rgba(5,117,230,1) 80% );",
    sunset: "linear-gradient(120deg, #f6d365 0%, #fda085 100%)",
    oceanBlue: "linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)",
    peach: "linear-gradient(120deg, #ffecd2 0%, #fcb69f 100%)",
    cherryBlossom:
      "linear-gradient(120deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)",
    lavender: "linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)",
    sunrise: "linear-gradient(120deg, #fbc2eb 0%, #a6c1ee 100%)",
    twilight: "linear-gradient(120deg, #0ba360 0%, #3cba92 100%)",
    fire: "linear-gradient(120deg, #f12711 0%, #f5af19 100%)",
    sky: "linear-gradient(120deg, #89f7fe 0%, #66a6ff 100%)",
  },
});

export const themes = createThemeContract({
  background: null,
  scrollBarTrack: null,
  textarea: null,
  sunmoon: null,
  text: {
    normal: null,
    reverse: null,
  },
  comment: null,
  tag: null,
  code: null,
  blockquote: null,
  placeholder: null,

  glass: {
    normal: null,
    reverse: null,
  },
  debug: null,
  toc: {
    selected: null,
    notSelected: null,
  },
  three: {
    mode: "sunset",
    background: null,
  },
});

export const lightTheme = createTheme({
  background: "rgb(255, 255, 255)",
  scrollBarTrack: "rgb(40, 46, 53)",
  comment: "rgb(229 231 235)",
  textarea: "rgb(229 231 235)",
  sunmoon: "#ffe44b",
  text: {
    normal: "#000000",
    reverse: "#FFFFFF",
  },
  tag: "rgb(203, 213, 225)",
  code: "rgb(233, 236, 239)",
  blockquote: "rgb(250 250 250)",
  placeholder: "rgb(75 85 99)",
  glass: {
    normal: "rgba(229, 231, 235, 0.6)",
    reverse: "rgba(0, 0, 0, 0.4)",
  },
  debug: "rgba(31, 41, 55, 0.8)",
  toc: {
    selected: "rgb(31 41 55)",
    notSelected: "rgba(75, 85, 99, 0.8)",
  },
  three: {
    mode: "sunset",
    background: "rgb(255, 255, 255)",
  },
});

export const darkTheme = createTheme({
  background: "rgb(13, 17, 23)",
  scrollBarTrack: "rgb(40, 46, 53)",
  comment: "rgb(50, 50, 50)",
  textarea: "rgb(50, 50, 50)",
  sunmoon: "#ff594e",
  text: {
    normal: "#FFFFFF",
    reverse: "#000000",
  },
  tag: "rgb(51 65 85)",
  code: "rgb(54, 54, 54)",
  blockquote: "rgb(50, 50, 50)",
  placeholder: "rgb(75 85 99)",
  glass: {
    normal: "rgba(0, 0, 0, 0.4)",
    reverse: "rgba(255, 255, 255, 0.6)",
  },
  debug: "rgba(31, 41, 55, 0.8)",
  toc: {
    selected: "rgb(243 244 246)",
    notSelected: "rgb(156 163 175)",
  },
  three: {
    mode: "night",
    background: "rgb(13, 17, 23)",
  },
});

export const vars = { ...root, themes };
