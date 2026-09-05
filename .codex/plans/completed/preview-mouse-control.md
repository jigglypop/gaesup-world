# 미리보기 마우스 설정 연결

## 목표와 범위
- Camera의 선택적 enableMouse prop과 useCamera의 기본 true 인자로 마우스 이벤트 구독을 제어한다. 기존 호출과 카메라 상태 소유권 유지.
- BlueprintPreview는 마우스 비활성 시 카메라 조작·자체 휠·클릭 이동을 비활성화한다.

## 검증 및 완료 조건
- [x] 카메라 입력 비활성/재활성·정리 테스트, 미리보기 전달 검사.
- [x] 타입·lint·publicApi/packageExports 검사.
- [x] 실제 브라우저 휠·회전·클릭 이동 및 HARNESS 기록.

## 진행
- 실제 개발 서버에서 `node scripts/probe-preview-keyboard.cjs --mouse --camera` 통과. 마우스 off/on/off에서 wheel zoom 변화0/0.1/0, Ctrl+mouse orbit 변화0/약0.1198/0, 바닥 클릭 후500ms 이동0/약1.7097/0 확인. 이전 클릭 이동 완료를 기다린 후 다음 조건을 측정했으므로 진행 중인 이동의 강제 취소를 검증한 것은 아니다. 페이지·콘솔 오류 없음. TEMP/gaesup-preview-mouse.log.
- 자체 검토: 선택적 prop/인자 기본 true로 기존 호출 유지, InputAdapter·카메라 저장 source of truth 유지, 비활성 전환 시 리스너 해제와 남은 회전 modifier/pointer 상태 초기화. script syntax 통과. 전체 현대화·native WebGPU 완료를 뜻하지 않는다.
- Camera(enableMouse)와 useCamera(enableMouse=true)를 연결했다. 휠·회전 리스너 구독을 비활성화하고 남은 회전 입력 상태를 비운다. 미리보기는 이 옵션을 전달하며 자체 휠과 Clicker/GroundClicker도 비활성화한다. 기존 무인자 호출의 동작 유지.
- 카메라 휠 활성/비활성/재활성/unmount, 확대 속도0 보존, preview 전달/휠 무반응 테스트 통과. 초기 관련4 suites36 tests 및 추가 preview11 tests 통과. build/root 타입 검사와 구현lint 통과. 실제 회전·클릭 이동 브라우저 검증은 아직 미실행이다.
