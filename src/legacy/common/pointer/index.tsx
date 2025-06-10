import { FaMapMarkerAlt } from "@react-icons/all-files/fa/FaMapMarkerAlt";
import { euler } from "@react-three/rapier";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import { InnerHtml, V3 } from "gaesup-world";
import * as S from "./styles.css";

// 클릭 포인터 정의
export default function Pointer({ color }: { color: string }) {
  return (
    <>
      <InnerHtml position={V3(0, 1.7, 0)}>
        <FaMapMarkerAlt
          style={{ color: color, fontSize: "5rem", opacity: 0.5 }}
        />
      </InnerHtml>
      <group
        key="pointer"
        position={V3(0, 0.5, 0)}
        rotation={euler({ x: Math.PI / 2, y: 0, z: 0 })}>
        <InnerHtml>
          <div
            className={S.pointer}
            style={assignInlineVars({
              background: color,
            })}>
            <div
              className={S.border}
              style={assignInlineVars({
                boxShadow: `0 0 0 0 ${color}`,
              })}></div>
          </div>
        </InnerHtml>
      </group>
    </>
  );
}
