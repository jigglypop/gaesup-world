import { n3 } from "@store/update/type";

export type portalType = {
  id: string;
  title: string;
  position: n3;
};

export type portalAtomType = {
  type: "update" | "delete" | "create";
  current: portalType | null;
  update: { [key: string]: portalType };
  create: { [key: string]: portalType };
  delete: { [key: string]: portalType };
};
