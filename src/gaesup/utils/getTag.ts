import * as THREE from 'three';

// split한 태그의 첫번째 문자열을 가져오는 함수.
export const getTag = (node?: THREE.Mesh) => node?.name?.split('_')?.[0];
// 태그와 이름이 일치하는지 확인
export const isEqual = (tag: string, node?: THREE.Mesh) => node?.name?.split('_')?.[0] === tag;
