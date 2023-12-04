import { optionsType } from "@gaesup/type";
import { atom } from "jotai";

export const optionsAtom = atom<optionsType>({
  debug: false,
  mode: null,
  controllerType: "none",
  cameraCollisionType: "transparent",
  camera: {
    type: "orthographic",
    control: "orbit",
  },
  minimap: true,
  minimapRatio: 0.5,
  perspectiveCamera: {
    isFront: true,
    XZDistance: 8,
    YDistance: 1,
  },
  kartUrl: null,
  characterUrl: null,
  airplaneUrl: null,
  orthographicCamera: {
    zoom: 1,
    near: 0.1,
    far: 1000,
  },
});

optionsAtom.debugLabel = "options";
