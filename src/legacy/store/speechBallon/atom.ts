"use client";

import { atom } from "jotai";

export type speechBalloonAtomType = {};

export const speechBalloonAtom = atom("아그작에 온걸 환영해!");
speechBalloonAtom.debugLabel = "speechBalloon";
