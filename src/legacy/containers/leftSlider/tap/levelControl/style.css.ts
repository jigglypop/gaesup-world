import { flex } from "@styles/recipe/index.css";
import { style } from "@vanilla-extract/css";

export const container = style({
  padding: "4px",
  borderRadius: "8px",
});

export const section = style([
  flex({
    row: "9",
  }),
]);

export const sectionTitle = style({
  fontSize: "1rem",
  marginRight: "2rem",
});

export const controlGroup = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
});

export const scaleControls = style({
  display: "flex",
  gap: "10px",
});

export const scaleControl = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "2px",
});

export const button = style({
  padding: "4px 4px",
  borderRadius: "4px",
  cursor: "pointer",
  width: "100%",
});

export const value = style({
  textAlign: "center",
  fontSize: "1.2rem",
  backdropFilter: "blur(2px)",
  WebkitBackdropFilter: "blur(2px)",
  borderRadius: "4px",
  color: "white",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  padding: "4px 8px",
});
