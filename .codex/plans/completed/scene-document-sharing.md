# Epoch: 장면 문서 공유 누락 수정

## 목표와 범위

- 기존 `scene-document` 저장 바인딩을 월드 공유 허용 목록에 포함한다. 장면 오브젝트의 source of truth는 기존 SceneDocumentController이며 hydrate는 기존 replace 명령을 사용한다.
- 기존 `scene` 키는 유지한다. 개인 진행 도메인과 명시적 방문 허용 목록은 유지한다. 새 저장 형식이나 네트워크 프로토콜을 도입하지 않는다.
- 리스크: 기본 방문 수락은 등록된 장면 문서도 적용한다. 해당 바인딩이 없거나 예전 스냅샷에 해당 키가 없으면 기존 동작을 유지한다.

## 검증

- 장면 문서 공유 왕복, 콘텐츠·platform·visit 테스트 및 examples 장면 세션 테스트.
- 빌드/전체 타입 검사, 변경 production ESLint, publicApi/packageExports 가드.

## 완료 조건

- [x] 제작한 오브젝트가 콘텐츠 번들과 월드 스냅샷에 포함되고 기본 방문 수락으로 복원된다.
- [x] 이전 scene 키와 개인 데이터 제외 정책을 유지한다.
- [x] 검증 실행·통과 및 HARNESS 기록.

## 결과

- platform/content/visit/examples 및 공개 API 가드 8 suites / 60 tests 통과. build/root 타입 검사, production ESLint 및 변경 diff check 통과.
- 실제 예제 runtime.setup → 제작 명령 → 콘텐츠 번들 흐름과 SceneDocumentController 방문 복원을 검증했다. 자체 검토: 기존 scene 경로 유지, private inventory 제외, 빈 allowedDomains 적용 차단, 수신 문서 참조 독립성 확인.
- 저장 스키마·entry·subpath 변경 없음. WORLD_SNAPSHOT_DOMAINS 및 그 파생 타입에 기존 저장 키 하나를 추가했다. 브라우저/전체 Jest/package consumer는 미실행.
