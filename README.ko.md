# gaesup-world

브라우저에서 플레이 가능한 3D 방을 만들고, React에서 사용하고, Unity와 배치를 주고받는 라이브러리입니다.

[미니홈피 바로 사용하기](https://jigglypop.github.io/gaesup-world/) · [English](README.md) · [미니홈피 사용법](docs/minihome.md) · [Unity 연결](docs/unity.md)

TypeScript 월드 라이브러리와 싸이월드에서 영감을 받은 미니홈피 예제를 제공합니다. 3D 방, 걸어 다니는 아바타, 가구 편집, 프로필, 다이어리, 방명록이 있습니다. 현재 브라우저에 저장하며 공유 링크는 방의 사본을 전달합니다. 실시간 멀티플레이 서비스는 아닙니다.

작업 버전은 `2.0.0-next.0`입니다. 로컬 버전 변경이 npm 배포 완료를 뜻하지는 않습니다. 프리뷰 설치 전에 npm 공개 상태를 확인하세요.

## 실행하기

```sh
corepack pnpm install
corepack pnpm dev --host 127.0.0.1 --port 5174
```

http://127.0.0.1:5174/ 를 여세요. `/engine`은 별도 렌더링 쇼케이스입니다. 미니홈피 체험에는 모델 URL, AI 키, Unity 설치가 필요하지 않습니다.

1. **미니룸 꾸미기**에서 가구를 추가하거나 드래그로 이동합니다.
2. 프로필과 테마를 바꿉니다. 실행 취소는 방과 글을 함께 다룹니다.
3. 변경은 1.2초 뒤 자동저장됩니다. **미니홈피 저장**은 즉시 저장합니다.
4. JSON 파일 백업을 내려받거나 이전 정상 저장본을 복구합니다.
5. 방과 프로필 사본을 공유하거나 보이는 방을 GLB로 내보냅니다.

## 라이브러리 사용

React 19 앱에서 서로 맞는 의존성 조합:

```sh
npm install gaesup-world@next react@19 react-dom@19 three@0.185 three-stdlib @react-three/fiber@9 @react-three/drei@10 @react-three/rapier@2 @react-three/postprocessing@3
```

`next` 태그가 배포된 뒤 실행하세요. 그전에는 위의 저장소 예제를 사용합니다. React 18/Fiber 8도 peer 범위에 포함되지만 별도 소비 검증이 필요합니다.

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

프리뷰의 `exportUnityScene`과 `importUnityScene`은 로컬 transform, 계층, ID, component 메타데이터를 교환합니다. 미터 단위, quaternion, Z축 변환을 사용합니다. 포함된 Unity Editor 스크립트가 이 JSON을 읽고 씁니다. GLB는 geometry와 material을 내보냅니다. 임의의 게임 스크립트나 네이티브 `.unity` 파일을 자동 호환하지 않습니다. [설치와 제한](docs/unity.md).

## 검증과 배포

```sh
corepack pnpm run verify:full
corepack pnpm run test:minihome:browser
corepack pnpm run build:demo
```

브라우저 검증은 5174 포트 dev server와 로컬 Chrome을 사용하며 WebGPU와 WebGL2를 따로 확인합니다. `test:demo`는 빌드 구조 검사로, 실제 화면 검증을 대신하지 않습니다.

`npm run deploy`는 `demo-dist`를 빌드해 GitHub Pages에 배포합니다. 다른 경로에서는 `GAESUP_BASE_URL`을 지정하세요. `version.json`은 버전·커밋·미커밋 변경 여부·시각을 기록합니다. Pages의 깊은 경로는 `404.html`로 열리지만 HTTP 404일 수 있습니다.

npm은 검증 후 로컬 `npm login`으로 인증하고 검토한 tarball을 `--tag next`로 배포합니다. 소비 검증 전에는 `latest`를 승격하지 않습니다.

## 현재 제한

- 미니홈피에 계정 로그인, 기기 간 저장, 실시간 방문, 공동 편집이 없습니다.
- 공유 링크에는 다이어리·방명록이 없으며 링크 소유자는 프로필과 방을 읽을 수 있습니다.
- shear는 world matrix에 보존합니다. TRS로 표현 불가능하면 `getWorldTransform`이 오류를 내므로 `getWorldMatrix`를 사용하세요.
- Unity Editor 컴파일과 실제 왕복은 Unity 설치 환경에서 따로 검증해야 합니다.

[실행계획](docs/2026-09-19-web-studio-plan.md) · [릴리스 노트](docs/release-2.0.0-next.0.md)
