export type Requirement = {
  id: string; title: string; stage: string; scenarioId: string;
  implementation: 'pending' | 'working' | 'implemented';
  /** Final acceptance requires all PRD conditions, not just one successful scenario. */
  acceptedRunIds: string[];
  evidence?: { baselineRunId: string; candidateRunId: string; note: string };
};

const rows = [
  ['R01', '공개 훅 selector', 'S1', 'state-hooks'],
  ['R02', '원자적 저장 복원', 'S1', 'save-transaction'],
  ['R03', '접지·경사·계단', 'S3', 'locomotion'],
  ['R04', '최근접 ray·큰 AABB', 'S3', 'spatial-query'],
  ['R05', '카메라 충돌·반경', 'S3', 'camera-obstacles'],
  ['R06', 'GPU 재질 동기화', 'S1/S4', 'gpu-material'],
  ['R07', '오디오 종료·로드 경합', 'S1', 'audio-lifecycle'],
  ['R08', '엔티티 용량·ID 수명', 'S1', 'entity-lifecycle'],
  ['R09', 'NPC 가시성·시뮬레이션', 'S3', 'npc-distance'],
  ['R10', 'GLTF 교체·크기·preload', 'S1', 'asset-switch'],
  ['R11', '재질 ID 갱신', 'S1', 'material-editor'],
  ['R12', '운영 관리자 권한', 'S8', 'authority-admin'],
  ['R13', 'GPU 다중 카메라', 'S4', 'gpu-multiview'],
  ['R14', '렌더러 통계', 'S0', 'metrics'],
  ['R15', 'GTAO 합성·노이즈', 'S6', 'temporal-quality'],
  ['R16', '이전 위치·history', 'S6', 'temporal-motion'],
  ['R17', 'GPU 버전 호환', 'S4', 'backend-compat'],
  ['R18', '타일 청크 갱신', 'S5', 'terrain-edit'],
  ['R19', '증분 내비게이션', 'S5', 'navigation-edit'],
  ['R20', '문서 편집 비용', 'S5', 'document-edit'],
  ['R21', '에셋·색 공간·캐시', 'S5', 'asset-budget'],
  ['R22', 'Skeleton 해제', 'S5', 'asset-lifecycle'],
  ['R23', '미리보기 Canvas', 'S5', 'asset-gallery'],
  ['R24', '저장·플러그인 수명', 'S1/S5', 'save-lifecycle'],
  ['R25', '월드 상태 격리', 'S2', 'world-isolation'],
  ['R26', 'clock·고정 tick', 'S2', 'tick-determinism'],
  ['R27', 'core/next 계약', 'S2/S4', 'runtime-parity'],
  ['R28', '실행 그래프·자원', 'S4', 'render-lifecycle'],
  ['R29', '패키지·초기화 경계', 'S2', 'package-boundary'],
  ['R30', '네트워크 권위·복구', 'S2/S8', 'network-recovery'],
  ['R31', '운영 구현 테스트', 'S0', 'test-contract'],
  ['T01', 'Three.js r186', 'S4/S6', 'backend-compat'],
  ['T02', '재질별 배치·indirect', 'S4', 'runtime-parity'],
  ['T03', 'Weighted Blended OIT', 'S6', 'transparency'],
  ['T04', 'Meshopt·KTX2', 'S5', 'asset-budget'],
  ['T05', 'BVH·청크·HLOD', 'S3/S5', 'terrain-edit'],
  ['T06', 'Canvas 공유·demand', 'S5', 'asset-gallery'],
] as const;

