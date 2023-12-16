import { gaesupControllerType } from "./type";

export function gaesupControllerReducer(
  props: gaesupControllerType,
  action: {
    type: string;
    payload?: Partial<gaesupControllerType>;
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
