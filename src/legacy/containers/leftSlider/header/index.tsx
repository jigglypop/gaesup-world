"use client";

import useGltfList from "@store/gltfList";
import useMesh from "@store/mesh";
import * as S from "./styles.css";

export default function EditorHeader() {
  const { setCurrentId } = useMesh();
  const { changeObjectType, object_type, tapList, toName } = useGltfList();
  return (
    <div className={S.editorHeader}>
      {tapList.map((item, key) => {
        return (
          <div
            key={key}
            className={S.tap[object_type === item ? "active" : "inactive"]}
            onClick={() => {
              changeObjectType(item);
              setCurrentId(null);
            }}>
            {toName[item]}
          </div>
        );
      })}
    </div>
  );
}
