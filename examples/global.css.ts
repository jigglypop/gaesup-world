import { globalStyle, globalFontFace } from "@vanilla-extract/css";
import { vars } from "./styles/theme.css";

// 프리텐다드 폰트 웹폰트 정의
globalFontFace('Pretendard', {
  src: 'url("https://fastly.jsdelivr.net/gh/Project-Noonnu/noonfonts_2107@1.1/Pretendard-Regular.woff") format("woff")',
  fontWeight: '400',
  fontStyle: 'normal',
  fontDisplay: 'swap',
});

globalFontFace('Pretendard', {
  src: 'url("https://fastly.jsdelivr.net/gh/Project-Noonnu/noonfonts_2107@1.1/Pretendard-Medium.woff") format("woff")',
  fontWeight: '500',
  fontStyle: 'normal',
  fontDisplay: 'swap',
});

globalFontFace('Pretendard', {
  src: 'url("https://fastly.jsdelivr.net/gh/Project-Noonnu/noonfonts_2107@1.1/Pretendard-SemiBold.woff") format("woff")',
  fontWeight: '600',
  fontStyle: 'normal',
  fontDisplay: 'swap',
});

globalFontFace('Pretendard', {
  src: 'url("https://fastly.jsdelivr.net/gh/Project-Noonnu/noonfonts_2107@1.1/Pretendard-Bold.woff") format("woff")',
  fontWeight: '700',
  fontStyle: 'normal',
  fontDisplay: 'swap',
});

const PretendardFont = "'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif";

globalStyle(":root", {
  background: vars.themes.background,
  color: vars.themes.text.normal,
  fontWeight: "300",
  fontFamily: PretendardFont,
});

globalStyle("html", {
  boxSizing: "border-box",
  fontSize: "62.5%",
  maxWidth: "100%",
  overflowX: "hidden",
  padding: 0,
  fontFamily: PretendardFont,
  fontWeight: "300",
});

globalStyle("body", {
  overflow: "hidden",
  position: "fixed",
  margin: 0,
  padding: 0,
  fontFamily: PretendardFont,
  fontSize: "1.4rem",
  fontWeight: "300",
});

globalStyle("*, *::before, *::after", {
  boxSizing: "border-box",
});

globalStyle("a", {
  cursor: "pointer",
  textDecoration: "none",
  color: "inherit",
});

globalStyle("input, input:focus", {
  border: "none",
  borderRight: "0px",
  borderTop: "0px",
  borderLeft: "0px",
  borderBottom: "0px",
  outline: "none",
  WebkitAppearance: "none",
  MozAppearance: "none",
  appearance: "none",
});

globalStyle("button, button:focus", {
  border: "none",
  outline: "none",
});

globalStyle("input::-ms-clear", {
  display: "none",
});

globalStyle(
  'input[type="number"]::-webkit-inner-spin-button, input[type="number"]::-webkit-outer-spin-button',
  {
    WebkitAppearance: "none",
    MozAppearance: "none",
    appearance: "none",
  }
);

globalStyle(
  'input[type="password"]::-ms-reveal, input[type="password"]::-ms-clear',
  {
    display: "none",
  }
);
// 스크롤

globalStyle("::-webkit-scrollbar", {
  width: "1.8rem",
});

globalStyle("::-webkit-scrollbar-thumb", {
  background: vars.gradient.purple,
  borderRadius: "1rem",
  border: "0.4rem solid transparent",
  backgroundClip: "padding-box",
});

globalStyle("::-webkit-scrollbar-track", {
  WebkitBackdropFilter: "blur(10px)",
  backdropFilter: "blur(10px)",
});

globalStyle(
  "input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, input:-webkit-autofill:active",
  {
    transition: "background-color 10000s",
    WebkitTextFillColor: "black !important",
  }
);
