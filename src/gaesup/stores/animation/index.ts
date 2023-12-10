import { animationTagType } from "../../controller/type";

export const animationDefault = {
  current: "idle" as keyof animationTagType,
  animationNames: {
    idle: "idle",
    walk: "walk",
    run: "run",
    accel: "accel",
    break: "break",
    ride: "ride",
    jump: "jump",
    jumpIdle: "jumpIdle",
    jumpLand: "jumpLand",
    fall: "fall",
  },
  keyControl: {},
};
