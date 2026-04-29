# Gaesup World

[![Version](https://img.shields.io/npm/v/gaesup-world?style=flat-square&logo=npm&logoColor=white&labelColor=000000&color=blue)](https://www.npmjs.com/package/gaesup-world)
[![Downloads](https://img.shields.io/npm/dt/gaesup-world.svg?style=flat-square&logo=npm&logoColor=white&labelColor=000000&color=blue)](https://www.npmjs.com/package/gaesup-world)

![Gaesup World 메인 이미지](https://signightbackend.s3.ap-northeast-2.amazonaws.com/images/gemini/image/1776774136799_88c802b2359c.jpg)

`Gaesup World`는 `React Three Fiber`, `Three.js`, `Rapier`, `Zustand` 기반으로 만든 웹 3D 월드/게임 라이브러리입니다. 캐릭터 이동, 카메라, 상호작용, 건설, 애니메이션, 네트워크, 인벤토리, 퀘스트, 날씨, 타운 시스템처럼 월드 게임에 필요한 기능을 도메인 단위로 제공합니다.

이 저장소는 두 가지 역할을 함께 가집니다.

- `src/`: 실제 배포되는 라이브러리 코드
- `examples/`: 라이브러리를 사용하는 데모 앱

## 현재 상태

- 패키지명: `gaesup-world`
- 문서 기준 import 엔트리: `gaesup-world`
- 라이브러리 ESM 빌드: 확인 완료
- 데모 Vite 빌드: 확인 완료
- Jest 테스트: 통과
- TypeScript declaration build: 통과

즉, 런타임, 번들, 타입 선언 빌드 기준으로는 사용 가능한 상태입니다.

## 설치

프로젝트에서 사용할 때는 `gaesup-world`와 React Three Fiber 계열 의존성을 함께 설치하면 됩니다.

```bash
npm install gaesup-world three react react-dom @react-three/fiber @react-three/drei @react-three/rapier
```

또는

```bash
yarn add gaesup-world three react react-dom @react-three/fiber @react-three/drei @react-three/rapier
```

또는

```bash
pnpm add gaesup-world three react react-dom @react-three/fiber @react-three/drei @react-three/rapier
```

## 빠른 시작

가장 기본적인 사용 예시는 아래와 같습니다.

```tsx
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { GaesupController, GaesupWorld } from 'gaesup-world';

const CHARACTER_URL = 'https://your-cdn.example.com/character.glb';

export default function App() {
  return (
    <GaesupWorld
      urls={{ characterUrl: CHARACTER_URL }}
      mode={{ type: 'character', controller: 'keyboard', control: 'thirdPerson' }}
    >
      <Canvas shadows camera={{ position: [0, 6, 10], fov: 50 }}>
        <Physics>
          <GaesupController />
        </Physics>
      </Canvas>
    </GaesupWorld>
  );
}
```

## 핵심 개념

### 월드 설정

`GaesupWorld`는 월드 관련 설정을 store에 주입하는 루트 컴포넌트입니다.

- `urls`: 캐릭터/차량/비행기 모델 URL
- `mode`: 플레이어 타입, 입력 방식, 카메라 제어 방식
- `cameraOption`: 카메라 세부 옵션

내부적으로는 `WorldContainer` 또는 `WorldConfigProvider` 역할을 감싼 공개 API입니다.

### 플레이어 제어

`GaesupController`는 캐릭터/엔티티 조작을 담당하는 기본 컨트롤러입니다.

- 키보드 이동
- 클릭 이동
- 상호작용 시스템 연결
- 이동/상태 브리지 연결

### 도메인 기반 구조

주요 기능은 도메인 단위로 분리되어 있습니다.

- `animation`
- `camera`
- `motions`
- `interactions`
- `world`
- `building`
- `networks`
- `time`
- `save`
- `inventory`
- `items`
- `quests`
- `weather`
- `town`
- `audio`
- `npc`
- `blueprints`
- `admin`

## 자주 쓰는 공개 API

대표적으로 아래 항목들을 루트 엔트리에서 바로 import 할 수 있습니다.

```tsx
import {
  GaesupWorld,
  GaesupController,
  WorldContainer,
  WorldConfigProvider,
  BuildingUI,
  InventoryUI,
  QuestLogUI,
  DialogBox,
  WeatherEffect,
  useInventoryStore,
  useQuestStore,
  useWeatherStore,
  useGameTime,
  getItemRegistry,
  getNPCScheduler,
} from 'gaesup-world';
```

블루프린트 런타임 관련 API도 루트 엔트리에서 바로 사용할 수 있습니다.

```tsx
import {
  BlueprintSpawner,
  blueprintRegistry,
  BlueprintFactory,
} from 'gaesup-world';
```

관리자 UI와 블루프린트 편집 UI는 별도 subpath를 사용합니다.

```tsx
import { GaesupAdmin, useAuthStore } from 'gaesup-world/admin';
import { BlueprintEditor } from 'gaesup-world/blueprints/editor';
```

## Admin 사용법

관리자 UI는 `gaesup-world/admin` 엔트리에서 import 합니다.

```tsx
import { GaesupAdmin } from 'gaesup-world/admin';
```

기본적으로 `GaesupAdmin`은 로그인 게이트가 켜져 있습니다. 즉, `requireLogin` 기본값은 `true`입니다.

```tsx
import { GaesupAdmin } from 'gaesup-world/admin';

export default function AdminPage() {
  return (
    <GaesupAdmin>
      <div>Protected Admin Area</div>
    </GaesupAdmin>
  );
}
```

로그인 보호 없이 감싸고 싶다면 명시적으로 꺼야 합니다.

```tsx
<GaesupAdmin requireLogin={false}>
  <div>Public Admin Preview</div>
</GaesupAdmin>
```

## 개발 환경 실행

이 저장소 자체를 로컬에서 실행할 때는 `pnpm` 기준으로 작업하는 것이 가장 자연스럽습니다.

```bash
corepack pnpm install
corepack pnpm dev
```

주요 명령:

```bash
corepack pnpm dev
corepack pnpm build
corepack pnpm exec vite build --mode esm
corepack pnpm exec vite build
corepack pnpm test -- --runInBand
corepack pnpm lint
```

참고:

- 현재 Windows 환경에서는 `prepare` 스크립트가 `pnpm` PATH 설정에 따라 실패할 수 있습니다.
- 이런 경우 `corepack pnpm ...` 형태로 실행하면 정상 동작합니다.

## 데모 앱

`examples/`에는 라이브러리를 실제로 사용하는 데모 라우트가 들어 있습니다.

- `/`: 쇼케이스 데모
- `/world`: 기본 월드/건설 에디터 데모
- `/edit`: 편집 데모
- `/blueprints`: 블루프린트 에디터
- `/network`: 멀티플레이어 데모
- `/admin`: 관리자 래핑 데모

최근 정리로 인해 `examples`는 가능하면 내부 소스 경로 대신 루트 public API를 사용하도록 맞춰져 있습니다.

## 검증 상태

최근 확인 기준:

- `corepack pnpm exec vite build`: 성공
- `corepack pnpm exec vite build --mode esm`: 성공
- `corepack pnpm exec jest --runInBand --watchman=false`: 성공
- `npm run build:types`: 성공

타입 선언 빌드는 현재 통과합니다.

## 문서 안내

프로젝트 개요:

- [프로젝트 개요](./docs/GAESUP_WORLD_OVERVIEW.md)

도메인 문서:

- [애니메이션](./docs/domain/ANIMATION.md)
- [블루프린트](./docs/domain/BLUEPRINT.md)
- [카메라](./docs/domain/CAMERA.md)
- [모션](./docs/domain/MOTIONS.md)
- [네트워크](./docs/domain/NETWORKS.md)
- [보일러플레이트 구조](./docs/domain/BOILERPLATE_ARCHITECTURE.md)

계획 문서:

- [MVP 계획](./docs/plan/MVP.md)

가이드 문서:

- [API 가이드](./docs/guide/API_GUIDE.md)
- [레이어 가이드](./docs/guide/LAYER_GUIDE.md)
- [성능 가이드](./docs/guide/PERFORMANCE_GUIDE.md)
- [테스트 가이드](./docs/guide/TEST_GUIDE.md)

## 패키지 정보

- npm: https://www.npmjs.com/package/gaesup-world
- 저장소: https://github.com/jigglypop/gaesup-world.git
- 라이선스: MIT