const evidence: Record<string, NonNullable<Requirement['evidence']>> = {
  R09: { baselineRunId: 'ddb75317-2037-4791-8d0a-9d570fe82c7c', candidateRunId: '8572c5f9-e6d6-4d28-b1ec-6ee475c72a5b', note: 'NPC 이동·판단을 runtime 고정 clock으로 옮겼습니다. 실제 NPCSystem·Rapier의 WebGL/WebGPU 검사에서 화면 밖 이동·현재 위치 LOD·이동 중 저장·재마운트·종료를 통과했습니다. 1,000 NPC 감지 배치를 warmup 10초+측정 30초로 각각 5회 교차 실행해 CPU p95 중앙값이 21.6→10.3ms(52.3% 감소)였습니다. 인덱스 유지 비용과 기존 선형 방식의 결과 동등성을 포함합니다. 100 NPC도 각 5회 측정해 p95 중앙값이 양쪽 0.3ms로 같았습니다. 500 부하, 전체 장면 FPS, 50회 수명 검사와 모바일 실기기 인수는 남아 있습니다.' },
  R03: { baselineRunId: 'b5d2c50a-ccf7-49f6-93ff-4afb26018749', candidateRunId: '894f4dc9-beb2-42d9-9ebe-4b1e196f6da6', note: '실제 Rapier 접촉으로 고지대·경사·이동 발판·점프·공중·순간이동 오판 7→0입니다. 공개 PhysicsEntity→hook→bridge의 착지·점프·재입력·사용자 접촉 정책도 native WebGPU 3회 통과했습니다. Node에서는 삼각형 지형·회전 발판·큰 바닥 이동·센서·그룹·월드 격리와 Rapier 0.12/0.19를 검사합니다. 실제 avatar/계단/카메라 전체 여정·peer matrix·실기기 프레임 예산은 남아 있습니다.' },
  R04: { baselineRunId: 'fd1c630a-3511-4b03-8e12-04d0dc0b1832', candidateRunId: 'ebfd9e1c-ccd0-4e97-9635-42b0efb4a1e2', note: '경계 상자 인덱스로 큰 객체 충돌 누락 1→0, 최근접·거리 제한·정규화·갱신·삭제를 검사합니다. spatial-scale은 1만 객체에서 선형 검색과 120회 결과 일치, 32회 묶음 평균 시간을 기록합니다. 극단 반경·좌표는 전수 검색으로 반복량을 제한합니다. 밀집/장거리 광선·실기기 프레임 예산 검증은 남아 있습니다.' },
  R05: { baselineRunId: '80e8c092-b9fc-4b10-a3ee-89b06809f3da', candidateRunId: 'c9751cac-eb68-4eba-a343-4d5d82404e15', note: '렌더 전 장애물·같은 프레임 추가/삭제·결과 소유권을 수정했습니다. 구와 삼각형의 연속 충돌로 반경을 검사하고 instance/batch/skinning/morph를 검증합니다. camera-radius는 1만 메시 질의와 옆면 접촉을 검사합니다. 전체 카메라 경로·복잡 메시 비용·지원 Three 조합 검증은 남아 있습니다.' },
  R25: { baselineRunId: '5ef8b6be-5e40-44a2-9c45-3c139427a093', candidateRunId: '5590b003-54f1-4982-b298-8e8212d90a7f', note: '월드별 상태·입력·오디오·grass·WorldBridge·NPC·상호작용·시네마틱 수명을 연결했습니다. 게임패드 공유 폴링 1회/프레임, 실제 Rapier 절반/최대 입력 속도 약 5/10 world/s입니다. world-save-hooks에서 잘못된 전역 저장 3→0, save-hook-sharing에서 중복 읽기 2→1·연속 요청의 쓰기/직렬화 12→2를 확인합니다. world-restore-effects에서 늦은 시네마틱·잘못된 장면 전환 각각 1→0, 중간 BGM 2→0이며 실제 오디오 decode의 이전 SFX 차단도 검사합니다. 비동기 명령 취소·상태 이력 복원·재진입 차단과 월드별 네트워크 clock을 연결했습니다. 물리/NPC clock·엔티티/권위 명령 계약, 임의 외부 효과, 실제 USB/Bluetooth 장치 검증은 남아 있습니다.' },
  R26: { baselineRunId: '3cc3f0f4-92a2-48ee-98f9-14e71c9bdc41', candidateRunId: '2d1988b0-7ed6-4ff4-8f54-79d19d47f2e5', note: '시간은 30/60/144Hz에서 초당 60 tick입니다. NetworkSystem과 알림을 공통 clock에 연결해 소비자 1·2개 모두 초당 갱신/알림 30회, 월드별 RAF 1개입니다. WorldPhysics는 입력 계산→실제 Rapier step→네트워크 순서를 고정합니다. world-physics-clock의 WebGL·네이티브 WebGPU에서 180 tick 위치 차이와 표시 보간 오차 0, 점프·착지·종료를 확인했습니다. NPC·게임패드 등 나머지 갱신 경로와 전체 부하 성능 인수는 남아 있습니다.' },
  R10: { baselineRunId: 'f547ff07-9d50-4bef-a665-c861ea5c95da', candidateRunId: 'a79276c4-6e12-4890-9ccf-7cce85958535', note: 'URL 교체 크기·빈 URL·비동기 크기 preload를 실제 GLTF로 확인합니다.' },
  R01: { baselineRunId: '0abd5ef7-ee7c-49ac-bbbf-a8cafc3df0cb', candidateRunId: '0970ec56-1916-4a54-a481-ced05a88f800', note: '훅별 render와 snapshot 경고를 전후 실행에서 비교합니다.' },
  R02: { baselineRunId: '5f788655-3b21-4a8e-ac84-e9f3ebac3713', candidateRunId: 'f435a798-4bb8-40f9-8d06-141e95672f20', note: '적용 실패/취소 시 이미 변경한 도메인을 역순 복원합니다. 도감·날씨·달력·퀘스트·농사 관찰자는 복원을 게임 진행과 구분하며, 실제 IndexedDB 복원 중 파생 갱신은 6→0입니다. 오래된 월드/도메인의 읽기를 무효화하고 같은 슬롯의 선행 쓰기를 기다립니다. 자동 저장/초기 로드 훅을 월드와 슬롯별로 공유합니다. 유효한 복원 적용 전에 시네마틱·장면 전환·이전 SFX를 취소하고 최종 상태의 BGM만 반영합니다. 임의 사용자 명령/외부 효과와의 경합 및 일반 월드 최종 통합은 남아 있습니다.' },
  R06: { baselineRunId: 'ea624e54-b1de-40d4-bff4-be6d7a883066', candidateRunId: 'cad96f6f-766e-41a8-9233-a6ecbb64f50c', note: 'Uniform 편집 시 같은 batch를 유지하고 투명 전환 시 원본 경로로 전환합니다.' },
  R07: { baselineRunId: 'e2ad8eed-80d3-41e3-9fee-69993892fc6e', candidateRunId: '8ee9df6d-ffcf-4b9a-9d63-b2e62e9b0a4f', note: '정지한 음원·늦은 decode 재생을 검사합니다. world-audio에서는 실제 AudioContext의 월드별 수명, 지연 초기화, BGM 공유 구독, 일부 해제·종료·재시작과 다른 월드의 재생 유지를 추가로 검증합니다.' },
  R08: { baselineRunId: '7add1a77-2247-43b0-a3ea-9caba9e3fc6c', candidateRunId: '71ab1dc5-9e39-49e9-b64b-c52d0eac2e53', note: '슬롯 세대 소진 후 이전 ID를 재사용하지 않습니다.' },
  R11: { baselineRunId: '1e2f7e61-9fb3-4ccc-a503-ca52bc9ef2a4', candidateRunId: 'b7e75960-f20c-4854-a60b-59ee995a1a04', note: 'ID를 통한 편집과 다른 ID의 재질 보존을 검사합니다.' },
  R24: { baselineRunId: '0276b07a-532c-4f28-9902-413128a092a4', candidateRunId: 'e98bf6ae-6520-458d-95c2-af2593cec74f', note: '실패해도 나머지 플러그인을 해제합니다. R24a 저장 지연은 S5 대기.' },
};

export const requirements: Requirement[] = rows.map(([id, title, stage, scenarioId]) => ({
  id, title, stage, scenarioId,
  implementation: ['R03', 'R04', 'R05', 'R09', 'R20', 'R24', 'R25', 'R26'].includes(id) ? 'working' : evidence[id] || id === 'R14' || id === 'R31' ? 'implemented' : 'pending',
  acceptedRunIds: [],
  ...(evidence[id] ? { evidence: evidence[id] } : {}),
}));
