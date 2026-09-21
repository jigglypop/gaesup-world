# 미니홈피 배포 기록 · 2026-09-22

- 대상: <https://jigglypop.github.io/gaesup-world/>
- 소스: 1.0.32 작업 트리의 미니홈피·잔디·물·날씨 변경을 포함한 `deploy/minihome-20260922` 스냅샷.
- PRD: [제품 요구사항](./PRD-gaesup-world.md), [전체 코드 인벤토리](./PRD-code-inventory.md).
- 배포 방식: npm 발행과 분리된 GitHub Pages source build. 공개 `version.json`의 commit으로 소스를 확인한다.
- 로컬 검증: TypeScript와 production demo build 통과. 전체 Jest 350 suites / 2,978 tests 통과, 1 suite / 1 test skip. 이후 잔디 버퍼 교체 회귀 4 tests 통과.
- 실제 브라우저: WebGPU 및 WebGL2의 높이·계단·저장·undo/redo·확장·날씨·유휴 정지 검사 6개 묶음 통과, GPU/브라우저 오류 0. `.artifacts/minihome/nature-2026-09-21T18-44-12-884Z/evidence.json`.
- 추가 수정: R3F 환경 root가 호스트 canvas 크기를 덮어쓰지 않도록 renderer 크기 소유권을 분리했다. 배포 브라우저 검사는 실제 모바일 canvas 폭도 검증한다.
- GitHub Pages는 정적 호스팅이며 실시간 함께 방문하기에는 별도의 방 서버와 `VITE_MINIROOM_SERVER`가 필요하다.

운영 완료 여부는 `Deploy minihome source snapshot` Actions 결과와 live commit·브라우저 검사로 판정한다. 해당 실행의 `minihome-live-evidence` artifact에 공개 화면과 검증 JSON이 저장된다.
