# PRD-22 네트워크

| 항목 | 값 |
|---|---|
| 우선순위 | P2 (22-a, 22-b 보안 항목은 P1) |
| 트랙 | Epoch (프로토콜과 권한 모델 변경) |
| 선행 PRD | 21 (visit 격리), 10 (command 경로) |
| 성격 | Optional Kit (`gaesup-world/network`) |

## 1. 배경과 문제

### 1.1 구조
`src/core/networks`에 서로 연결되지 않은 세 스택이 섞여 있다.
| 스택 | 파일 | 상태 |
|---|---|---|
| (a) 실제 멀티플레이 릴레이 | `core/PlayerNetworkManager.ts`(817줄), `hooks/useMultiplayer.ts`, `components/MultiplayerCanvas.tsx`, `RemotePlayer.tsx` | 사용 중 (`NetworkMultiplayerPage`) |
| (b) NPC 가상 네트워크 시뮬레이션 | `NetworkSystem.ts`, `NPCNetworkManager.ts`, `MessageQueue.ts`, `ConnectionPool.ts`, `bridge/NetworkBridge.ts` | 실제 I/O 없음, 훅 다수 사용처 없음 |
| (c) 권한 서버 계약 | `adapter/contracts.ts`, `adapter/authority.ts`, `adapter/types.ts`, `platform/serverHost.ts` | 전송 계층(a)과 미연결, 구현체 없음 |

프로토콜도 세 벌이다: snake_case WebSocket, `NetworkMessageEnvelope`(dot.case), visit wire(`VisitSnapshot` v1).

### 1.2 보안·동기화 문제
| ID | 내용 | 근거 |
|---|---|---|
| N-01 | 원격 `modelUrl`을 그대로 `useGLTF` | `RemotePlayer.tsx:113,487` |
| N-02 | chat text, name 길이 제한 없음 | `PlayerNetworkManager.ts:810-812` |
| N-03 | visit 채널 발신자 검증 없음. 임의 hostId로 `VisitLeave` 위조 가능, `domains` 크기 제한 없음 | `visit/channel.ts:113-127` |
| N-04 | 권한 라우터가 actorId-세션 일치, commandId 중복(replay), `expectedRevision`/`clientSequence`를 검사하지 않고 handler 예외를 그대로 전파 | `adapter/authority.ts:135-152` |
| N-05 | 모든 게임플레이 플러그인이 client 전용 → `createServerPluginHost`가 내장 도메인을 로드하지 않음. 경제는 완전 클라이언트 권한 | `plugins/runtimeFilter.ts:9` |
| N-06 | `server-contracts` 엔트리가 React와 UI를 끌어옴 | `gameplay/events/registry.ts:7-11` |

### 1.3 죽은 코드
`network.worker.ts`(182줄, `new Worker` 0건), `MockNetworkAdapter`, `createNetworkEnvelope`, `useNPCConnection`, `useNetworkGroup`, `useNetworkMessage`, `NPCNetworkVisualizer`, `ops/rbac.ts`의 `canMember`/`resolveRolePermissions`, `LedgerCommandPayload`.

## 2. 목표 / 비목표

### 목표
1. 네트워크를 두 폴더로 나눈다: `npc-sim`(가상 네트워크)과 `net`(멀티플레이 전송).
2. 전송은 `NetworkAdapter` 계약 하나 뒤에 둔다. 구현: WebSocket(기본), WebTransport(두 번째).
3. 프로토콜을 하나의 envelope로 통일한다.
4. 원격 입력에 경계를 둔다(허용 목록, 길이, 크기, 발신자).
5. 서버 권한 명령 경로를 경제·인벤토리부터 실제로 동작시킨다.
6. `server-contracts`에서 React가 로드되지 않는다.

### 비목표
- 매치메이킹, 로비 서비스, 호스팅 인프라.
- 롤백 넷코드.
- 서버 프로세스 자체의 구현(저장소 밖). 계약과 샘플 호스트까지만.

## 3. 요구사항

