import { gaesupWorldPartialPropType, gaesupWorldPropType } from "./type";

export function gaesupWorldReducer(
  props: gaesupWorldPropType,
  action: {
    type: string;
    payload?: gaesupWorldPartialPropType;
  }
) {
  switch (action.type) {
    case "init": {
      return { ...props };
    }
    case "update": {
      return { ...props, ...action.payload };
    }
    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
}
