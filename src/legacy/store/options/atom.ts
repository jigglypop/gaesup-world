"use client";

import { atom } from "jotai";
import { blockOptionAtomType, clickerOptionAtomType } from "./type";

export const clickerOptionAtom = atom<clickerOptionAtomType>({
  autoStart: false,
  track: false,
  queue: [],
  loop: false,
});
clickerOptionAtom.debugLabel = "clicker";
export const blockOptionAtom = atom<blockOptionAtomType>({
  camera: false,
  control: false,
  animation: false,
  scroll: false,
});
blockOptionAtom.debugLabel = "block";
