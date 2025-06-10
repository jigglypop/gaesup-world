"use client";

import * as S from "./styles.css";

export default function NotFound() {
  return (
    <div className={S.NotFound}>
      <h1>404</h1>
      <p>존재하지 않는 페이지입니다</p>
    </div>
  );
}
