import { calcType } from "../type";

export default function landing(prop: calcType) {
  const {
    worldContext: { states, rideable, mode },
    dispatch,
  } = prop;
  const { isLanding } = states;
  if (isLanding) {
    rideable.objectType = null;
    rideable.key = null;
    mode.type = "character";
    states.isLanding = false;
    states.enableRiding = false;
  }

  dispatch({
    type: "update",
    payload: {
      mode: {
        ...mode,
      },
      rideable: {
        ...rideable,
      },
    },
  });
}
