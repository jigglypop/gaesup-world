import NameTag from "@common/spriteTag";
import useModal from "@store/modal";
import useNpc from "@store/npc";
import { npcType } from "@store/npc/type";
import { convertElr, convertV3 } from "@utils/convertor";
import { Elr, PassiveCharacter } from "gaesup-world";
import { partsType } from "gaesup-world/dist/types/gaesup/controller/type";
import { memo, useCallback, useEffect, useState } from "react";

const useTypingEffect = (text: string, speed = 100, duration = 1000) => {
  const [displayedText, setDisplayedText] = useState("");

  const typeText = useCallback(() => {
    let index = 0;
    setDisplayedText("");
    const typingInterval = setInterval(() => {
      if (index < text.length && text[index] !== undefined) {
        setDisplayedText((prev) => prev + text[index]);
        index++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => {
          setDisplayedText("");
          setTimeout(typeText, 1000);
        }, duration);
      }
    }, speed);

    return () => clearInterval(typingInterval);
  }, [text, speed, duration]);

  useEffect(() => {
    if (!text) return;
    const cleanup = typeText();
    return () => {
      cleanup();
      setDisplayedText("");
    };
  }, [text, typeText]);

  return displayedText;
};

function NpcObject({
  threeObjects,
  username,
  npc_id,
  current_animation,
  isUpdate,
  info,
  link_url,
}: npcType) {
  const { onNpcDelete } = useNpc();
  const _info = useTypingEffect(info || "");

  const parts: partsType = threeObjects
    .slice(1)
    .map((obj) => {
      if (!obj.gltf_url) return null;
      return {
        url: obj.gltf_url,
      };
    })
    .filter((part) => part !== null);

  const { openModal } = useModal();

  return (
    <group
      position={convertV3(threeObjects[0].position || [0.0, 0.0, 0.0])}
      rotation={convertElr(threeObjects[0].rotation || Elr(0, 0, 0))}>
      {info && isUpdate && (
        <group
          position={[2, 4, 2]}
          onClick={() => {
            if (npc_id) onNpcDelete(npc_id);
          }}>
          <NameTag
            text={info + "(삭제)"}
            fontSize={1}
            textLength={info.length + 4}
            background="rgb(250, 250, 250, 0.4)"
            color="rgba(0, 0, 0, 0.8)"></NameTag>
        </group>
      )}
      {info && !isUpdate && (
        <group
          position={[2, 4, 2]}
          onClick={() => {
            if (link_url) {
              openModal({ file: parseInt(link_url), type: "info" });
            }
          }}>
          <NameTag
            text={_info}
            fontSize={1}
            textLength={info.length}
            background="rgb(250, 250, 250, 0.4)"
            color="rgba(0, 0, 0, 0.8)"></NameTag>
        </group>
      )}
      <group
        position={[2, 2, 2]}
        onClick={() => {
          if (isUpdate && npc_id) onNpcDelete(npc_id);
        }}>
        <NameTag
          text={username || "익명"}
          fontSize={0.8}
          background="rgba(0, 0, 0, 0.4)"
          color="#fefefe"></NameTag>
      </group>
      {threeObjects[0].gltf_url && (
        <PassiveCharacter
          rigidbodyType={"fixed"}
          currentAnimation={current_animation || "idle"}
          url={threeObjects[0].gltf_url}
          parts={parts}></PassiveCharacter>
      )}
    </group>
  );
}

export default memo(NpcObject);
