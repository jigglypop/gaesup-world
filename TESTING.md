# Gaesup World 테스트 가이드

이 문서는 Gaesup World 라이브러리의 테스트 환경과 메모리 테스트 방법에 대해 설명합니다.

## 테스트 환경 설정

### 의존성 설치

```bash
yarn install
```

### 테스트 실행

```bash
# 모든 테스트 실행
yarn test

# 테스트 감시 모드
yarn test:watch

# 커버리지 포함 테스트
yarn test:coverage

# 메모리 테스트만 실행
yarn test:memory
```

## 테스트 구조

### 📁 테스트 파일 구조

```
src/
├── __tests__/
│   ├── setup.ts                      # 테스트 환경 설정
│   ├── utils/
│   │   └── memoryTestUtils.ts        # 메모리 테스트 유틸리티
│   ├── components/
│   │   ├── GaesupWorld.test.tsx      # 기본 기능 테스트
│   │   ├── GaesupWorld.memory.test.tsx # 메모리 테스트
│   │   └── Rideable.memory.test.tsx   # Rideable 메모리 테스트
│   └── hooks/
│       └── hooks.memory.test.tsx     # Hooks 메모리 테스트
```

## 메모리 테스트

### 🎯 메모리 테스트 목적

1. **메모리 누수 감지**: 컴포넌트 마운트/언마운트 시 메모리 정리 확인
2. **성능 최적화**: 메모리 사용량 모니터링 및 최적화 포인트 발견
3. **안정성 확보**: 장시간 실행 시 메모리 안정성 검증

### 🔧 메모리 테스트 유틸리티

#### `MemoryMonitor`

실시간으로 메모리 사용량을 모니터링합니다.

```typescript
import { MemoryMonitor } from '../utils/memoryTestUtils';

const monitor = new MemoryMonitor();
monitor.start(100); // 100ms 간격으로 모니터링

// ... 테스트 작업 수행

const result = monitor.getResult(1024 * 1024); // 1MB 누수 임계값
monitor.stop();
```

#### `testComponentMemoryUsage`

컴포넌트의 메모리 사용량을 자동으로 테스트합니다.

```typescript
import { testComponentMemoryUsage } from '../utils/memoryTestUtils';

const result = await testComponentMemoryUsage(
  () => render(<YourComponent />),     // 컴포넌트 렌더링
  (component) => component.unmount(),  // 컴포넌트 언마운트
  5,                                   // 반복 횟수
  512 * 1024                          // 누수 임계값 (512KB)
);
```

### 📊 메모리 테스트 메트릭

- **초기 메모리**: 테스트 시작 시 메모리 사용량
- **최대 메모리**: 테스트 중 최대 메모리 사용량
- **최종 메모리**: 테스트 완료 후 메모리 사용량
- **평균 증가량**: 반복 실행 시 평균 메모리 증가량
- **누수 여부**: 설정된 임계값을 초과하는 메모리 누수 발생 여부

### 🎨 테스트 카테고리

#### 1. 기본 메모리 테스트

```typescript
describe('기본 메모리 사용량 테스트', () => {
  test('GaesupWorld 컴포넌트 단독 마운트/언마운트', async () => {
    // 단일 컴포넌트 메모리 사용량 테스트
  });
});
```

#### 2. 다중 인스턴스 테스트

```typescript
describe('다중 인스턴스 메모리 테스트', () => {
  test('동시 다중 인스턴스 메모리 테스트', async () => {
    // 여러 인스턴스 동시 실행 시 메모리 사용량
  });
});
```

#### 3. 장시간 실행 테스트

```typescript
describe('장시간 실행 시뮬레이션', () => {
  test('연속적인 상태 변경 메모리 테스트', async () => {
    // 실제 사용 환경과 유사한 장시간 테스트
  });
});
```

#### 4. 성능 벤치마크

```typescript
describe('메모리 성능 벤치마크', () => {
  test('초기 로딩 시간 및 메모리 사용량', async () => {
    // 로딩 성능과 메모리 효율성 측정
  });
});
```

