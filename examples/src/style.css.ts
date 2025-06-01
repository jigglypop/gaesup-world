import { fontFace, style, globalStyle } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";
import { fixed, flex, sprinkles } from "../styles";
import { vars } from "../styles/theme.css";

const PretendardFont = "'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif";

export const keyBoardToolTipOuter = style([
  flex({
    column: "6",
  }),
  {
    position: "fixed",
    bottom: "0",
    left: "50%",
    transform: "translate(-50%, 0)",
    width: "45vw",
    height: "25vh",
  },
]);

export const minimapOuter = style([flex({})]);

export const gameBoyOuter = style([
  fixed({
    south_east: true,
  }),
  flex({
    column: "7",
  }),
  sprinkles({
    display: {
      desktop: "none",
      laptop: "none",
      tablet: "flex",
      mobile: "flex",
    },
  }),
  {
    width: "100%",
  },
]);

export const joystickOuter = style([
  fixed({
    south_west: true,
  }),
  {
    margin: '1rem',
    width: '100px',
    height: '100px',
  },
]);

export const footer = style([
  {
    position: "fixed",
    bottom: "0",
    width: "100%",
    height: "50rem",
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gridTemplateRows: "repeat(2, 1fr)",
  },
]);

export const footerUpper = style([
  fixed({
    south_east: true,
  }),
  {
    display: 'flex',
    flexDirection: 'column',
    bottom: '8rem',
    right: '0',
    zIndex: '10',
  },
]);

export const footerLower = style([
  fixed({
    south_west: true,
  }),
  {
    display: 'flex',
    flexDirection: 'column',
    bottom: '0',
    left: '0',
    zIndex: '10',
  },
]);

export const blackHanSans = style({
  fontFamily: PretendardFont,
});

export const main = style([
  {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    background: vars.gradient.lightGreen,
    fontFamily: PretendardFont,
  },
]);

export const mainButtonContainer = style([
  {
    position: "fixed",
    zIndex: 100,
    top: "1rem",
    left: "1rem",
    display: "grid",
    flexDirection: "row",
    gridTemplateColumns: "repeat(3, 1fr)",
    gridTemplateRows: "repeat(3, 1fr)",
  },
]);

export const button = recipe({
  base: [
    {
      boxSizing: "border-box",
      width: "7.5rem",
      height: "4rem",
      borderRadius: "1rem",
      fontSize: "1rem",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      color: "white",
      boxShadow: "0 0 0.5rem rgba(0, 0, 0, 0.5)",
      cursor: "pointer",
      transition: "all 0.3s ease-in",
      margin: "0.5rem",
    },
  ],
  variants: {
    control: {
      true: {
        background: vars.gradient.lightGreen,
        boxShadow: "0 0 1rem rgba(5,222,250,1)",
        color: "black",
        ":hover": {
          boxShadow: "0 0 3rem rgba(5,222,250,1)",
        },
      },
    },
  },
});

export const gamePad = style([
  fixed({
    south_east: true,
  }),
  {
    margin: '1rem',
    width: '200px',
    height: '200px',
  },
]);

export const jump = style([
  fixed({
    west: true,
  }),
  {
    marginRight: "5rem",
    width: "12rem",
    zIndex: 10000,
  },
]);

export const demoBackGroundImage = 'https://jigglog.s3.ap-northeast-2.amazonaws.com/space.jpg';

export const helpPanel = style({
  position: 'fixed',
  top: '20px',
  right: '20px',
  width: '320px',
  maxHeight: '70vh',
  backgroundColor: 'rgba(0, 0, 0, 0.85)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '12px',
  padding: '20px',
  backdropFilter: 'blur(10px)',
  color: 'white',
  fontSize: '14px',
  fontFamily: PretendardFont,
  letterSpacing: '0.3px',
  lineHeight: '1.5',
  zIndex: 500,
  overflow: 'auto',
});

// helpPanel 내부 요소들에 직접 스타일 적용
globalStyle(`${helpPanel} h3`, {
  margin: '0 0 16px 0',
  color: '#4CAF50',
  fontSize: '18px',
  fontWeight: '600',
  borderBottom: '1px solid rgba(76, 175, 80, 0.3)',
  paddingBottom: '8px',
});

globalStyle(`${helpPanel} h4`, {
  margin: '0 0 8px 0',
  color: '#81C784',
  fontSize: '15px',
  fontWeight: '500',
});

globalStyle(`${helpPanel} ul`, {
  margin: '0 0 16px 0',
  paddingLeft: '16px',
  listStyle: 'disc',
});

globalStyle(`${helpPanel} li`, {
  marginBottom: '4px',
  lineHeight: '1.5',
  fontSize: '14px',
});

globalStyle(`${helpPanel} strong`, {
  color: '#A5D6A7',
  fontWeight: '600',
});

export const helpContent = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0px',
});

export const helpSection = style({
  marginBottom: '18px',
});
