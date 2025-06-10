"use client";

import FileUploader from "@common/fileLoader";
import SmallColorPicker from "@common/smallColorPicker";
import EditorFooter from "@containers/leftSlider/footer";
import useMesh from "@store/mesh";
import useMeshQuery from "@store/mesh/query";
import { meshType } from "@store/mesh/type";
import { buttonRecipe } from "@styles/recipe/button.css";
import { inputRecipe } from "@styles/recipe/input.css";
import { useQueryClient } from "@tanstack/react-query";
import * as S from "./styles.css";

export const MeshTag = ({
  key,
  conditions,
  onClick,
  children,
}: {
  key?: number;
  conditions: boolean;
  onClick: () => void;
  children?: React.ReactNode;
}) => {
  return (
    <div
      key={key}
      className={`${S.mesh} ${buttonRecipe({
        color: conditions ? "mint" : "gray",
      })}`}
      onClick={onClick}>
      {children}
    </div>
  );
};

export default function MeshBlock() {
  const { onMeshUpdateAtom, current_id } = useMesh();
  const { onMeshsUpdate } = useMeshQuery();
  const queryClient = useQueryClient();

  const meshes = queryClient.getQueryData(["meshes"]) as Record<
    string,
    meshType
  >;

  const material_to_tag = {
    STANDARD: "일반",
    GLASS: "유리",
  };

  return (
    <>
      <div className={S.outer}>
        {meshes && current_id && meshes[current_id] && (
          <>
            <div className={S.meshInfo}>
              <div className={S.meshGrid}>
                <div className={S.colorPicker}>
                  <div className={S.materialTitle}>
                    {meshes[current_id].mesh_type} 색
                  </div>
                  <SmallColorPicker
                    color={meshes[current_id].color}
                    setColor={({ color }) => {
                      onMeshUpdateAtom({ color: color });
                    }}
                  />
                  <input
                    value={meshes[current_id].color}
                    onChange={(e) =>
                      onMeshUpdateAtom({ color: e.target.value })
                    }
                    className={inputRecipe({
                      white: true,
                    })}
                  />
                </div>
                <div className={S.materialType}>
                  <div className={S.materialTitle}>
                    {meshes[current_id].mesh_type} 메테리얼 타입
                  </div>
                  <div>
                    {Object.keys(material_to_tag).map((item, key) => (
                      <div
                        key={key}
                        className={buttonRecipe({
                          color:
                            meshes[current_id]?.material === item
                              ? "mint"
                              : "black",
                        })}
                        onClick={() => onMeshUpdateAtom({ material: item })}>
                        {material_to_tag[item as keyof typeof material_to_tag]}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className={S.subTitle}>
                {meshes[current_id].mesh_type} 맵
              </div>
              <FileUploader
                value={meshes[current_id]?.map_texture_url || ""}
                onChange={(value) =>
                  onMeshUpdateAtom({ map_texture_url: value })
                }
                label="map"
              />

              <div className={S.subTitle}>
                {meshes[current_id].mesh_type} 노말맵
              </div>
              <FileUploader
                value={meshes[current_id]?.normal_texture_url || ""}
                onChange={(value) =>
                  onMeshUpdateAtom({ normal_texture_url: value })
                }
                label="normal"
              />
            </div>
          </>
        )}
        <EditorFooter onMeshUpdate={onMeshsUpdate} />
      </div>
    </>
  );
}
