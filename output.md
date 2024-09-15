# 코드 추출 결과

## CSS TypeScript Files (.css.ts)

### gaesup/tools/gamepad/style.css.ts

```typescript
// style.css.ts
import { globalStyle, style } from "@vanilla-extract/css";

export const gamePad = style({
  display: "grid",
  alignItems: "center",
  justifyContent: "center",
  gridTemplateColumns: "repeat(3, 1fr)",
  gridTemplateRows: "repeat(3, 1fr)",
});

export const padButton = style({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  position: "relative",
  width: "5rem",
  height: "5rem",
  borderRadius: "50%",
  fontSize: "1rem",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  color: "white",
  boxShadow: "0 0 0.5rem rgba(0, 0, 0, 0.5)",
  cursor: "pointer",
  transition: "all 0.3s ease-in",
  margin: "0.5rem",
  selectors: {
    "&:hover": {
      boxShadow: "0 0 1rem rgba(0, 0, 0, 0.5)",
    },
    "&::after": {
      content: '""',
      position: "absolute",
      width: "4rem",
      height: "4rem",
      borderRadius: "50%",
      background: "rgba(0, 0, 0, 0.2)",
      zIndex: 100000,
    },
  },
});

export const isClicked = style({
  background:
    "radial-gradient(circle at center, rgba(245, 177, 97, 1) 0.4%, rgba(236, 54, 110, 1) 100.2%)",
  boxShadow: "0 0 1rem rgba(245, 177, 97, 1)",
  color: "black",
  transition: "all 0.3s ease-in",
  selectors: {
    "&:hover": {
      boxShadow: "0 0 2rem rgba(245, 177, 97, 1)",
    },
  },
});

// 사용자 선택 방지 글로벌 스타일
globalStyle(`${gamePad} *`, {
  WebkitTouchCallout: "none",
  WebkitUserSelect: "none",
  MozUserSelect: "none",
  msUserSelect: "none",
  userSelect: "none",
});

```

### gaesup/tools/teleport/style.css.ts

```typescript
import { style } from "@vanilla-extract/css";

export const teleport = style({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  margin: "1rem",
  fontSize: "0.8rem",
  borderRadius: "50%",
  width: "5rem",
  height: "5rem",
  color: "white",
  background: "rgba(0, 0, 0, 0.6)",
  boxShadow: "0 0 5px 0 rgba(0, 0, 0, 0.6)",
  transition: "all 0.2s ease-in",
  cursor: "pointer",
});

```

### gaesup/tools/minimap/style.css.ts

```typescript
// style.css.ts
import { globalFontFace, keyframes, style } from "@vanilla-extract/css";

// @font-face 정의
globalFontFace("Open Sans", {
  src: 'url("https://fonts.googleapis.com/css2?family=Open+Sans:wght@300&display=swap")',
  fontWeight: "300",
  fontStyle: "normal",
});

// 키프레임 정의
const pulseWhite = keyframes({
  "0%": {
    boxShadow: "0 0 0 0 rgba(255, 255, 255, 0.7)",
    opacity: 1,
  },
  "70%": {
    boxShadow: "0 0 0 10px rgba(255, 255, 255, 0)",
    opacity: 0.7,
  },
  "100%": {
    boxShadow: "0 0 0 0 rgba(255, 255, 255, 0)",
    opacity: 1,
  },
});

// 스타일 정의
export const minimap = style({
  margin: "1rem",
  borderRadius: "50%",
  background: "rgba(0, 0, 0, 0.6)",
  boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
  backdropFilter: "blur(1rem)",
  WebkitBackdropFilter: "blur(1rem)",
  width: "18rem",
  height: "18rem",
  border: "4px solid rgba(0, 0, 0, 0.5)",
  overflow: "hidden",
  "@media": {
    "screen and (max-width: 1024px)": {
      width: "17rem",
      height: "17rem",
    },
    "screen and (max-width: 768px)": {
      width: "16rem",
      height: "16rem",
    },
  },
});

export const minimapOuter = style({
  position: "absolute",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  width: "18rem",
  height: "18rem",
  overflow: "hidden",
});

export const minimapInner = style({
  position: "relative",
  display: "flex",
  top: "50%",
  left: "50%",
  width: "18rem",
  height: "18rem",
  transformOrigin: "50% 50%",
  borderRadius: "50%",
  overflow: "hidden",
  "@media": {
    "screen and (max-width: 1024px)": {
      width: "17rem",
      height: "17rem",
    },
    "screen and (max-width: 768px)": {
      width: "16rem",
      height: "16rem",
    },
  },
});

export const avatar = style({
  position: "absolute",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "2rem",
  height: "2rem",
  borderRadius: "50%",
  background: "rgba(5, 222, 250, 1)",
  boxShadow: "0 0 10px rgba(5, 222, 250, 1)",
  border: "2px solid transparent",
  objectFit: "cover",
  zIndex: 100,
  animation: `${pulseWhite} 2s infinite`,
});

export const plusMinus = style({
  position: "relative",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "2rem",
  height: "2rem",
  borderRadius: "50%",
  background: "rgba(0, 0, 0, 0.5)",
  boxShadow: "0 0 5px rgba(0, 0, 0, 0.5)",
  transition: "all 0.5s ease-in",
  cursor: "pointer",
  border: "2px solid transparent",
  ":hover": {
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
  },
});

export const scale = style({
  position: "absolute",
  width: "13rem",
  bottom: "-5rem",
  left: "50%",
  transform: "translateX(-50%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  textAlign: "center",
  fontSize: "1.2rem",
  color: "white",
  textShadow: "0 0 10px black",
  padding: "0.5rem",
  borderRadius: "0.5rem",
  boxShadow: "0 0 10px black",
  background: "rgba(0, 0, 0, 0.5)",
  zIndex: 3,
  WebkitBackdropFilter: "blur(2rem)",
  backdropFilter: "blur(2rem)",
  fontFamily: '"Open Sans", sans-serif',
  fontWeight: 300,
});

export const text = style({
  position: "relative",
  fontSize: "1rem",
  color: "black",
  padding: "0.5rem",
  borderRadius: "0.5rem",
  background: "rgba(255, 255, 255, 0.5)",
  boxShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
  zIndex: 3,
});

export const minimapObject = style({
  position: "absolute",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  borderRadius: "2px",
  background: "rgba(0, 0, 0, 0.3)",
});

export const imageObject = style({
  position: "absolute",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  background: `
    linear-gradient(to bottom, transparent 95%, rgba(0, 0, 0, 0.2) 20%) 0 0 / 100% 40px repeat-y,
    linear-gradient(to right, transparent 38px, rgba(0, 0, 0, 0.2) 38px) 0 0 / 40px 100% repeat-x transparent
  `,
});

export const textObject = style({
  position: "absolute",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
});

const directionBase = style({
  position: "absolute",
  color: "white",
  fontSize: "1.5rem",
  zIndex: 2000,
});

export const east = style([
  directionBase,
  {
    top: "50%",
    right: 0,
  },
]);

export const west = style([
  directionBase,
  {
    top: "50%",
    left: 0,
  },
]);

export const south = style([
  directionBase,
  {
    top: 0,
    left: "50%",
  },
]);

export const north = style([
  directionBase,
  {
    bottom: 0,
    left: "50%",
  },
]);

```

