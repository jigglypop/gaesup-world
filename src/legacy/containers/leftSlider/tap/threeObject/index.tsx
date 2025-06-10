"use client";

import FileUploader from "@common/fileLoader";
import SmallColorPicker from "@common/smallColorPicker";
import useThreeObject from "@store/threeObject";
import useUpdateRoom from "@store/update";
import PositionScaleControl from "../levelControl";
import * as S from "./styles.css";

export default function ThreeObjectTap() {
  const { itemType, setColor, setPampletUrl, setPosterUrl } = useThreeObject();
  const { current } = useUpdateRoom();

  return (
    <div className={S.inner}>
      <div className={S.innerTitles}>
        <div className={S.innerTitleItem}>일반</div>
      </div>
      <>
        <PositionScaleControl />
        <div className={S.meshInfo}>
          <div className={S.meshGrid}>
            {itemType.color && (
              <div className={S.colorPicker}>
                <div className={S.materialTitle}>메테리얼 색</div>
                <SmallColorPicker
                  color={current?.color || "#ffffff"}
                  setColor={setColor}
                />
              </div>
            )}
          </div>

          {itemType.poster_url && (
            <>
              <div className={S.subTitle}>포스터</div>
              <FileUploader
                value={current?.poster_url || ""}
                onChange={(value) => setPosterUrl(value)}
                label="poster_url"
              />
            </>
          )}
          {itemType.pamplet_url && (
            <>
              <div className={S.subTitle}>팜플렛</div>
              <FileUploader
                value={current?.pamplet_url || ""}
                onChange={(value) => setPampletUrl(value)}
                label="pamplet_url"
              />
            </>
          )}
        </div>
      </>
    </div>
  );
}
