# gaesup-world

React Three Fiber용 TypeScript 3D 월드 라이브러리입니다. WebGPU 우선 렌더링, 물리 캐릭터, 건축, NPC, 멀티플레이, 저장 가능한 월드 모델을 제공하고 Unity와 장면 데이터를 주고받습니다.

[데모 바로 보기](https://jigglypop.github.io/gaesup-world/) · [사용자 가이드](docs/user-guide.md) · [개발자 가이드](docs/developer-guide.md) · [English](README.md)

이번 버전은 `1.1.0`입니다. 게시 여부는 npm registry에서 확인하세요.

## 예제 실행

```sh
corepack pnpm install
corepack pnpm dev --host 127.0.0.1 --port 5174
```

http://127.0.0.1:5174/ 를 여세요. `examples/minihome`은 공개 API(`GaesupWorld`, `WorldPhysics`, `GaesupController`, `BuildingController`, 배회하는 NPC)만으로 작은 마을을 만듭니다. WASD로 걷습니다.

## 라이브러리 사용

React 19 앱에서 서로 맞는 의존성 조합:

```sh
npm install gaesup-world react@19 react-dom@19 three@0.185 three-stdlib @react-three/fiber@9 @react-three/drei@10 @react-three/rapier@2 @react-three/postprocessing@3
```

React 18/Fiber 8도 peer 범위에 포함되지만 별도 소비 검증이 필요합니다.

```ts
import { createSceneDocument, createSceneDocumentController } from 'gaesup-world';

const controller = createSceneDocumentController(createSceneDocument({
  id: 'my-room',
  objects: [{ id: 'chair', name: 'Chair' }],
}));
controller.dispatch({
  type: 'scene-object.update',
  objectId: 'chair',
  patch: { transform: { position: [2, 0, 0] } },
});
const savedScene = JSON.stringify(controller.getSnapshot());
```

SceneDocument는 저장 가능한 데이터입니다. React·Three.js·물리 객체는 실행 시 사용하는 표현입니다. 변경은 document controller를 통과합니다. `gaesup-world/editor`로 편집 UI를 사용할 수 있지만 범용 Studio 전체는 아직 개발 중입니다.

## Unity

프리뷰의 `exportUnityScene`과 `importUnityScene`은 로컬 transform, 계층, ID, component 메타데이터를 교환합니다. 미터 단위, quaternion, Z축 변환을 사용합니다. 포함된 Unity Editor 스크립트가 이 JSON을 읽고 씁니다. GLB는 geometry와 material을 내보냅니다. 임의의 게임 스크립트나 네이티브 `.unity` 파일을 자동 호환하지 않습니다.

## 검증과 배포

```sh
corepack pnpm run verify:full
corepack pnpm run build:demo
```

`test:demo`는 빌드 구조 검사로, 실제 화면 검증을 대신하지 않습니다.

`npm run deploy`는 `demo-dist`를 빌드해 GitHub Pages에 배포합니다. 다른 경로에서는 `GAESUP_BASE_URL`을 지정하세요. `version.json`은 버전·커밋·미커밋 변경 여부·시각을 기록합니다. Pages의 깊은 경로는 `404.html`로 열리지만 HTTP 404일 수 있습니다.

npm은 검증과 `npm login` 인증 후, 검토한 tarball을 별도 태그 없이 `npm publish <tarball>`로 배포합니다.

## 현재 제한

- shear는 world matrix에 보존합니다. TRS로 표현 불가능하면 `getWorldTransform`이 오류를 내므로 `getWorldMatrix`를 사용하세요.
- Unity Editor 컴파일과 실제 왕복은 Unity 설치 환경에서 따로 검증해야 합니다.

