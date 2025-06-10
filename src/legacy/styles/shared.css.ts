// shared.css.ts
import { style, styleVariants } from "@vanilla-extract/css";

// Flexbox 공통 스타일
export const flexCenter = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

// 공통적인 버튼 스타일
export const buttonBase = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  cursor: "pointer",
  transition: "all 0.3s ease-in",
  boxShadow: "0 0 0.5rem rgba(0, 0, 0, 0.5)",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  color: "white",
});

// 공통적인 반응형 크기
export const sizeVariants = styleVariants({
  large: {
    width: "5rem",
    height: "5rem",
  },
  medium: {
    width: "3rem",
    height: "3rem",
  },
  small: {
    width: "2rem",
    height: "2rem",
  },
});

// 공통적인 전환 효과
export const transitionEffect = style({
  transition: "all 0.3s ease-in",
});

// 공통적인 사용자 선택 방지 스타일
export const noUserSelect = style({
  WebkitTouchCallout: "none",
  WebkitUserSelect: "none",
  MozUserSelect: "none",
  msUserSelect: "none",
  userSelect: "none",
});
