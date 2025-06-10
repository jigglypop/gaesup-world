import { useProgress } from "@react-three/drei";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import * as S from "./styles.css";

export default function Progress3D() {
  const { progress } = useProgress();
  return (
    <div className={S.progressOuter}>
      <div className={S.loader}>
        <h1 className={S.title}>아그작</h1>
        <h1 className={S.subtitle}>아이디어 그라운드 안의 작은 세상</h1>

        <div className={S.progressDiv}>
          <p>잠시만 기다려주세요</p>
          <p>3D 페이지 렌더링</p>
          <p>{progress.toFixed(2)} %</p>

          <div className={S.progressBar}>
            <div
              className={S.progressGray}
              style={assignInlineVars({
                transform: `translate(${-200 + progress * 2}px, -100%)`,
              })}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
