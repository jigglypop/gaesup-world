"use client";

import { loadingAtom } from "@store/loading/atom";
import { useAtom } from "jotai";
import * as S from "./styles.css";

export default function Loading() {
  const [loading] = useAtom(loadingAtom);
  return (
    <>
      {loading.isLoading && (
        <div className={S.spinner}>
          <div className={S.spinnerInner}>
            <div className={S.svgWrapper}>
              <svg
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg">
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                />
              </svg>
            </div>
            <p className={S.text}>잠시만 기다려주세요</p>
          </div>
        </div>
      )}
    </>
  );
}
