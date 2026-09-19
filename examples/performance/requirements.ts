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
  R25: { baselineRunId: '5ef8b6be-5e40-44a2-9c45-3c139427a093', candidateRunId: '5590b003-54f1-4982-b298-8e8212d90a7f', note: '월드별 상태·입력·오디오·grass·WorldBridge·NPC·상호작용·시네마틱 수명을 연결했습니다. 게임패드 공유 폴링 1회/프레임, 실제 Rapier 절반/최대 입력 속도 약 5/10 world/s입니다. world-restore-observers에서 시간 구독 5→3, 가방 구독 2→1, 복원 중 파생 갱신·종료 후 구독 각각 6→0을 확인합니다. world-restore-races는 이전 월드/바인딩의 지연 복원·적용 중 취소·저장 직후 읽기를 검사합니다. 자동 저장/초기 로드 훅·시네마틱 등 비동기 효과와 복원의 경합, 공통 clock·엔티티/권위 명령 계약, 실제 USB/Bluetooth 장치 검증은 남아 있습니다.' },
  R26: { baselineRunId: '95672125-5c8d-4fdf-879d-87b3fda3217d', candidateRunId: 'ff63e822-fae9-43cf-9bd8-2e4a42b6dc0a', note: '시간 소비자 1·2개와 30/60/144Hz에서 1초당 60 tick을 확인했습니다. 물리·NetworkBridge의 기존 루프 통합은 남아 있습니다.' },
  R10: { baselineRunId: 'f547ff07-9d50-4bef-a665-c861ea5c95da', candidateRunId: 'a79276c4-6e12-4890-9ccf-7cce85958535', note: 'URL 교체 크기·빈 URL·비동기 크기 preload를 실제 GLTF로 확인합니다.' },
  R01: { baselineRunId: '0abd5ef7-ee7c-49ac-bbbf-a8cafc3df0cb', candidateRunId: '0970ec56-1916-4a54-a481-ced05a88f800', note: '훅별 render와 snapshot 경고를 전후 실행에서 비교합니다.' },
  R02: { baselineRunId: '5f788655-3b21-4a8e-ac84-e9f3ebac3713', candidateRunId: 'f435a798-4bb8-40f9-8d06-141e95672f20', note: '적용 실패/취소 시 이미 변경한 도메인을 역순 복원합니다. 도감·날씨·달력·퀘스트·농사 관찰자는 복원을 게임 진행과 구분하며, 실제 IndexedDB 복원 중 파생 갱신은 6→0입니다. 오래된 월드/도메인의 읽기를 무효화하고 같은 슬롯의 선행 쓰기를 기다립니다. 자동 저장 훅·임의 사용자 명령/외부 효과·시네마틱과의 경합 및 일반 월드 최종 통합은 남아 있습니다.' },
  R06: { baselineRunId: 'ea624e54-b1de-40d4-bff4-be6d7a883066', candidateRunId: 'cad96f6f-766e-41a8-9233-a6ecbb64f50c', note: 'Uniform 편집 시 같은 batch를 유지하고 투명 전환 시 원본 경로로 전환합니다.' },
  R07: { baselineRunId: 'e2ad8eed-80d3-41e3-9fee-69993892fc6e', candidateRunId: '8ee9df6d-ffcf-4b9a-9d63-b2e62e9b0a4f', note: '정지한 음원·늦은 decode 재생을 검사합니다. world-audio에서는 실제 AudioContext의 월드별 수명, 지연 초기화, BGM 공유 구독, 일부 해제·종료·재시작과 다른 월드의 재생 유지를 추가로 검증합니다.' },
  R08: { baselineRunId: '7add1a77-2247-43b0-a3ea-9caba9e3fc6c', candidateRunId: '71ab1dc5-9e39-49e9-b64b-c52d0eac2e53', note: '슬롯 세대 소진 후 이전 ID를 재사용하지 않습니다.' },
  R11: { baselineRunId: '1e2f7e61-9fb3-4ccc-a503-ca52bc9ef2a4', candidateRunId: 'b7e75960-f20c-4854-a60b-59ee995a1a04', note: 'ID를 통한 편집과 다른 ID의 재질 보존을 검사합니다.' },
  R24: { baselineRunId: '0276b07a-532c-4f28-9902-413128a092a4', candidateRunId: 'e98bf6ae-6520-458d-95c2-af2593cec74f', note: '실패해도 나머지 플러그인을 해제합니다. R24a 저장 지연은 S5 대기.' },
};

export const requirements: Requirement[] = rows.map(([id, title, stage, scenarioId]) => ({
  id, title, stage, scenarioId,
  implementation: ['R24', 'R25', 'R26'].includes(id) ? 'working' : evidence[id] || id === 'R14' || id === 'R31' ? 'implemented' : 'pending',
  acceptedRunIds: [],
  ...(evidence[id] ? { evidence: evidence[id] } : {}),
}));
