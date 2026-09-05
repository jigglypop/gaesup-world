# Config 검증 현황

이 문서는 config 문서와 실제 코드의 현재 정합성 상태를 정리합니다.

## 현재 원칙

- 문서의 config 타입은 실제 `src` 타입 또는 store slice에 존재해야 합니다.
- 설계안은 구현된 설정처럼 쓰지 않고 “현재 없음” 또는 “제안”으로 표시합니다.
- 매 프레임 realtime state는 store에 무분별하게 넣지 않습니다.
- React 컴포넌트는 필요한 config만 selector로 구독합니다.

## 확인된 실제 config 경로

- Camera: `src/core/camera/core/types.ts`, `src/core/camera/bridge/types.ts`, `useGaesupStore.cameraOption`
- Physics: `src/core/stores/slices/physics`
- Building: `src/core/building/types`, `src/core/building/types/constants.ts`, `useBuildingStore`
- Networks: `src/core/networks/config`
- Animation/Motions/Interactions: 각 도메인 타입과 store/hook 경로

## 최근 정리한 문서

- `docs/config/BUILDING_CONFIG.md`: 실제 `TILE_CONSTANTS`, building types, store 기준으로 축소
- `docs/config/PHYSICS_CONFIG.md`: 실제 `PhysicsConfigType` 기준으로 축소
- `docs/config/BLUEPRINT_CONFIG.md`: 구현된 loader/factory/registry 기준으로 축소
- `docs/config/EXPORT_AUTOMATION.md`: 존재하지 않는 generator 명령 제거

## 현재 리스크

### 1. 문서가 설계안을 구현처럼 표현할 위험

일부 config 문서는 Unreal/Unity 스타일의 이상적인 설정을 예시로 두고 있었지만 실제 코드에 없는 타입이 많았습니다. 현재 문서는 실제 구현 중심으로 낮췄습니다.

### 2. 공개 API와 내부 API 혼동

`package.json` exports에 없는 deep path는 외부 문서에서 사용하면 안 됩니다.

### 3. 검증 범위 과장

“모든 도메인 검증 완료”, “60fps 보장” 같은 표현은 실제 자동 검증 근거가 없으면 사용하지 않습니다.

## 검증 명령

현재 상태 확인에 사용하는 명령:

```bash
npm run lint
npm test -- --runInBand --watchman=false
npm run build:types
```

## 완료 기준

config 문서는 아래 기준을 만족해야 현재 문서로 봅니다.

- 문서의 타입 이름이 실제 코드에 존재함
- import 예시가 `package.json` exports와 일치함
- 기본값이 실제 source와 일치함
- 미구현 항목은 “현재 없음”으로 명시함
- 새 config 추가 시 테스트 또는 사용처가 함께 있음
