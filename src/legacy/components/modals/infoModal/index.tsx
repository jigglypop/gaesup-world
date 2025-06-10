"use client";

import useModal from "@store/modal";
import { Suspense } from "react";

import { MdCancel } from "@react-icons/all-files/md/MdCancel";
import useInfo from "@store/info";
import LazyLoad from "react-lazyload";
import * as S from "./styles.css";

export default function InfoModal() {
  const { fileName } = useModal();
  const { infos } = useInfo();
  const { closeModal } = useModal();

  return (
    <Suspense fallback={null}>
      <div className={S.modalOuter}>
        {infos && infos[fileName] && (
          <div className={S.modalInner}>
            <div
              className={S.cancelStyle}
              onMouseUp={closeModal}>
              <MdCancel />
            </div>
            <h1>{infos[fileName].title}</h1>
            <h3>{infos[fileName].subtitle}</h3>
            <LazyLoad height={100}>
              <img
                className={S.modalImg}
                src={infos[fileName].image_url}
                alt="image"
              />
            </LazyLoad>
            {infos[fileName].content.split("$").map((line: any, index: any) => {
              return <p key={index}>{line}</p>;
            })}
          </div>
        )}
      </div>
    </Suspense>
  );
}
