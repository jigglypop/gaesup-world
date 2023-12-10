import { actionsType, animationTagType } from "../../controller/type";

export type animationPropType = {
  current: keyof animationTagType;
  animationNames: actionsType;
  keyControl: {
    [key: string]: boolean;
  };
};
