# 미니홈피 배포 결과 / Mini-home deployment result

검증일 / Verified: 2026-09-19.

## 한국어

[공개 미니홈피](https://jigglypop.github.io/gaesup-world/)와 [엔진 실험실](https://jigglypop.github.io/gaesup-world/engine/)이 HTTP 200으로 응답합니다. [GitHub Pages 작업](https://github.com/jigglypop/gaesup-world/actions/runs/35424049688)이 성공했고, 공개 `version.json`은 `2.0.0-next.0`, 소스 커밋 `52c723500b364a04225d9dd0184ac411210a1da0`, `dirty: false`를 반환했습니다.

공개 주소에서 실제 Chrome probe를 통과했습니다. WebGPU와 WebGL2 fallback, 가구·프로필 편집, 자동/수동 저장, 새로고침 복구, 실행 취소/다시 실행, JSON 백업과 가져오기, 공유받는 사람의 다이어리·방명록 보존, 저장 손상/용량 오류, GLB 내보내기를 확인했습니다. 모바일 가로 넘침과 브라우저 오류가 없었습니다. 정지 상태 700ms 동안 추가 draw 0회, GLB validator 오류 0개였습니다.

npm은 **미배포**입니다. 검증한 tarball 업로드를 두 번 시도했으나 `ERR_SSL_SSL/TLS_ALERT_BAD_RECORD_MAC`으로 실패했고, `npm whoami`도 E401을 반환했습니다. registry에서 `2.0.0-next.0`은 E404입니다. 인증을 복구하고 TLS 전송 문제를 해결한 뒤 검증한 tarball을 `--tag next`로 올려야 합니다. 인증서 검증을 끄거나 `latest`를 변경하지 않았습니다.

소스는 `codex/minihome-unity-preview` 브랜치에 있습니다. 원격 `master`에는 별도의 하네스 변경이 있어 덮어쓰지 않았습니다. [전체 검증 기록](release-2.0.0-next.0.md)과 [실행계획](2026-09-19-web-studio-plan.md)을 참고하세요.

다음 순서와 완료 조건:

1. **npm 프리뷰:** 인증·전송 복구 → 정확한 tarball 업로드 → registry integrity 일치 → 새 소비 앱 설치 확인.
2. **Unity 실제 왕복:** Editor 컴파일 → 계층·회전·크기·ID import/export 비교 → GLB 시각 비교. 현재 TypeScript 변환과 GLB 형식은 검증했지만 Unity Editor 실행은 미검증입니다.
3. **계정이 있는 미니홈피:** 소유자 권한, 서버 저장 revision, 새 기기 복원과 충돌 복구. 현재 글은 브라우저 로컬 데이터이며 실제 원격 방명록이 아닙니다.
4. **실제 방문:** 2인 입장·퇴장·재접속 후 같은 snapshot 복원. 이후 프로젝트 전환, Play/Stop과 범용 Studio를 확장합니다.

## English

The [live mini-home](https://jigglypop.github.io/gaesup-world/) and [engine showcase](https://jigglypop.github.io/gaesup-world/engine/) return HTTP 200. The [Pages workflow](https://github.com/jigglypop/gaesup-world/actions/runs/35424049688) completed successfully. Live `version.json` returned `2.0.0-next.0`, source commit `52c723500b364a04225d9dd0184ac411210a1da0`, and `dirty: false`.

The actual Chrome probe passed against the public URL. It covered both renderers, furniture/profile editing, automatic/manual saves, reload recovery, undo/redo, JSON backup/import, recipient-note preservation, storage corruption/quota failures and GLB export. There were no browser errors or horizontal overflow on mobile. Idle draws over 700 ms: 0. GLB validation errors: 0.

npm remains **unpublished**. Two upload attempts failed with `ERR_SSL_SSL/TLS_ALERT_BAD_RECORD_MAC`; `npm whoami` also returned E401. The registry returned E404 for this version. Restore authentication and TLS transport, then publish the validated tarball with `--tag next`. Certificate verification and the `latest` tag remain unchanged.

Source is on `codex/minihome-unity-preview`. Remote `master` contains separate harness changes and was preserved. See the [verification record](release-2.0.0-next.0.md) and [delivery plan](2026-09-19-web-studio-plan.en.md).

Next acceptance gates:

1. **npm preview:** repair authentication/transport, upload the exact tarball, match registry integrity, and install in a fresh consumer.
2. **Unity round-trip:** compile Editor scripts, compare imported/exported hierarchy, transforms and IDs, then visually compare GLB. TypeScript conversion and GLB validity have passed; Unity Editor execution has not.
3. **Account-backed homes:** enforce ownership, server revisions, fresh-device restore and conflict recovery. Current notes are browser-local, not a remote guestbook.
4. **Live visits:** verify two clients joining, leaving and reconverging after reconnect. Then expand project switching, Play/Stop and the general Studio.
