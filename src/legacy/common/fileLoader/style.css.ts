import { style } from "@vanilla-extract/css";

export const fileUploader = style({
  display: "flex",
  flexDirection: "column",
  gap: "10px",
});

export const upperRow = style({
  display: "flex",
  gap: "10px",
  alignItems: "center",
});

export const lowerRow = style({
  display: "flex",
  gap: "10px",
  alignItems: "center",
});

export const thumbnailContainer = style({
  width: "100px",
  height: "100px",
  overflow: "hidden",
  borderRadius: "4px",
});

export const thumbnail = style({
  width: "100%",
  height: "100%",
  objectFit: "cover",
});

export const fileInput = style({
  display: "none",
});

export const errorMessage = style({
  color: "red",
  fontSize: "14px",
});
