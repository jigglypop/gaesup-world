"use client";
import * as S from "./styles.css";

export default function Spinner() {
  return (
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
      </div>
    </div>
  );
}
