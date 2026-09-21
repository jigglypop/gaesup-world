export type MinihomeFeature = {
  id: string;
  title: string;
  status: 'connected' | 'partial' | 'pending';
  location: string;
  apis: string[];
  remaining: string;
};

/** Product integration, not API-fixture pass counts. Keep IDs aligned with the PRD. */
export const minihomeFeatures: MinihomeFeature[] = [
  { id: 'MH-02', title: '프로필·기록', status: 'connected', location: '프로필 편집 · 다이어리 · 방명록', apis: ['MinihomeSession'], remaining: '계정 간 동기화는 MH-12에서 추적' },
  { id: 'MH-03', title: '가구 편집·실행 취소', status: 'connected', location: '미니룸 꾸미기 · 실행 취소 · 다시 실행', apis: ['SceneDocumentController.dispatch'], remaining: '대규모 편집·실기기 성능 추가 검증' },
  { id: 'MH-04', title: '배치·경로 탐색', status: 'partial', location: '타일 6종·브러시·가구 배치·경로/목적지 표시', apis: ['NavigationSystem'], remaining: '가구 겹침 정책·벽 편집·물리 collider 통합' },
  { id: 'MH-05', title: '외부 에셋·재질', status: 'partial', location: '절차형 가구 · GLB 아바타', apis: ['GLTFAssetCache', 'AvatarRuntime'], remaining: 'GLB 가구 가져오기·개별 색 편집·에셋 선택기' },
  { id: 'MH-06', title: '아바타·애니메이션', status: 'partial', location: '아바타 선택 · 방향키/바닥 클릭', apis: ['AvatarRuntime.restore', 'AvatarRuntime.playAnimation'], remaining: '장비 개별 편집·물리 controller·실기기 터치 검증' },
  { id: 'MH-07', title: '조명·화질·시점', status: 'partial', location: '시점 7종·직교/원근·카메라 조작·객체 Bloom', apis: ['createRenderer', 'createLegacyRenderer'], remaining: '실제 시간·날씨 도메인 연결' },
  { id: 'MH-08', title: '상호작용·NPC', status: 'pending', location: '통합 예정', apis: ['GameplayEventEngine'], remaining: '앉기·가구 행동·NPC 실제 실행' },
  { id: 'MH-09', title: '배경음·효과음', status: 'partial', location: '미니룸 소리 설정', apis: ['createAudioEngine'], remaining: '가구·발걸음 효과음 연결, 복원/숨김/종료 반복 검증' },
  { id: 'MH-10', title: '저장·백업', status: 'partial', location: '저장 · 백업 내려받기 · 가져오기', apis: ['SceneDocumentController', 'parseSceneDocument'], remaining: '다중 슬롯·SaveSystem 제품 경로 통합' },
  { id: 'MH-11', title: '방 공유', status: 'partial', location: '방 공유 · 내 방으로 가져오기', apis: ['MinihomeSession'], remaining: '서버 저장·방문 권한. 현재는 링크에 담긴 사본' },
  { id: 'MH-12', title: '실시간 방문', status: 'partial', location: '방 코드·실제 방문자·근거리 채팅·주인 편집 동기화', apis: ['Example SSE room service'], remaining: '계정 인증·영속 서버 저장·음성/영상. 현재 방은 서버 메모리에 유지' },
  { id: 'MH-13', title: 'GLB·Unity 교환', status: 'partial', location: '3D 방 내보내기 · Unity 장면 JSON', apis: ['exportUnityScene', 'importUnityScene'], remaining: 'Unity Editor 실검증·웹 UI에서 Unity JSON 가져오기' },
  { id: 'MH-14', title: '기능·성능 진단', status: 'connected', location: 'API·성능 · 성능 실험실', apis: ['readRendererStats'], remaining: '장치·부하·병목 시나리오 계속 확대' },
];