| ID | 요구사항 |
|---|---|
| FR-1 | `NetworkAdapter { connect, send(envelope, { reliable }), onMessage, close }`. WebSocket 구현은 `reliable: false`도 reliable로 전송 |
| FR-2 | WebTransport 구현: reliable은 stream, unreliable은 datagram. 미지원 시 WebSocket 폴백 |
| FR-3 | 단일 envelope: `{ v, type, seq, ts, actorId?, payload }`. 기존 snake_case 메시지는 어댑터 경계에서 변환 (1.x 호환) |
| FR-4 | 채널 분류: presence/transform(ephemeral, unreliable 허용), command(reliable, 권한 검증), snapshot(reliable, 크기 상한) |
| FR-5 | 원격 모델은 `assetId`만 허용, 허용 목록 밖이면 기본 모델 (PRD-20) |
| FR-6 | 길이·크기 상한을 설정 객체로: chat, name, snapshot 바이트, 도메인 수 |
| FR-7 | 권한 라우터: 세션 → actorId 바인딩 검증 훅, commandId 멱등 캐시(TTL), `expectedRevision` 비교, handler 예외 → rejected |
| FR-8 | economy, inventory 명령을 순수 핸들러로 추출하고 `runtime: 'both'` 플러그인으로 등록. 클라이언트는 낙관적 적용 후 서버 결과로 확정·롤백 |
| FR-9 | `server-contracts` import 그래프에 react, @react-three/*, zustand가 없음 (가드 테스트) |
| NFR-1 | transform 동기화 20Hz에서 클라이언트당 송신 대역 기록 |
| NFR-2 | 패킷 손실 5% 조건에서 원격 캐릭터 보간 지터 기록 (WebSocket vs WebTransport) |

## 4. 단계별 작업

| Slice | 트랙 | 내용 | 완료 기준 |
|---|---|---|---|
| 22-a | Fast | N-01, N-02, N-03 입력 경계 | 악성 입력 테스트 |
| 22-b | Epoch | N-06 `server-contracts` 격리: `gameplay/events/registry` 기본 핸들러를 포트로 분리 (PRD-23 23-a와 같이) | 가드 테스트 (FR-9) |
| 22-c | Epoch | N-04 권한 라우터 강화 | replay, 위장, revision 충돌 테스트 |
| 22-d | Epoch | 폴더 분리와 죽은 코드 삭제 (사용자 확인) | 공개 API 갱신 |
| 22-e | Epoch | `NetworkAdapter` + WebSocket 구현, `PlayerNetworkManager`를 어댑터 소비자로 | 멀티플레이 예제 동작 |
| 22-f | Epoch | 단일 envelope와 채널 분류 | 프로토콜 테스트 |
| 22-g | Epoch | economy/inventory 서버 권한 명령 | 샘플 서버 호스트로 구매 흐름 E2E |
| 22-h | Epoch | WebTransport 구현 | NFR-2 측정 기록 |

## 5. 공개 API 영향

- 서브패스 `./network` 내용 재구성, `./server-contracts` 의존 축소.
- 삭제 후보: NPC 네트워크 훅 중 사용처 없는 것, `network.worker.ts`, `MockNetworkAdapter`(테스트 유틸로 이동).
- 서브패스 변경 시 6파일 동시 수정 절차.

## 6. 검증과 완료 기준

- networks, save(visit), economy, inventory 테스트
- `test:package`: server-contracts 소비 시 react 미로드
- 샘플 서버 호스트와 브라우저 2개로 E2E

## 7. 리스크와 대응

| 리스크 | 대응 |
|---|---|
| 기존 WebSocket 서버와 프로토콜 비호환 | 1.x 동안 어댑터 경계에서 구·신 메시지 변환 |
| NPC 시뮬레이션 사용자 영향 | 폴더 이동만 하고 API 유지, 사용처 없는 훅만 삭제 |

## 8. 열린 질문

1. NPC 가상 네트워크(b)를 유지할 가치가 있는가. 사용처가 거의 없다.
2. `ops/rbac`를 admin kit으로 옮길지 삭제할지.

## 구현 현황 (2026-09-23, 2차)

| Slice | 상태 | 내용 |
|---|---|---|
| 22-a | 부분 | 원격 이름·필드·채팅 길이 상한, visit 와이어 메시지 크기와 도메인 수 상한, 원격 modelUrl은 같은 출처 경로 또는 허용 origin만(`allowedModelOrigins`). 발신자 검증은 인증된 전송 계층이 필요해 미착수 |
| 22-b | 완료 | `server-contracts`가 `gameplay/server.ts`(순수)만 참조. 163개 파일·프레임워크 import 41건에서 31개 파일·0건. `pnpm check:entries`와 가드 테스트 추가 |
| 나머지 | 미착수 | |

검증: 타입체크(src, examples)와 변경 파일 린트 통과. 새 테스트는 메모리 제약으로 실행하지 않았다.
