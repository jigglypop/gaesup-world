import { objectTypeString } from "@store/update/type";

export type npcListType = {
  gltf: string;
  object_name?: string;
  count?: [number, number, number];
  color?: string;
  object_type?: objectTypeString;
  colliders?: "hull" | "cuboid" | "trimesh";
};

export type clothType = {
  clothes_url: string;
  clothes_name: string;
  clothes_color?: string;
};

export type hatType = {
  hat_url: string;
  hat_name: string;
  hat_color?: string;
};

export type glassType = {
  glass_url: string;
  glass_name: string;
  glass_color?: string;
};
//
// export const NPC_LIST: npcListType[] = [
//   {
//     gltf: "ally_body.glb",
//     object_name: "올춘삼",
//     count: [1, 1, 1],
//   },
//   {
//     gltf: "oneyee.glb",
//     object_name: "원덕배",
//     count: [1, 1, 1],
//   },
// ];
// export const CLOTH_LIST: clothType[] = [
//   {
//     clothes_url: "ally_cloth_rabbit.glb",
//     clothes_name: "토끼옷",
//   },
//   {
//     clothes_url: "ally_cloth.glb",
//     clothes_name: "양복",
//   },
//   {
//     clothes_url: "formal.glb",
//     clothes_name: "양복 2",
//   },
// ];
// export const HAT_LIST: hatType[] = [
//   {
//     hat_url: "hat_a.glb",
//     hat_name: "모자 a",
//   },
//   {
//     hat_url: "hat_b.glb",
//     hat_name: "모자 b",
//   },
//   {
//     hat_url: "hat_c.glb",
//     hat_name: "모자 c",
//   },
// ];
//
// export const GLASS_LIST: glassType[] = [
//   {
//     glass_url: "glass_a.glb",
//     glass_name: "안경 a",
//   },
//   {
//     glass_url: "super_glass.glb",
//     glass_name: "안경 b",
//   },
// ];
//
// export type messageTagType = {
//   tag: string;
//   name: string;
// };
//
// export const messageTagName = {
//   daon: "다온",
//   chehum: "신기술",
//   haeyum: "해윰",
//   kkam: "깜냥",
//   lobby: "로비",
//   meet: "미팅",
//   open: "오픈 라운지",
// };
//
// export type animationType = {
//   tag: string;
//   name: string;
// };
//
// export const animationTagName: animationType[] = [
//   {
//     tag: "idle",
//     name: "두리번",
//   },
//   {
//     tag: "walk",
//     name: "걷기",
//   },
//   {
//     tag: "run",
//     name: "뛰기",
//   },
//   {
//     tag: "jump",
//     name: "점프",
//   },
//   {
//     tag: "greet",
//     name: "인사",
//   },
// ];
//
// export const animationMap = {
//   인사: "greet",
//   걷기: "walk",
//   뛰기: "run",
//   점프: "jump",
//   두리번: "idle",
// };
