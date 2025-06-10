import { atom } from "jotai";

export const modalAtom = atom({
  on: false,
  type: "",
  file: -1,
  username: "",
  gltf_url: "",
});
