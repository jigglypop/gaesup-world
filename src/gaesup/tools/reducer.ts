import { gaesupToolsPropType } from "./type";

export function gaesupToolsReducer(
  props: gaesupToolsPropType,
  action: {
    type: string;
    payload?: gaesupToolsPropType;
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
