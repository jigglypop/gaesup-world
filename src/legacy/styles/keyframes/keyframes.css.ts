import { keyframes } from "@vanilla-extract/css";

export const rotate = keyframes({
  from: {
    transform: "rotate(0turn)",
  },
  to: {
    transform: "rotate(-1turn)",
  },
});

export const outline = keyframes({
  "0%": {
    strokeDashoffset: "0",
  },
  "50%": {
    strokeDashoffset: "300",
  },
  "100%": {
    strokeDashoffset: "600",
  },
});

export const pulse = keyframes({
  "0%": {
    boxShadow: "0 0 0 0 rgba(255, 255, 255, 0.7)",
    transform: "scale(0.9)",
  },
  "70%": {
    boxShadow: "0 0 0 1.5rem rgba(255, 255, 255, 0)",
    transform: "scale(1.2)",
  },
  "100%": {
    boxShadow: "0 0 0 0 rgba(255, 255, 255, 0)",
    transform: "scale(0.9)",
  },
});

export const pulseOpacity = keyframes({
  "0%": {
    color: "rgba(255, 255, 255, 0.2)",
  },
  "70%": {
    color: "rgba(255, 255, 255, 0.8)",
  },
  "100%": {
    color: "rgba(255, 255, 255, 0.2)",
  },
});

export const pulseWhite = keyframes({
  "0%": {
    boxShadow: "0 0 0 0 rgba(255, 255, 255, 0.7)",
    transform: "scale(0.9)",
  },
  "70%": {
    boxShadow: "0 0 0 1rem rgba(255, 255, 255, 0)",
    transform: "scale(1)",
  },
  "100%": {
    boxShadow: "0 0 0 0 rgba(255, 255, 255, 0)",
    transform: "scale(0.9)",
  },
});
