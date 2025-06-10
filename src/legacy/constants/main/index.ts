// 메인 페이지에서 사용되는 상수들을 정의합니다.

import { Elr, V3 } from "gaesup-world";
// 메인 페이지 포지션
export const MAIN_POSITION = V3(0, 0, 0);
// 카메라 초기
export const CAMERA_POSITION = V3(25, 28, 25);
// 메인 페이지 각도
export const ROTATE = (Math.PI * 3) / 4;
export const CAPTURE_ROTATE = Elr(0, 0, 0);
export const MAIN_ROTATION = Elr(0, ROTATE, 0);
// 로비 포지션
export const LOBBY_POSITION = V3(0, 0, 0);
// 신기술 체험존 포지션
export const CHEHUM_POSITION = V3(-40, 0, -10);
// 오픈 라운지 포지션
export const OPEN_POSITION = V3(36, 0, 0);
// 큐 포인트
export const QUEUE = [
  V3(-24, 0, -21),
  V3(-22, 0, -20),
  V3(-14, 0, -11),
  V3(-11, 0, -1),
  V3(0, 0, 9),
  V3(-8, 0, 15),
  V3(0, 0, 9),
  V3(5, 0, 1),
  V3(0, 0, 9),
  V3(6, 0, 13),
  V3(13, 0, 11),
  V3(6, 0, 13),
  V3(17, 0, 25),
  V3(29, 0, 29),
  V3(26, 0, 23),
  V3(14, 0, 22),
  V3(0, 0, 9),
  V3(-4, 0, -6),
  V3(-14, 0, -11),
  V3(-24, 0, -21),
];

// 큐 xyz
export const QUEUE_POINT: [number, number, number][] = [
  [-24, 0, -21],
  [-22, 0, -20],
  [-14, 0, -11],
  [-11, 0, -1],
  [0, 0, 9],
  [-8, 0, 15],
  [0, 0, 9],
  [5, 0, 1],
  [0, 0, 9],
  [6, 0, 13],
  [13, 0, 11],
  [6, 0, 13],
  [17, 0, 25],
  [29, 0, 29],
  [26, 0, 23],
  [14, 0, 22],
  [0, 0, 9],
  [-4, 0, -6],
  [-14, 0, -11],
  [-24, 0, -21],
];

// 캐릭터맵
export const ANIMATION_MAP = {
  idle: "멈춤",
  fall: "떨어짐",
  run: "달리기",
  greet: "인사",
  walk: "걷기",
  ride: "운전",
};
