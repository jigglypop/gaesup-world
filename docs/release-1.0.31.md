# gaesup-world 1.0.31

## 한국어

기존 `1.0.30`의 다음 버전입니다. 사용자 지정 태그 없이 기본 npm 배포를 사용합니다.

- 미니홈피의 통합 편집 이력, 자동저장, 이전 정상 백업, 충돌 보호, JSON 백업·가져오기와 방 공유를 제공합니다. 공유받는 사람의 기존 다이어리·방명록을 보존합니다.
- Unity 장면 JSON 변환 API, 계층·좌표·회전 교환 스크립트와 GLB 내보내기를 제공합니다. 실제 Unity Editor 컴파일·실행은 아직 검증하지 않았습니다.
- 계층 transform 합성 오류, WebGPU 판별과 fire/bloom 연결, 불필요한 미니룸 렌더링, 누락된 기존 asset과 검증 명령을 수정했습니다.
- 한국어·영어 설치 및 사용 문서를 제공합니다.

업데이트 시 계층 transform은 기존 단순 합산과 결과가 달라질 수 있습니다. shear 또는 singular transform을 TRS로 표현할 수 없으면 `getWorldTransform`이 오류를 내므로 정확한 행렬이 필요할 때는 `getWorldMatrix`를 사용하세요. 계정 저장과 실시간 방문 기능은 아직 미니홈피에 연결되지 않았습니다.

코드는 전체 테스트 2,624개, 별도 메모리 테스트 88개, package consumer와 공개 사이트 Chrome 검사를 통과했습니다. 개인 기록 보존 수정 후 session 테스트 3개와 브라우저 검사도 다시 통과했습니다. 버전·문서 변경 후에는 package consumer를 다시 확인합니다. npm 게시 성공은 registry 조회로 별도 확인합니다.

## English

This is the next release after `1.0.30`. It uses normal npm publication without a custom tag.

- Mini-home history, autosave, previous-save recovery, conflict protection, JSON backup/import and room sharing preserve the recipient's private notes.
- Unity scene JSON APIs, hierarchy/coordinate/quaternion exchange scripts and GLB export are included. Unity Editor compilation and execution remain unverified.
- Hierarchical transform composition, WebGPU detection, fire/bloom integration, unnecessary room draws, missing legacy assets and verification commands have been repaired.
- Installation and usage guides are available in Korean and English.

Hierarchy results may change because the old addition-only composition was incorrect. `getWorldTransform` throws when shear or singular transforms cannot be represented as TRS; use `getWorldMatrix` for exact matrices. Account-backed saves and live visits are not yet connected to the mini-home.

The code passed 2,624 full-suite tests, 88 separate memory tests, package consumer checks and public-site Chrome checks. After the private-note fix, all 3 session tests and the browser probe passed again. Package consumption is checked again after the version/documentation changes. Registry publication is verified separately.
