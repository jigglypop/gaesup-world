import { globalStyle, style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";
import { fixed, flex } from "../styles/recipe/index.css";

const PretendardFont = "'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif";

export const infoStyle = style({
  position: 'fixed',
  top: 0,
  left: 0,
  display: 'flex',
  gap: '10px',
  padding: '20px',
  zIndex: 1000,
});

export const infoInnerStyle = style([
  flex({ row: "9" }),
  {
    width: "100%",
    color: "white",
  },
]);

export const text = style([
  flex({ column: "center" }),
  {
    margin: "0 1rem",
    padding: 0,
    fontSize: "1.6rem",
    color: "black",
    fontFamily: PretendardFont,
    fontWeight: "500",
    letterSpacing: "0.3px",
  },
]);

globalStyle(`${text} p`, {
  fontWeight: "500",
  fontFamily: PretendardFont,
  margin: 0,
  padding: 0,
});

export const small = style([
  {
    margin: "0.5rem",
    fontSize: "1.1rem",
    color: "black",
    fontFamily: PretendardFont,
    letterSpacing: "0.2px",
  },
]);

export const infoInner = style([
  flex({ row: "9" }),
  {
    width: "100%",
    color: "white",
  },
]);

export const cameraLeft = style([
  {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "flex-start",
    textAlign: "center",
    width: "100%",
  },
]);

export const pRecipe = recipe({
  base: {
    padding: '8px 12px',
    margin: '4px 0',
    cursor: 'pointer',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: PretendardFont,
    letterSpacing: '0.2px',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
  },
  variants: {
    selected: {
      true: {
        backgroundColor: 'rgba(100, 200, 255, 0.3)',
        color: '#ffffff',
      },
      false: {
        color: 'rgba(255, 255, 255, 0.8)',
      },
    },
  },
});

export const glassButton = style({
  padding: '8px 16px',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '8px',
  color: 'white',
  cursor: 'pointer',
  backdropFilter: 'blur(10px)',
  fontSize: '14px',
  fontFamily: PretendardFont,
  fontWeight: '500',
  letterSpacing: '0.2px',
  transition: 'all 0.3s ease',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
  ':hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
  },
});

export const cameraDescription = style({
  position: 'fixed',
  top: '80px',
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  color: 'white',
  padding: '12px 24px',
  borderRadius: '20px',
  fontSize: '14px',
  fontFamily: PretendardFont,
  fontWeight: '300',
  letterSpacing: '0.5px',
  lineHeight: '1.5',
  zIndex: 999,
  textAlign: 'center',
  maxWidth: '450px',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
});

export const cameraSettings = style({
  position: 'fixed',
  top: '80px',
  left: '20px',
  width: '600px',
  maxHeight: '80vh',
  backgroundColor: 'rgba(0, 0, 0, 0.9)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '12px',
  padding: '20px',
  backdropFilter: 'blur(15px)',
  color: 'white',
  fontFamily: PretendardFont,
  fontSize: '14px',
  letterSpacing: '0.3px',
  lineHeight: '1.4',
  zIndex: 999,
  overflow: 'auto',
});

export const settingsHeader = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px',
  paddingBottom: '10px',
  borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
  fontFamily: PretendardFont,
  letterSpacing: '0.3px',
});

export const resetButton = style({
  padding: '6px 12px',
  backgroundColor: 'rgba(255, 100, 100, 0.2)',
  border: '1px solid rgba(255, 100, 100, 0.4)',
  borderRadius: '6px',
  color: 'white',
  cursor: 'pointer',
  fontSize: '12px',
  fontFamily: PretendardFont,
  letterSpacing: '0.1px',
  transition: 'all 0.2s ease',
  ':hover': {
    backgroundColor: 'rgba(255, 100, 100, 0.4)',
  },
});

export const settingsGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '20px',
  '@media': {
    '(max-width: 768px)': {
      gridTemplateColumns: '1fr',
    },
  },
});

export const settingGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  padding: '15px',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '8px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  fontFamily: PretendardFont,
});

export const inputRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontSize: '14px',
  letterSpacing: '0.2px',
});

export const checkboxRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '14px',
  letterSpacing: '0.2px',
});

export const slider = style({
  flex: 1,
  height: '4px',
  borderRadius: '2px',
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  outline: 'none',
  opacity: 0.7,
  transition: 'opacity 0.2s',
  ':hover': {
    opacity: 1,
  },
  '::-webkit-slider-thumb': {
    appearance: 'none',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    backgroundColor: '#4CAF50',
    cursor: 'pointer',
  },
  '::-moz-range-thumb': {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    backgroundColor: '#4CAF50',
    cursor: 'pointer',
    border: 'none',
  },
});

export const quickPresets = style({
  marginTop: '20px',
  padding: '15px',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '8px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  fontFamily: PretendardFont,
});

export const presetButtons = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  marginTop: '10px',
});

export const presetButton = style({
  padding: '6px 12px',
  backgroundColor: 'rgba(100, 200, 255, 0.2)',
  border: '1px solid rgba(100, 200, 255, 0.4)',
  borderRadius: '6px',
  color: 'white',
  cursor: 'pointer',
  fontSize: '12px',
  fontFamily: PretendardFont,
  letterSpacing: '0.1px',
  transition: 'all 0.2s ease',
  ':hover': {
    backgroundColor: 'rgba(100, 200, 255, 0.4)',
    transform: 'translateY(-1px)',
  },
});
