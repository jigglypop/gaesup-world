# npm·예제 자동배포

구현 상태: GitHub의 전체 verify job은 통과했다. 첫 release job은 역사적 tag 생성 권한에서 실패해 초기 tag를 별도로 설정한다. npm 신규 발행·라이브 배포 성공은 아직 확인 중이다.

`.github/workflows/release.yml`은 PR에서 `verify:full`·타입 검사·소스 목록을 실행한다. main의 Conventional Commit 변경은 semantic-release로 버전을 결정한다. prepare hook이 package.json에 `gaesupRelease` source/version을 넣고, 발행 이후 registry의 이 값과 tarball SHA-512를 확인한다. gitHead가 제공되면 release tag commit과도 대조한다. 그 tarball의 ESM/CJS·선언·Vite 소비자 검사를 실행하고, 검증된 소비자의 패키지 경로를 Vite alias에 주입해 배포 예제를 빌드한다.

배포 manifest에는 version, sourceCommit, releaseCommit, tag, CI URL, registry integrity, asset hash가 남는다. Pages는 그 빌드 artifact를 배포하고 version.json·세 경로·브라우저 저장/복원을 검사한다. CI 브라우저 검사는 software WebGL2로 명시하며 native GPU 성능 증거와 구분한다.

## 원격 설정

- npm의 `gaesup-world` trusted publisher: GitHub owner `jigglypop`, repository `gaesup-world`, workflow `release.yml`. 직접 `npm publish` 허용이 필요하다.
- GitHub Pages의 빌드 원본은 GitHub Actions로 설정한다. `github-pages` environment와 main 배포 정책을 확인한다.
- main에서 semantic-release의 버전 커밋·tag push가 가능해야 한다. 브랜치 보호가 있으면 해당 정책에 맞춰 설정한다.
- Node 24, npm 11.11.1, semantic-release 25.0.9, npm plugin 13.1.5를 사용한다. 기존 npm plugin 12.0.2는 현재 설치 코드에서 token을 요구하므로 갱신했다.
- OIDC 인증을 우선 사용한다. token 인증이 필요한 기존 환경은 GitHub secret `NPM_TOKEN` 또는 기존 패키지 전용 secret `NPM_GAESUP_WORLD_1_0_31_TOKEN`을 사용한다. 값은 release step에만 전달하며 저장소에 기록하지 않는다. GitHub plugin의 이슈·PR 자동 댓글은 비활성화한다.

## 재실행

최초 실행 전 저장소 관리자가 명시적 `Release gaesup-world 1.0.31` 커밋 `8e1ca1497cd01438ee0b1f72505a53ff6ae1e45f`에 분석 기준 `v1.0.31` tag를 등록한다. 이 커밋에는 과거 workflow 파일이 있어 제한된 `GITHUB_TOKEN`으로 tag를 push하면 거절된다. 기준 tag가 없으면 파이프라인은 package version·조상 관계·registry version을 확인한 뒤 필요한 초기 설정을 안내하고 멈춘다. 이 역사적 분석 기준은 구버전 tarball의 소스 provenance를 증명하는 것이 아니다. 이후 릴리스부터 source metadata와 tag를 검증한다.

Pages 실패는 실패한 deploy job을 다시 실행해 같은 artifact로 복구한다. 전체 workflow를 재실행할 때 `scripts/release/run.mjs`는 같은 소스의 정확한 tag 또는 바로 뒤 버전 커밋의 tag를 확인하고 기존 발행을 재사용한다. 소스와 다른 최신 버전을 임의로 배포하지 않는다. npm이 업로드를 접수한 뒤 패키지를 처리하는 동안에는 registry를 10초 간격으로 최대 90회(약 15분) 확인한다. 확인이 끝나기 전에는 소비자 설치와 Pages 배포를 진행하지 않는다. 시간 초과 시 같은 버전을 다시 게시하지 않고 공개 조회 상태를 확인한 뒤 실패한 job을 재실행한다.

npm 미발행인데 tag만 생긴 실패는 registry 단계에서 중단한다. 해당 tag의 패키지·인증 상태를 조사해 복구해야 하며 성공으로 간주하지 않는다. immutable npm version을 다시 덮어쓰지 않는다. npm의 버전 목록에 `Validating`이 보이면 인증 재시도가 아니라 게시 시점 자동 검사 대기 상태다. 공식 안내는 보통 약 5분, 부하·내용·크기에 따라 15분 이상 걸릴 수 있다고 설명하며 완료 시간을 보장하지 않는다([2026-07-28 npm 안내](https://github.blog/changelog/2026-07-28-npm-publish-time-malware-scanning-and-dual-use-metadata/)).

## 로컬 검증

`GAESUP_CONSUMER_RECEIPT`를 지정해 `scripts/verify-package-consumer.cjs`를 실행하면 검증된 임시 소비자 설치를 보존한다. `GAESUP_PACKAGE_ARCHIVE`로 로컬 또는 registry에서 받은 tarball을 지정할 수 있고 `GAESUP_EXPECTED_INTEGRITY`로 원본 동일성을 검사한다. receipt가 없으면 기존처럼 임시 디렉터리를 정리한다.

`scripts/release/build-demo.mjs --local`은 로컬 tarball 검증용이다. version.json에 `packageSource: local-tarball`을 남기며 프로덕션 live 검사는 이를 거부한다. 일반 실행은 registry 검증을 요구한다.

로컬 tarball 설치본으로 `/gaesup-world/` 예제를 빌드하고 실제 WebGPU 기능·WebGL2 저장/복원을 확인했다. 이 과정에서 앱과 설치 패키지의 Three.js 중복으로 조명이 검게 나오는 회귀를 발견해 Vite `dedupe: three`로 수정했다. `test:minihome:lighting`은 11단계 canvas 캡처·해시·어두운 픽셀 비율을 남겨 이 실패를 검출한다. `game-dev` CLI와 adapter는 현재 저장소에 없어서 기존 Playwright 캡처를 사용했으며, game-dev sealed run으로 표기하지 않는다.

근거: [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/), [semantic-release npm plugin](https://github.com/semantic-release/npm), [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages). 2026-09-21 확인.
