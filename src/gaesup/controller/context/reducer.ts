import { gaesupControllerType } from "./type";

export function gaesupControllerReducer(
  props: gaesupControllerType,
  action: {
    type: string;
    payload?: gaesupControllerType;
  }
) {
  switch (action.type) {
    case "init": {
      return { ...props };
    }
    case "update": {
      return { ...props, ...action.payload };
    }
  }
}
