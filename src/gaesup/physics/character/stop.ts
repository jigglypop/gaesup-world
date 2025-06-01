import { calcType } from "../type";

export default function stop(prop: calcType) {
  const {
    worldContext: { control, clicker, mode },
    dispatch,
  } = prop;
  const { keyS } = control;

  // 하이브리드 모드: S 키로 클리커 이동 중지 (컨트롤러 모드 무관)
  if (keyS && clicker.isOn) {
    dispatch({
      type: "update",
      payload: {
        clicker: {
          ...clicker,
          isOn: false,
          isRun: false,
        },
      },
    });
  }
}
