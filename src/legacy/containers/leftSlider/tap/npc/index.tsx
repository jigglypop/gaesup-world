"use client";

import { ANIMATION_MAP } from "@constants/main";
import useGltfList from "@store/gltfList";
import useNpc from "@store/npc";
import { inputRecipe } from "@styles/recipe/input.css";
import { textAreaRecipe } from "@styles/recipe/textArea.css";
import { ChangeEvent, useCallback } from "react";
import PositionScaleControl from "../levelControl";
import { MeshTag } from "../mesh";
import * as S from "./styles.css";

export default function NpcTap() {
  const {
    npc,
    setNpcUsername,
    setNullNpc,
    setNpcObject,
    setNpcInfo,
    setNpcAnimation,
    setNpcLinkUrl,
  } = useNpc();
  const { npcList } = useGltfList();

  const onChangeUsername = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setNpcUsername(e.target.value);
    },
    [setNpcUsername]
  );

  const onChangeLinkUrl = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setNpcLinkUrl(e.target.value);
    },
    [setNpcLinkUrl]
  );

  const onChangeInfo = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      setNpcInfo(e.target.value);
    },
    [setNpcInfo]
  );

  return (
    <div className={S.inner}>
      <div className={S.innerTitles}>
        <div className={S.innerTitleItem}>NPC</div>
      </div>
      <>
        <PositionScaleControl />
        <div className={S.subTitle}>NPC 이름</div>
        <input
          value={npc && npc.username ? npc.username : ""}
          onChange={onChangeUsername}
          className={inputRecipe({
            white: true,
          })}></input>
        <div className={S.subTitle}>링크</div>
        <input
          value={npc && npc.link_url ? npc.link_url : ""}
          onChange={onChangeLinkUrl}
          className={inputRecipe({
            white: true,
          })}></input>
        <div className={S.subTitle}>NPC 설명</div>
        <textarea
          value={npc && npc.info ? npc.info : ""}
          onChange={onChangeInfo}
          rows={3}
          className={textAreaRecipe({
            white: true,
          })}></textarea>
        <div className={S.subTitle}>애니메이션</div>
        <div className={S.tags}>
          {Object.keys(ANIMATION_MAP).map((item, key) => (
            <MeshTag
              key={key}
              conditions={item === npc?.current_animation}
              onClick={() =>
                setNpcAnimation(item as keyof typeof ANIMATION_MAP)
              }>
              {ANIMATION_MAP[item as keyof typeof ANIMATION_MAP]}
            </MeshTag>
          ))}
        </div>
        {npcList && (
          <div className={S.itemGrid}>
            <div className={S.npcList}>
              <div className={S.npcTag}>캐릭터</div>
              <div className={S.tags}>
                {npcList["캐릭터"] &&
                  npcList["캐릭터"].map((item, key) => (
                    <MeshTag
                      key={key}
                      conditions={item.gltf_url === npc?.body.gltf_url}
                      onClick={() => setNpcObject(item, "body")}>
                      {item.object_name}
                    </MeshTag>
                  ))}
              </div>
            </div>
            <div className={S.npcList}>
              <div className={S.npcTag}>옷</div>
              <div className={S.tags}>
                {npcList["옷"] &&
                  npcList["옷"].map((item, key) => (
                    <MeshTag
                      key={key}
                      conditions={item.gltf_url === npc?.clothes?.gltf_url}
                      onClick={() => setNpcObject(item, "clothes")}>
                      {item.object_name}
                    </MeshTag>
                  ))}
              </div>
            </div>
            <div className={S.npcList}>
              <div className={S.npcTag}>모자</div>
              <div className={S.tags}>
                {npcList["모자"] &&
                  npcList["모자"].map((item, key) => (
                    <MeshTag
                      key={key}
                      conditions={item.gltf_url === npc?.hat?.gltf_url}
                      onClick={() => setNpcObject(item, "hat")}>
                      {item.object_name}
                    </MeshTag>
                  ))}
                <MeshTag
                  conditions={!npc?.hat}
                  onClick={() => setNullNpc("hat")}>
                  없음
                </MeshTag>
              </div>
            </div>
            <div className={S.npcList}>
              <div className={S.npcTag}>안경</div>
              <div className={S.tags}>
                {npcList["안경"] &&
                  npcList["안경"].map((item, key) => (
                    <MeshTag
                      key={key}
                      conditions={item.gltf_url === npc?.glass?.gltf_url}
                      onClick={() => setNpcObject(item, "glass")}>
                      {item.object_name}
                    </MeshTag>
                  ))}
                <MeshTag
                  conditions={!npc?.glass}
                  onClick={() => setNullNpc("glass")}>
                  없음
                </MeshTag>
              </div>
            </div>
          </div>
        )}
      </>
    </div>
  );
}
