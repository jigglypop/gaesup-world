import { globalStyle, style } from "@vanilla-extract/css";
import { flex_absolute, flex_relative, glass } from "../styles";
import { vars } from "../styles/theme.css";

const PretendardFont = "'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif";

export const icon = style([
  flex_relative({ column: "center" }),
  {
    color: vars.themes.text.reverse + "",
  },
]);

export const iconInner = style([
  flex_relative({}),
  {
    background: "transparent",
    overflow: "hidden",
    cursor: "pointer",
    margin: "0.2rem",
  },
]);

export const tooltip = style([
  flex_absolute({
    column: "center",
  }),
  glass({}),
  {
    top: "0",
    left: "50%",
    transform: "translateX(-50%)",
    opacity: "0",
    textAlign: "center",
    padding: "0.5rem",
    width: "10rem",
    fontSize: "1.2rem",
    fontFamily: PretendardFont,
    fontWeight: "400",
    borderRadius: "0.5rem",
    backgroundColor: vars.themes.glass.reverse + "",
    boxShadow: `0 0 10px ${vars.themes.glass.reverse}`,
    color: vars.themes.text.reverse + "",
    zIndex: "1",
    marginTop: "5rem",
    transition: "all 0.3s ease-in",
    cursor: "pointer",
  },
]);

// 툴팁 p
globalStyle(`${tooltip} p`, {
  margin: "0.7rem",
  fontFamily: PretendardFont,
  fontWeight: "400",
});
