# Networking

## 상태 분류

- Durable: house, wall, furniture, ownership, post와 persistent 객체.
- Replicated: 문 상태, 공유 interaction, 임시 공유 객체.
- Ephemeral: avatar transform, 머리 회전, typing, cursor, presence.

모든 상태는 authority, replication 주기, persistence 정책, conflict 동작을 선언한다.

## 계약 규칙

- network contract는 `{ x, y, z }` 같은 engine-neutral primitive를 사용한다.
- Three.js 객체, Rapier handle, React ref, Zustand store는 계약을 넘지 않는다.
- command는 의도를 표현하고, accepted event와 snapshot은 authority를 표현한다.
- delta, interpolation, reconciliation은 상태 분류별로 명시한다.

기존 adapter, authority contract, MessageQueue, ConnectionPool, worker, visit 구현을 보존한다. 직접적인 Three.js 의존은 변경하기 전에 migration debt로 기록한다.

방문 스냅샷 수신은 기본적으로 `DEFAULT_VISIT_DOMAINS`만 hydrate한다. 사용자 정의 도메인은 `allowedDomains`로 명시하고, 빈 목록은 모든 적용을 차단한다. 로컬 방문 채널은 호스트 퇴장 시 해당 호스트의 마지막 스냅샷을 제거한 뒤 퇴장을 알린다.

방문 적용기 `applyVisitSnapshot`은 현재 스냅샷 버전 1만 지원한다. 다른 버전은 binding provider와 filter를 호출하기 전에 모든 도메인을 skipped로 반환하며 수동 acceptRemote는 false를 반환한다. 자동 적용도 상태를 변경하지 않는다. 전송 계층과 serializeVisit의 사용자 지정 버전 지원은 유지하므로 스냅샷 전달·보관은 가능하지만, 새 버전의 실제 적용에는 별도의 migration 구현이 필요하다.

WebSocket 방문 채널은 wire version과 필수 snapshot 필드(kind, worldId, hostId, version, savedAt, capturedAt, domains)를 검증한 뒤 구독자에게 전달한다. domains는 객체여야 하며 개별 도메인 내용의 유효성은 이 envelope 검사로 보장하지 않는다. 도메인 검증·migration과 호스트 권한 확인은 별도 경계의 책임이다. 직렬화 실패는 publishNow 호출자에게 전파되고 게시하지 않는다.

`scene-document`는 월드 공유 도메인으로 콘텐츠 번들·월드 스냅샷·기본 방문에 포함된다. 기존 `scene` 키와 공존하며, 장면 오브젝트의 canonical write path는 SceneDocumentController의 replace 명령을 사용하는 기존 save binding이다. 해당 바인딩이 없는 수신자는 이 도메인을 건너뛴다.

플랫폼 월드·플레이어 스냅샷의 collectSaveDomains도 직렬화 실패를 호출자에게 전달한다. WebSocket 방문 채널의 publish와 leave는 인코딩·전송 실패를 전달하며, publishNow는 전송 호출이 성공한 뒤에만 lastPublished를 갱신한다. 이는 서버 수신 확인(ACK)을 뜻하지 않는다. 실패 후 재시도는 호출자 책임이며 기존 스냅샷 구조와 도메인 상태 소유권은 유지한다.

건축 저장 경로 hydrateBuildingState는 초기화 전에 최상위 객체·지원 버전·컬렉션 배열·환경 설정을 검사한다. 빈 객체와 알 수 없는 필드만 있는 객체는 거부하며, 명시적인 빈 배열과 버전 없는 기존 부분 데이터는 허용한다. 따라서 building:{} 방문은 skipped로 처리되고 기존 건축물은 유지된다. 개별 배열 요소의 전체 스키마 검증과 복수 도메인의 원자적 적용은 이 검사에 포함되지 않는다.

PlayerNetworkManager의 소켓 open/error/close는 현재 소켓만 상태를 변경한다. ACK 채팅의 최초 send 실패는 호출자에게 전달하며, 오프라인 큐 flush에서는 기존 catch가 실패 메시지부터 보존한다. 재연결은 기존 ACK 재전송 후 대기 채팅을 전송해 새 메시지의 즉시 중복 전송을 피한다. PlayerInfoOverlay는 동기 전송 실패 시 초안을 유지하고 한국어 재시도 안내를 표시한다. wire 형식과 ACK 재시도 횟수는 유지한다.

플랫폼 월드·플레이어 스냅샷 helper는 각 허용 도메인을 직렬화 전에 선택한다. 제외된 도메인의 serialize를 호출하지 않으며 포함된 도메인의 실패는 계속 전파한다. collectSaveDomains는 기존처럼 전체 도메인을 수집한다.

건축 indexAabb/queryAabbIds는 유효한 셀 크기, 안전한 정수 좌표·pair 키와 작업량을 검사한다. 공간 조회·인덱싱 및 타일·블록 footprint 생성은 작업당 65,536셀을 초과하면 RangeError를 반환한다. 총 월드 엔티티 수 제한은 아니다. 건축 store hydrate는 Immer 트랜잭션으로 실패 이전 상태를 유지하지만, raw hydrateBuildingState에 일반 객체를 직접 전달하는 경로의 원자성이나 전체 payload 스키마 검증을 보장하지 않는다.
