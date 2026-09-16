# 3D 미니홈피 예제

이 프로젝트의 대표 제품 예제는 3D 싸이월드 스타일 미니홈피다. 개인의 작은 방, 미니미, 프로필과 기록을 하나의 공간으로 구성한다.

## 실행과 사용

```bash
pnpm install
pnpm dev
```

Vite가 브라우저를 연다. 기본 주소는 `http://127.0.0.1:5174/`이며 포트가 사용 중이면 다음 빈 포트를 사용한다. 터미널의 Local 주소가 실제 실행 주소다. 기존 서버를 종료할 필요는 없다.

- 바닥을 클릭하면 미니미가 이동한다. 오른쪽 드래그로 방을 회전하고 휠 또는 확대·축소 버튼으로 크기를 조절한다.
- **미니룸 꾸미기**에서 가구를 추가하고, 가구를 클릭해 선택한 뒤 드래그하거나 방향 버튼으로 이동한다. 회전·삭제와 세 가지 방 색상을 지원한다. 가구는 최대 40개다.
- **프로필 수정**에서 이름, 제목, 소개, 기분을 바꾼다.
- **다이어리**와 **방명록**에서 글을 작성한다. 각 목록은 최신 100개를 보관한다.
- **미니홈피 저장**을 누르면 현재 브라우저에 저장된다. 새로고침하면 방 배치와 프로필, 기록을 복원한다. 저장소 오류는 화면에 표시하며, 손상된 저장 데이터는 사용자가 저장 버튼을 누르기 전까지 덮어쓰지 않는다.
- 개발자용 숲 성능 실험은 `/engine`에서 제공한다.

## 데이터와 렌더링

`examples/minihome/model.ts`는 공개 `gaesup-world`의 `SceneDocument`와 `createSceneObject`를 사용한다. `Minihome.tsx`는 `createSceneDocumentController`의 command로 가구를 생성·수정·삭제하고, `useSyncExternalStore`로 canonical snapshot을 구독한다. 가구 transform의 영구 변경 경로는 controller 하나다. 드래그 중 Three.js 위치는 임시 preview이며, 놓을 때 command 하나로 확정한다.

`room.ts`는 document를 Three.js scene에 투영한다. WebGPU를 우선 사용하고 지원하지 않으면 WebGL2로 전환한다. geometry와 material을 공유하며, 방을 떠날 때 animation loop, subscription, pointer listener, controls, shadow와 GPU 리소스를 해제한다. 방의 영구 데이터에는 renderer 객체가 들어가지 않는다.

전체 미니홈피는 version 1 JSON으로 `localStorage`의 `gaesup.minihome.v1`에 저장한다. 앱은 공개 package import만 사용하며, 미니홈피와 엔진 실험실을 지연 로드한다.

## 검증과 현재 범위

```bash
pnpm test -- examples/minihome/__tests__/model.test.ts --runInBand
pnpm run test:demo
pnpm run test:minihome:browser
```

브라우저 검증에는 실행 중인 dev server와 Chrome이 필요하다. 기본 주소 이외에 실행했다면 `GAESUP_PROBE_URL` 환경 변수로 지정한다. 이 검증은 WebGPU 렌더, WebGL2 fallback, 프로필·가구 편집과 저장 복원, 글 작성, 삭제, 손상 데이터 보존, 저장 용량 오류, 모바일 overflow를 확인한다. 결과와 화면은 `.tmp/minihome/`에 생성된다.

현재는 **브라우저 로컬 미리보기**다. 로그인, 서버 저장, 다른 사용자의 홈 방문, 온라인 방명록, 실시간 접속, 사진첩과 BGM은 연결하지 않았다. 로컬 방명록 작성자는 사용자가 입력하는 이름이며 인증된 온라인 작성자가 아니다. 서버 연동 시 문서와 프로필의 소유자, 쓰기 권한, 버전 충돌 정책을 정한 뒤 persistent data contract에 연결해야 한다.
