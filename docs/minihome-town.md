# 3D 타운 미니홈피

2026-09-22. `examples/minihome`의 타일 편집·공간 방문 예제. 전체 제품 요구사항은 [PRD](./PRD-gaesup-world.md)를 따른다.

## 실행

```powershell
corepack pnpm dev
```

`http://127.0.0.1:5174/`에서 둘러보기, `http://127.0.0.1:5174/?edit=1`에서 편집 화면을 연다. 개발 서버에 실시간 방 서비스가 포함된다.

빌드 결과를 확인하려면:

```powershell
corepack pnpm run build:demo
corepack pnpm exec vite preview --host 127.0.0.1 --port 4181 --base /gaesup-world/
```

`http://127.0.0.1:4181/gaesup-world/`에서 연다. 빌드와 preview의 base를 동일하게 설정해야 한다. Preview에도 같은 방 서비스가 연결된다. 개발 서버와 preview의 접속 방은 각각 별개다.

## 편집

- 초기 24×24 타일: 잔디, 눈, 모래, 바다, 돌길, 나무. 8칸씩 최대 64×64까지 확장하며 기존 좌표를 유지한다.
- 바닥 높이와 네 방향 계단을 편집하고 저장·실행 취소·확장 후에도 보존한다.
- 1×1 / 3×3 / 5×5 브러시. 드래그 한 번을 한 번에 실행 취소한다. Esc와 포인터 취소는 미리보기를 폐기한다.
- 가구 12종: 소파, 테이블, 화분, 책장, 조명, 쿠션, 나무, 벤치, 작업 책상, 네온 조형물, 분수, 아케이드. 기본 배치 22개, 최대 160개.
- 가구를 고르고 바닥을 클릭해 배치한다. 선택 도구로 드래그, 좌표 입력, 방향 이동, 90도 회전, 복제, 삭제를 한다.
- 격자 표시와 스냅을 별도로 조절한다. Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z를 지원한다.
- 프로필·기록·테마·타일·가구·카메라 설정은 기존 저장/백업/공유/실행 취소 흐름에 연결된다. 기존 v1 저장에 없는 지형·설정 필드는 기본값으로 보완한다.
- 모바일은 캔버스 위의 스크롤 가능한 편집 패널에서 타일과 가구를 고른다. 헤더의 프로필 버튼으로 프로필을 편집한다.

## 둘러보기와 카메라

광장·라운지·작업실·눈 정원·해변으로 이동할 수 있다. 바닥 클릭 또는 WASD/방향키 입력으로 이동하며, 경로와 목적지 링을 표시한다. 갈 수 없는 목적지는 붉은 링과 설명으로 표시한다. 바다와 가구를 이동 격자에 반영하고 편집 후 경로를 갱신한다. 아바타 주변 통로를 지나치게 막지 않도록 내비게이션 격자는 0.25m, 아바타 반경은 0.3m로 설정한다.

시점: 입체, 정면, 위, 뒤, 왼쪽, 오른쪽, 아바타 따라가기. 직교/원근 투영, 확대, 화면 이동, 회전, 시선 높이, 아바타 중심 이동, 부드러운 이동, 아바타 속도를 조절한다. 오른쪽 드래그로 회전, 가운데/Shift+오른쪽 드래그로 화면 이동, 휠로 확대한다. 터치는 한 손가락 회전과 두 손가락 이동·확대를 지원한다.

## Bloom과 드로우콜

선택 가구의 `miniroom.furniture` 컴포넌트에 `bloom`과 `emissiveIntensity`를 저장한다. 조명·네온·아케이드는 기본 발광 객체다. 전역 Bloom on/off, 강도, 반경, 밝기 기준을 별도로 조절한다. WebGPU는 Three.js RenderPipeline/BloomNode, WebGL은 EffectComposer/UnrealBloomPass/OutputPass를 사용한다. 출력 색 변환 전에 HDR 번짐을 합성한다.

