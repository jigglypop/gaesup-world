# Export 관리 현황

현재 저장소에는 export를 자동 생성하는 `scripts/generate-exports.js`가 없습니다.

## 현재 방식

공개 API는 수동 배럴과 Vite library entry, `package.json` exports를 함께 관리합니다.

주요 파일:

- `src/index.ts`: 루트 패키지 `gaesup-world`
- `src/admin-entry.ts`: `gaesup-world/admin`
- `src/blueprints/index.ts`: `gaesup-world/blueprints`
- `src/blueprints/editor.ts`: `gaesup-world/blueprints/editor`
- `src/runtime.ts`: `gaesup-world/runtime`
- `src/editor.ts`: `gaesup-world/editor`
- `src/assets.ts`: `gaesup-world/assets`
- `src/network.ts`: `gaesup-world/network`
- `src/server-contracts.ts`: `gaesup-world/server-contracts`
- `src/postprocessing.ts`: `gaesup-world/postprocessing`
- `package.json`: 배포 subpath exports
- `vite.config.ts`: library build entry

## 실제 스크립트

현재 `package.json`의 export 관련 빌드 스크립트는 타입 빌드 후 CJS 타입 파일을 복사하는 흐름입니다.

```bash
npm run build:types
```

내부적으로는 아래 스크립트를 사용합니다.

```bash
node scripts/copy-cjs-types.cjs
```

## 새 public API를 추가할 때

1. 실제 구현 파일에서 export를 정의합니다.
2. 도메인 배럴 `src/core/<domain>/index.ts`에 필요한 항목을 export합니다.
3. 루트 공개 API라면 `src/index.ts`에 추가합니다.
4. 별도 subpath라면 `src/<entry>.ts`, `vite.config.ts`, `package.json` exports를 함께 추가합니다.
5. 타입 빌드를 실행해 `dist/*.d.ts` 출력이 맞는지 확인합니다.
6. README와 관련 API 문서의 import 예시를 갱신합니다.

## 현재 없는 것

아래 항목은 현재 구현되어 있지 않습니다.

- annotation 기반 export 자동 생성
- `@Injectable`, `@Service`, `@Bridge`, `@Component`, `@Export` 기반 export generator
- `node scripts/generate-exports.js`
- `node scripts/generate-exports.js --watch`
- `node scripts/generate-exports.js --verbose`

필요해지면 별도 도구로 설계해야 하며, 그 전까지는 문서에서 자동 생성 명령을 안내하지 않습니다.
