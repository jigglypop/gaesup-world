import { useAtomValue } from "jotai";
import { currentAtom } from "../../stores/current";
import { jumpPointAtom } from "../../stores/gaesupProps";
import * as style from "./style.css";

export default function JumpPoint() {
  const { refs } = useAtomValue(currentAtom);
  const jumpPoint = useAtomValue(jumpPointAtom);
  const { rigidBodyRef } = refs;

  return (
    <div className={style.jumpPoints}>
      {jumpPoint.map((obj, key) => {
        return (
          <div
            key={key}
            className={style.jumpPoint}
            onClick={() => {
              rigidBodyRef?.current?.setTranslation(obj.position, true);
            }}
          >
            {obj.text}
          </div>
        );
      })}
    </div>
  );
}
