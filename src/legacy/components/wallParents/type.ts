import { wallType } from "@store/wall/type";
import { wallParentType } from "@store/wallParent/type";

export type wallParentComponentsType = {
  walls: wallType[];
  wallParentMap: {
    [k: string]: wallParentType;
  };
  isUpdate?: boolean;
};

export interface IWallInstance {
  walls: wallType[];
  wallParent: wallParentType;
  isUpdate?: boolean;
}
