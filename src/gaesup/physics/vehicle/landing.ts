import { calcType } from "../type";

export default function landing(prop: calcType) {
  const {
    worldContext: { states },
  } = prop;
  const { isRiding } = states;
  
  if (isRiding) {
    // Physics에서는 상태만 업데이트, rideable과 mode 조작은 UI 레벨에서 처리
    states.isRiding = false;
    states.enableRiding = false;
  }
}