공식 API: [BloomNode](https://threejs.org/docs/pages/BloomNode.html), [UnrealBloomPass](https://threejs.org/docs/pages/UnrealBloomPass.html).

성능 패널은 마지막 렌더 프레임의 실제 카운터를 표시한다:

- 전체 Draw, 장면 Draw, 그림자 Draw, 후처리·배경·기타 Draw.
- 객체/인스턴스 배치별 Draw, 인스턴스 수, 삼각형 수, 재질.
- CPU 제출 시간, geometry/texture/program 수, 실제 해상도, 타일 배치 수, Bloom 객체 수.
- 프레임 JSON 내보내기와 기존 API fixture 검사.

상세 계측은 패널을 열었을 때만 활성화한다. 각 객체의 렌더 전후 카운터 차이를 측정하며 중첩된 그림자 Draw를 중복 합산하지 않는다. 나머지는 전체 카운터에서 객체·그림자 합계를 뺀 값이다. 그림자 재사용 프레임의 그림자 Draw는 0일 수 있다. CPU 제출 시간은 GPU 실행 시간이 아니다. 바람과 물결을 끄고 움직임·카메라 보간·목적지 표시가 끝나면 RAF를 멈춘다. 자연 효과가 켜져 있으면 잔디·물·날씨 애니메이션을 계속 갱신한다.

## 함께 방문하기

`함께 둘러보기`에서 같은 방 코드로 입장한다. 실제 연결된 방문자만 3D 아바타와 이름으로 표시하며 5m 이내의 참가자에게 채팅이 전달된다. 첫 입장자가 공간을 공유하고 편집한다. 서버가 편집 권한, 세션 토큰, 방 격리, 위치·메시지 범위와 요청 빈도를 검사한다.

방문 중에는 개인 공간의 저장을 보류하고 나가면 복원한다. 주인이 나가 권한을 이어받아도 방문자의 개인 공간을 자동으로 덮어쓰지 않는다. 개인 일기·방명록·음향/카메라 취향은 방 서버에 전송하지 않는다. 서버의 방 상태는 메모리에 있으며 마지막 참가자가 나간 뒤 60초 후 정리된다.

정적 호스팅에서는 별도의 Node 방 서버 주소를 빌드에 지정한다:

```powershell
# 서버: 허용할 웹 사이트의 Origin을 지정한다.
$env:MINIHOME_ORIGIN = 'https://example.com'
$env:MINIHOME_HOST = '0.0.0.0'
$env:MINIHOME_PORT = '5187'
corepack pnpm run minihome:server

# 웹 빌드: 배포한 방 서버의 HTTPS 주소를 지정한다.
$env:VITE_MINIROOM_SERVER = 'https://rooms.example.com'
corepack pnpm run build:demo
```

실시간 방은 방 코드로 접속하며 서버 메모리에 상태를 보관한다. 외부 사이트 배포와 npm 발행은 별도 릴리스 작업이다.

## 검증

```powershell
corepack pnpm exec jest examples/minihome/__tests__ --runInBand
node --test scripts/minihome-room-service.test.mjs
corepack pnpm run test:minihome:town
corepack pnpm run test:minihome:browser
corepack pnpm run test:minihome:features
corepack pnpm run test:demo
```

`test:minihome:town`은 실제 브라우저에서 타일/가구 편집, 저장/undo, 지형 변경에 따른 통행, 카메라 투영/이동/따라가기, Bloom 비교, Draw 합산, 모바일 터치, 두 독립 세션의 방문/근거리 채팅/편집 동기화/주인 변경 후 개인 데이터 보존을 검사한다. `GAESUP_PROBE_URL`로 검사 주소를 바꿀 수 있고 `?renderer=webgl`로 WebGL 경로를 고를 수 있다. 원시 결과와 화면은 `.artifacts/minihome/town-*`에 남긴다.

2026-09-21 검증 기록:

| 요구사항 | 현재 동작 | 브라우저 증거 |
| --- | --- | --- |
| 편집 페이지·타일·가구 | 전용 편집 화면, 타일 6종, 브러시, 12종 가구 배치/변형, 저장/undo | `04-editor.png`, `07-mobile-editor.png`, 편집·복원 검사 |
| 게더타운 형태의 공간 | 5개 장소, 실제 방문자 아바타, 근거리 채팅, 주인 편집 동기화 | 독립 브라우저 2개와 `08-real-visitor.png` |
| 카메라 옵션 | 시점 7종, 투영 2종, 이동/회전/확대/중심, 실제 따라가기 | preset/projection/pan/follow와 광장↔해변 왕복 검사 |
| 상세 드로우콜 | 렌더러 카운터와 객체별 장면/그림자 합계·나머지 일치 | 초기 WebGPU 163 = 78 + 72 + 13, WebGL 164 = 78 + 72 + 14 |
| Bloom 객체 | 객체별 발광과 실제 후처리 on/off | `05-bloom-on.png`, `06-bloom-off.png` 시각 검토 |
| 클릭 이동 표시 | 경로선·목적지 링·도착·이동 불가 피드백 | `02-move-path.png`, `03-blocked.png`, 바다 칠하기/육지 복원 후 통행 검사 |

- 빌드된 preview / native WebGPU (NVIDIA Blackwell): `.artifacts/minihome/town-2026-09-21T13-10-34-794Z/result.json`, 검사군 10개 통과, 브라우저/GPU 오류 0.
- 개발 서버 / WebGL2: `.artifacts/minihome/town-2026-09-21T13-07-54-423Z/result.json`, 같은 검사군 10개 통과, 오류 0.
- 기존 저장·백업·공유·개인 기록 보존·사진·GLB·컨텍스트 복구: `.tmp/minihome/result.json`, GLB 검증 오류 0, native/fallback 오류 0.
- 아바타 3종·실패 복구·오디오·설정 복원·GLB·walk/idle·6회 교체: `.artifacts/minihome/2026-09-21T12-59-36-214Z/result.json`, 오류 0.
- 미니홈피 단위 검사 4 suites / 13 tests, 방 서비스 HTTP 계약 검사 통과. TypeScript, 전체 ESLint, demo build와 초기 청크/반응형 검증 통과.

위 Draw 수는 해당 장면·프레임의 스냅샷이며 고정 예산이나 FPS 개선율이 아니다. 이동이 없는 상태에서 렌더 루프가 멈추는 것도 별도로 검사했다.
