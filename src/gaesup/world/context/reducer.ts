import { gaesupWorldContextType } from "./type";

export function gaesupWorldReducer(
  props: gaesupWorldContextType,
  action: {
    type: string;
    payload?: Partial<gaesupWorldContextType>;
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
