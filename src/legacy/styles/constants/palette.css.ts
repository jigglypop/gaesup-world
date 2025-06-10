import { vars } from "../theme.css";

export const palette = {
  inherit: "inherit",
  current: "currentColor",
  transparent: "transparent",
  black: "rgb(0 0 0)",
  white: "rgb(255 255 255)",
  gray200: "rgb(229 231 235)",
  gray400: "rgb(156 163 175)",
  gray600: "rgb(75 85 99)",
  gray800: "rgb(31 41 55)",
  gray900: "rgb(17 24 39)",
  red500: "rgb(239 68 68)",
  purple800: "rgb(107 33 168)",
};

// 투명
export const rgba = {
  "black0.1": "rgba(0, 0, 0, 0.1)",
  "black0.2": "rgba(0, 0, 0, 0.2)",
  "black0.3": "rgba(0, 0, 0, 0.3)",
  "black0.4": "rgba(0, 0, 0, 0.4)",
  "black0.5": "rgba(0, 0, 0, 0.5)",
  "black0.6": "rgba(0, 0, 0, 0.6)",
  "black0.7": "rgba(0, 0, 0, 0.7)",
  "black0.8": "rgba(0, 0, 0, 0.8)",
  "black0.9": "rgba(0, 0, 0, 0.9)",
  "white0.1": "rgba(255, 255, 255, 0.1)",
  "white0.2": "rgba(255, 255, 255, 0.2)",
  "white0.3": "rgba(255, 255, 255, 0.3)",
  "white0.4": "rgba(255, 255, 255, 0.4)",
  "white0.5": "rgba(255, 255, 255, 0.5)",
  "white0.6": "rgba(255, 255, 255, 0.6)",
  "white0.7": "rgba(255, 255, 255, 0.7)",
  "white0.8": "rgba(255, 255, 255, 0.8)",
  "white0.9": "rgba(255, 255, 255, 0.9)",
};

export const gradient = {
  purple: "linear-gradient(45deg,#8e2de2, #4a00e0)",
  bluePurple:
    "radial-gradient( circle farthest-corner at 11.7% 80.6%,  rgba(249,185,255,1) 0%, rgba(177,172,255,1) 49.3%, rgba(98,203,255,1) 89% );",
  green:
    "linear-gradient( 68.4deg,  rgba(99,251,215,1) -0.4%, rgba(5,222,250,1) 100.2% );",
  red: "linear-gradient( 68.3deg,  rgba(245,177,97,1) 0.4%, rgba(236,54,110,1) 100.2% );",
  pink: "radial-gradient( circle farthest-corner at 10.2% 55.8%,  rgba(252,37,103,1) 0%, rgba(250,38,151,1) 46.2%, rgba(186,8,181,1) 90.1% );",
};

export const theme = {
  bg: vars.themes.background,
  tr: vars.themes.text.reverse,
  t: vars.themes.text.normal,
  g: vars.themes.glass.normal,
  gr: vars.themes.glass.reverse,
  ta: vars.themes.textarea,
  sb: vars.themes.scrollBarTrack,
  sm: vars.themes.sunmoon,
  c: vars.themes.code,
  tag: vars.themes.tag,
};

export const themeShadow = {
  bg: `0 0 10px ${vars.themes.background}`,
  tr: `0 0 10px ${vars.themes.text.reverse}`,
  t: `0 0 10px ${vars.themes.text.normal}`,
  g: `0 0 10px ${vars.themes.glass.normal}`,
  gr: `0 0 10px ${vars.themes.glass.reverse}`,
  ta: `0 0 10px ${vars.themes.textarea}`,
  sb: `0 0 10px ${vars.themes.scrollBarTrack}`,
  sm: `0 0 10px ${vars.themes.sunmoon}`,
  c: `0 0 10px ${vars.themes.code}`,
  tag: `0 0 10px ${vars.themes.tag}`,
};

export const themeShadowHover = {
  bg_hover: `0 0 20px ${vars.themes.background}`,
  tr_hover: `0 0 20px ${vars.themes.text.reverse}`,
  t_hover: `0 0 20px ${vars.themes.text.normal}`,
  g_hover: `0 0 20px ${vars.themes.glass.normal}`,
  gr_hover: `0 0 20px ${vars.themes.glass.reverse}`,
  ta_hover: `0 0 20px ${vars.themes.textarea}`,
  sb_hover: `0 0 20px ${vars.themes.scrollBarTrack}`,
  sm_hover: `0 0 20px ${vars.themes.sunmoon}`,
  c_hover: `0 0 20px ${vars.themes.code}`,
  tag_hover: `0 0 20px ${vars.themes.tag}`,
};
