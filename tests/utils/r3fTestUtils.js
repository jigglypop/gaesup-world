import { Physics } from '@react-three/rapier';
import { create } from '@react-three/test-renderer';
import * as React from 'react';
import { GaesupProvider } from '../../src/gaesup/context';

/**
 * 기본 r3f 컴포넌트 테스트 렌더러
 * @param {React.ReactNode} ui - 테스트할 컴포넌트
 * @returns {Promise<object>} - 생성된 테스트 렌더러
 */
export async function renderWithR3f(ui) {
  return create(ui);
}

/**
 * Physics를 포함한 r3f 컴포넌트 테스트 렌더러
 * @param {React.ReactNode} ui - 테스트할 컴포넌트
 * @returns {Promise<object>} - 생성된 테스트 렌더러
 */
export async function renderWithPhysics(ui) {
  return create(<Physics>{ui}</Physics>);
}

/**
 * Gaesup 전체 환경을 포함한 r3f 컴포넌트 테스트 렌더러
 * @param {React.ReactNode} ui - 테스트할 컴포넌트
 * @returns {Promise<object>} - 생성된 테스트 렌더러
 */
export async function renderWithGaesup(ui) {
  return create(
    <Physics>
      <GaesupProvider>{ui}</GaesupProvider>
    </Physics>,
  );
}

/**
 * 3D 벡터 비교 유틸리티
 * @param {THREE.Vector3} a - 첫 번째 벡터
 * @param {THREE.Vector3} b - 두 번째 벡터
 * @param {number} epsilon - 오차 허용 범위
 * @returns {boolean} - 두 벡터가 근사적으로 같은지 여부
 */
export function vectorsAreClose(a, b, epsilon = 0.001) {
  if (!a || !b) return false;
  return (
    Math.abs(a.x - b.x) < epsilon && Math.abs(a.y - b.y) < epsilon && Math.abs(a.z - b.z) < epsilon
  );
}

/**
 * Three.js 객체 탐색 유틸리티
 * @param {object} renderer - create()로 생성된 테스트 렌더러
 * @param {string} type - 찾을 객체 타입 (예: "mesh")
 * @returns {object|null} - 찾은 객체 또는 null
 */
export function getThreeObject(renderer, type) {
  try {
    return renderer.root.findByType(type);
  } catch (error) {
    console.error(`객체를 찾을 수 없음: ${type}`);
    return null;
  }
}