## 테스트 실행 결과 해석

### ✅ 성공적인 테스트 결과

```
메모리 테스트 결과:
- 초기 사용량: 10.25MB
- 최대 사용량: 15.80MB
- 최종 사용량: 10.45MB
- 평균 증가량: 0.05MB
- 최대 증가량: 0.50MB
- 총 증가량: 0.20MB
- 메모리 누수 여부: 정상
- 누수 임계값: 1.00MB
```

### ❌ 주의가 필요한 결과

```
메모리 테스트 결과:
- 초기 사용량: 10.25MB
- 최대 사용량: 18.90MB
- 최종 사용량: 12.50MB
- 평균 증가량: 0.25MB
- 최대 증가량: 2.00MB
- 총 증가량: 2.25MB
- 메모리 누수 여부: 감지됨 ⚠️
- 누수 임계값: 1.00MB
```

## 메모리 최적화 가이드

### 🎯 주요 최적화 포인트

1. **Three.js 객체 정리**

   - Geometry, Material, Texture dispose 호출
   - Scene에서 객체 제거 시 적절한 cleanup

2. **React 상태 관리**

   - useEffect cleanup 함수 구현
   - Event listener 제거
   - Timer/Interval 정리

3. **물리 엔진 (Rapier) 최적화**
   - RigidBody, Collider 적절한 해제
   - Physics world 정리

### 🔍 메모리 누수 디버깅

메모리 누수가 발견되면 다음을 확인하세요:

1. **Three.js 객체 정리 여부**

   ```typescript
   // 올바른 정리 방법
   useEffect(() => {
     return () => {
       geometry.dispose();
       material.dispose();
       texture.dispose();
     };
   }, []);
   ```

2. **이벤트 리스너 정리**

   ```typescript
   useEffect(() => {
     const handleResize = () => {
       /* ... */
     };
     window.addEventListener('resize', handleResize);

     return () => {
       window.removeEventListener('resize', handleResize);
     };
   }, []);
   ```

3. **Context 구독 정리**
   ```typescript
   useEffect(() => {
     const unsubscribe = subscribe(callback);
     return unsubscribe;
   }, []);
   ```

## 테스트 환경별 주의사항

### 🖥️ 로컬 개발 환경

- Node.js 메모리 제한: `--max-old-space-size=4096`
- Jest worker 수 제한: `--maxWorkers=2`

### 🔄 CI/CD 환경

- 메모리 제한된 환경에서 테스트 타임아웃 조정
- 병렬 테스트 실행 시 메모리 사용량 고려

### 🌐 브라우저 환경

- WebGL context 제한 고려
- 브라우저별 메모리 관리 차이점 인지

## 문제 해결

### 자주 발생하는 문제들

#### Q: 테스트가 타임아웃되는 경우

A: `jest.config.js`에서 `testTimeout` 값을 증가시키세요.

#### Q: WebGL 관련 에러가 발생하는 경우

A: `setup.ts`의 WebGL mock이 올바르게 설정되어 있는지 확인하세요.

#### Q: 메모리 측정값이 부정확한 경우

A: `forceGarbageCollection()` 호출 후 충분한 대기 시간을 두세요.

## 성능 기준

### 📏 권장 메모리 사용량 기준

| 컴포넌트 타입      | 권장 최대 메모리 사용량 | 누수 임계값 |
| ------------------ | ----------------------- | ----------- |
| GaesupWorld (기본) | 10MB                    | 1MB         |
| Rideable (단일)    | 5MB                     | 2MB         |
| Hook (단일)        | 512KB                   | 256KB       |
| 다중 인스턴스      | 인스턴스당 5MB          | 1MB         |

### ⚡ 성능 목표

- **로딩 시간**: 2초 이내
- **메모리 정리율**: 80% 이상
- **평균 메모리 증가량**: 200KB 이하

---

이 가이드를 참고하여 안정적이고 효율적인 3D 웹 애플리케이션을 개발하세요! 🚀
