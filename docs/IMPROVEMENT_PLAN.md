# Gaesup World 개선 계획서

## 개요
이 문서는 Gaesup World 프로젝트의 코드 분석 결과를 바탕으로 작성된 상세 개선 계획서입니다.
우선순위에 따라 단계별로 구현할 항목들을 정리하였으며, 각 항목별 구체적인 작업 내용과 예상 일정을 포함합니다.

## 우선순위 분류 기준
- **P0 (Critical)**: 보안 및 치명적 버그 - 즉시 수정 필요
- **P1 (High)**: 주요 기능 개선 - 1-2주 내 완료
- **P2 (Medium)**: 구조 개선 및 최적화 - 1개월 내 완료
- **P3 (Low)**: 장기 개선 사항 - 3개월 내 완료

---

## Phase 1: 긴급 개선 사항 (P0 - 1주 이내)

### 1.1 인증 시스템 보안 개선
**문제점**: 클라이언트에 하드코딩된 인증 정보 ('admin'/'password')

**작업 내용**:
```typescript
// 1. 환경 변수로 데모 자격증명 분리
// .env.example
VITE_DEMO_USERNAME=demo
VITE_DEMO_PASSWORD=demo123
VITE_API_URL=http://localhost:3000

// 2. authStore.ts 수정
const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

login: async (username, password) => {
  set({ loading: true });
  try {
    // 데모 모드일 때만 로컬 검증
    if (isDemoMode) {
      const demoUser = import.meta.env.VITE_DEMO_USERNAME;
      const demoPass = import.meta.env.VITE_DEMO_PASSWORD;
      if (username === demoUser && password === demoPass) {
        set({ 
          isLoggedIn: true, 
          user: { username, roles: ['demo'] }, 
          loading: false 
        });
        return true;
      }
    }
    
    // 실제 API 호출
    const response = await loginApi(username, password);
    if (response.success) {
      localStorage.setItem('auth_token', response.token);
      set({ 
        isLoggedIn: true, 
        user: response.user,
        loading: false 
      });
      return true;
    }
    
    set({ loading: false });
    return false;
  } catch (error) {
    set({ loading: false });
    return false;
  }
}

// 3. 로그아웃 시 토큰 정리
logout: () => {
  localStorage.removeItem('auth_token');
  set({ isLoggedIn: false, user: null });
}
```

**체크리스트**:
- [ ] 환경 변수 설정 파일 생성
- [ ] authStore 리팩토링
- [ ] API 연동 코드 구현
- [ ] 토큰 관리 로직 추가
- [ ] 권한(Role) 체크 로직 수정

### 1.2 프로덕션 코드 정리
**문제점**: console.log 등 디버그 코드 잔존

**작업 내용**:
```typescript
// 1. 전역 로거 유틸리티 생성
// src/core/utils/logger.ts
export class Logger {
  private static isDevelopment = import.meta.env.DEV;
  
  static log(...args: any[]) {
    if (this.isDevelopment) {
      console.log('[Gaesup]', ...args);
    }
  }
  
  static warn(...args: any[]) {
    if (this.isDevelopment) {
      console.warn('[Gaesup]', ...args);
    }
  }
  
  static error(...args: any[]) {
    // 에러는 프로덕션에서도 출력
    console.error('[Gaesup]', ...args);
  }
}

// 2. ESLint 규칙 추가
{
  "rules": {
    "no-console": ["error", { "allow": ["error"] }]
  }
}

// 3. 빌드 시 console 제거 플러그인 설정
// vite.config.ts
import removeConsole from 'vite-plugin-remove-console';

export default {
  plugins: [
    removeConsole({ includes: ['log', 'warn'] })
  ]
}
```

**체크리스트**:
- [ ] Logger 유틸리티 구현
- [ ] 모든 console.log를 Logger로 교체
- [ ] ESLint 규칙 업데이트
- [ ] Vite 빌드 설정 수정

### 1.3 Peer Dependencies 정리
**문제점**: 실제 사용 버전과 peerDependencies 불일치

**작업 내용**:
```json
// package.json 수정
{
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "three": "^0.160.0",
    "@react-three/fiber": "^9.0.0",
    "@react-three/drei": "^9.88.0",
    "@react-three/rapier": "^1.2.1"
  }
}
```

**체크리스트**:
- [ ] 현재 사용 중인 실제 버전 확인
- [ ] peerDependencies 업데이트
- [ ] 호환성 테스트
- [ ] README에 최소 요구 버전 명시

---

## Phase 2: 주요 기능 개선 (P1 - 2주)

### 2.1 Core 레이어 의존성 정리
**문제점**: Core 레이어에서 상위 레이어(Store) 직접 참조

**작업 내용**:
```typescript
// 1. 이벤트 기반 아키텍처로 전환
// src/core/motions/core/PhysicsEngine.ts
export interface PhysicsEngineEvents {
  onStateChange: (changes: Partial<GameStatesType>) => void;
  onJumpEnd: () => void;
  onGroundHit: () => void;
}

export class PhysicsEngine {
  private events?: PhysicsEngineEvents;
  
  constructor(config?: PhysicsConfig, events?: PhysicsEngineEvents) {
    this.config = config;
    this.events = events;
  }
  
  calculate(calcProp: PhysicsCalcProps): PhysicsResult {
    // 계산 수행
    const result = this.performCalculations(calcProp);
    
    // 상태 변경을 이벤트로 알림
    if (result.stateChanges && this.events?.onStateChange) {
      this.events.onStateChange(result.stateChanges);
    }
    
    return result;
  }
}

// 2. Hook에서 이벤트 처리
// src/core/motions/hooks/usePhysicsEngine.ts
export function usePhysicsEngine() {
  const setStates = useGaesupStore(state => state.setStates);
  
  const engineRef = useRef<PhysicsEngine>();
  
  useEffect(() => {
    engineRef.current = new PhysicsEngine(config, {
      onStateChange: (changes) => {
        setStates(changes);
      },
      onJumpEnd: () => {
        setStates({ isJumping: false });
      }
    });
  }, []);
  
  return engineRef.current;
}
```

**체크리스트**:
- [ ] PhysicsEngine 이벤트 인터페이스 정의
- [ ] StateEngine 의존성 제거
- [ ] Hook 레이어에서 이벤트 바인딩
- [ ] 기존 테스트 케이스 통과 확인

### 2.2 설정값 중앙 관리
**문제점**: 기본 설정값이 코드 곳곳에 분산

**작업 내용**:
```typescript
// src/core/config/defaults.ts
export const DEFAULT_CONFIG = {
  physics: {
    character: {
      linearDamping: 0.2,
      airDamping: 0.1,
      stopDamping: 2,
      jumpSpeed: 15,
      walkSpeed: 10,
      runSpeed: 20,
    },
    vehicle: {
      linearDamping: 0.9,
      brakeRatio: 5,
      maxSpeed: 25,
      acceleration: 20,
    },
    airplane: {
      linearDamping: 0.8,
      maxSpeed: 60,
      acceleration: 40,
      buoyancy: 1.0,
    }
  },
  camera: {
    fov: 75,
    near: 0.1,
    far: 1000,
    defaultDistance: 5,
  },
  world: {
    gridSize: 10,
    maxObjects: 10000,
    logLimit: 1000,
  }
} as const;

// 사용 예시
import { DEFAULT_CONFIG } from '@/core/config/defaults';

class PhysicsEngine {
  constructor(config?: Partial<PhysicsConfig>) {
    this.config = deepMerge(DEFAULT_CONFIG.physics, config);
  }
}
```

**체크리스트**:
- [ ] 중앙 설정 파일 생성
- [ ] 기존 하드코딩 값 추출
- [ ] deepMerge 유틸리티 구현
- [ ] 타입 안정성 확보

### 2.3 테스트 커버리지 확대
**문제점**: UI 컴포넌트 테스트 부족

**작업 내용**:
```typescript
// src/admin/pages/__tests__/LoginPage.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginPage } from '../LoginPage';
import { useAuthStore } from '../../store/authStore';

jest.mock('../../store/authStore');

describe('LoginPage', () => {
  it('로그인 폼을 렌더링해야 함', () => {
    render(<LoginPage />);
    
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });
  
  it('유효한 자격증명으로 로그인할 수 있어야 함', async () => {
    const mockLogin = jest.fn().mockResolvedValue(true);
    (useAuthStore as jest.Mock).mockReturnValue({
      login: mockLogin,
      loading: false
    });
    
    render(<LoginPage />);
    
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'testpass' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('testuser', 'testpass');
    });
  });
});

// E2E 테스트 추가
// e2e/admin.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Admin Panel', () => {
  test('관리자 로그인 플로우', async ({ page }) => {
    await page.goto('/admin/login');
    
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/admin/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });
});
```

**체크리스트**:
- [ ] React Testing Library 설정
- [ ] 주요 컴포넌트 단위 테스트 작성
- [ ] Playwright E2E 테스트 환경 구축
- [ ] CI/CD 파이프라인에 테스트 통합

---

## Phase 3: 구조 개선 (P2 - 1개월)

### 3.1 의존성 주입(DI) 패턴 도입
**개선점**: 싱글톤 패턴을 DI로 전환하여 테스트 용이성 향상

**작업 내용**:
```typescript
// src/core/di/container.ts
export class DIContainer {
  private services = new Map<string, any>();
  private factories = new Map<string, () => any>();
  
  register<T>(name: string, factory: () => T): void {
    this.factories.set(name, factory);
  }
  
  get<T>(name: string): T {
    if (!this.services.has(name)) {
      const factory = this.factories.get(name);
      if (!factory) {
        throw new Error(`Service ${name} not registered`);
      }
      this.services.set(name, factory());
    }
    return this.services.get(name);
  }
}

// src/core/di/setup.ts
export function setupDI() {
  const container = new DIContainer();
  
  container.register('StateEngine', () => new StateEngine());
  container.register('PhysicsEngine', () => new PhysicsEngine(
    container.get('StateEngine')
  ));
  container.register('InteractionEngine', () => new InteractionEngine());
  
  return container;
}

// 사용 예시
const container = setupDI();
const physicsEngine = container.get<PhysicsEngine>('PhysicsEngine');
```

**체크리스트**:
- [ ] DI Container 구현
- [ ] 서비스 등록 로직 작성
- [ ] 싱글톤 패턴 제거
- [ ] 테스트에서 모킹 적용

### 3.2 컴포넌트 구조 최적화
**개선점**: 중복 컴포넌트 통합 및 계층 단순화

**작업 내용**:
```typescript
// 현재: GaesupWorldContent와 WorldContainer 분리
// 개선: 통합된 WorldProvider 컴포넌트
export function WorldProvider({ children, config }: WorldProviderProps) {
  // Zustand 초기화
  useGaesupStore.setState({ config });
  
  return (
    <Canvas>
      <Camera config={config.camera} />
      <Physics>
        <WorldContent config={config}>
          {children}
        </WorldContent>
      </Physics>
      {config.debug && (
        <>
          <gridHelper />
          <axesHelper />
        </>
      )}
    </Canvas>
  );
}
```

**체크리스트**:
- [ ] 컴포넌트 계층 분석
- [ ] 중복 제거 및 통합
- [ ] Props 인터페이스 정리
- [ ] 마이그레이션 가이드 작성

### 3.3 성능 모니터링 도입
**개선점**: 런타임 성능 추적 및 최적화

**작업 내용**:
```typescript
// src/core/performance/monitor.ts
export class PerformanceMonitor {
  private metrics = new Map<string, PerformanceMetric>();
  
  startMeasure(name: string): void {
    performance.mark(`${name}-start`);
  }
  
  endMeasure(name: string): void {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    const measure = performance.getEntriesByName(name)[0];
    this.updateMetric(name, measure.duration);
  }
  
  private updateMetric(name: string, duration: number): void {
    const metric = this.metrics.get(name) || {
      count: 0,
      total: 0,
      average: 0,
      min: Infinity,
      max: 0
    };
    
    metric.count++;
    metric.total += duration;
    metric.average = metric.total / metric.count;
    metric.min = Math.min(metric.min, duration);
    metric.max = Math.max(metric.max, duration);
    
    this.metrics.set(name, metric);
  }
  
  getReport(): PerformanceReport {
    return {
      metrics: Array.from(this.metrics.entries()),
      timestamp: Date.now()
    };
  }
}

// 사용 예시
const monitor = new PerformanceMonitor();

// PhysicsEngine에서
calculate(props: PhysicsCalcProps): void {
  monitor.startMeasure('physics-calculate');
  // ... 계산 로직
  monitor.endMeasure('physics-calculate');
}
```

**체크리스트**:
- [ ] Performance Monitor 클래스 구현
- [ ] 주요 연산에 측정 코드 추가
- [ ] 성능 리포트 UI 구현
- [ ] 성능 임계값 알림 설정

---

## Phase 4: 장기 개선 사항 (P3 - 3개월)

### 4.1 멀티플레이어 기반 구축
**목표**: 서버 동기화 및 네트워크 통신 기반 마련

**작업 내용**:
```typescript
// src/core/network/NetworkManager.ts
export class NetworkManager {
  private ws: WebSocket;
  private entities = new Map<string, NetworkedEntity>();
  
  connect(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(url);
      this.ws.onopen = () => resolve();
      this.ws.onerror = reject;
      this.ws.onmessage = this.handleMessage.bind(this);
    });
  }
  
  private handleMessage(event: MessageEvent): void {
    const data = JSON.parse(event.data);
    
    switch (data.type) {
      case 'entity-update':
        this.updateEntity(data.entityId, data.state);
        break;
      case 'entity-spawn':
        this.spawnEntity(data);
        break;
      case 'entity-destroy':
        this.destroyEntity(data.entityId);
        break;
    }
  }
  
  sendUpdate(entityId: string, state: EntityState): void {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'entity-update',
        entityId,
        state,
        timestamp: Date.now()
      }));
    }
  }
}

// 서버 측 구현 예시 (Node.js)
// server/GameServer.ts
export class GameServer {
  private clients = new Map<string, Client>();
  private world = new ServerWorld();
  
  handleConnection(ws: WebSocket, clientId: string): void {
    const client = new Client(clientId, ws);
    this.clients.set(clientId, client);
    
    // 초기 월드 상태 전송
    client.send({
      type: 'world-sync',
      entities: this.world.getEntities()
    });
    
    ws.on('message', (data) => {
      const message = JSON.parse(data);
      this.handleClientMessage(client, message);
    });
  }
  
  private handleClientMessage(client: Client, message: any): void {
    // 권한 검증
    if (!this.validateAction(client, message)) {
      return;
    }
    
    // 상태 업데이트
    this.world.updateEntity(message.entityId, message.state);
    
    // 다른 클라이언트에게 브로드캐스트
    this.broadcast(message, client.id);
  }
}
```

**체크리스트**:
- [ ] WebSocket 클라이언트 구현
- [ ] 상태 동기화 프로토콜 설계
- [ ] 서버 권한 검증 시스템
- [ ] 네트워크 예측 및 보정
- [ ] 지연 시간 보상 알고리즘

### 4.2 플러그인 시스템 구현
**목표**: 확장 가능한 플러그인 아키텍처

**작업 내용**:
```typescript
// src/core/plugins/PluginSystem.ts
export interface Plugin {
  name: string;
  version: string;
  dependencies?: string[];
  
  onLoad(context: PluginContext): void;
  onUnload(): void;
}

export class PluginManager {
  private plugins = new Map<string, Plugin>();
  private context: PluginContext;
  
  constructor(world: World) {
    this.context = new PluginContext(world);
  }
  
  async loadPlugin(url: string): Promise<void> {
    const module = await import(url);
    const plugin: Plugin = module.default;
    
    // 의존성 확인
    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        if (!this.plugins.has(dep)) {
          throw new Error(`Missing dependency: ${dep}`);
        }
      }
    }
    
    // 플러그인 로드
    plugin.onLoad(this.context);
    this.plugins.set(plugin.name, plugin);
  }
}

// 플러그인 예시
// plugins/weather-system/index.ts
export default {
  name: 'weather-system',
  version: '1.0.0',
  dependencies: ['particle-system'],
  
  onLoad(context: PluginContext) {
    const weatherSystem = new WeatherSystem();
    context.world.addSystem(weatherSystem);
    
    // UI 등록
    context.ui.registerPanel({
      id: 'weather-control',
      title: 'Weather Control',
      component: WeatherControlPanel
    });
  },
  
  onUnload() {
    // 정리 작업
  }
} as Plugin;
```

**체크리스트**:
- [ ] 플러그인 인터페이스 정의
- [ ] 플러그인 로더 구현
- [ ] 샌드박스 환경 구축
- [ ] 플러그인 마켓플레이스 기반
- [ ] 문서 및 예제 작성

### 4.3 고급 에디터 기능
**목표**: Blueprint 시스템 및 비주얼 스크립팅

**작업 내용**: (이미 작성된 MOTION_FUTURE_GOALS.md 참조)

---

## 실행 계획 및 일정

### 1주차: Phase 1 완료
- 월요일-화요일: 인증 시스템 개선
- 수요일-목요일: 프로덕션 코드 정리
- 금요일: Peer Dependencies 정리 및 테스트

### 2-3주차: Phase 2 진행
- Core 레이어 의존성 정리 (3일)
- 설정값 중앙 관리 (2일)
- 테스트 커버리지 확대 (5일)

### 4-8주차: Phase 3 진행
- DI 패턴 도입 (1주)
- 컴포넌트 구조 최적화 (1주)
- 성능 모니터링 도입 (2주)

### 3개월차: Phase 4 시작
- 멀티플레이어 기반 구축
- 플러그인 시스템 설계
- 고급 에디터 기능 프로토타입

## 성공 지표

### 단기 (1개월)
- [ ] 보안 취약점 제거 완료
- [ ] 테스트 커버리지 80% 이상
- [ ] 성능 모니터링 대시보드 구축
- [ ] 모든 P0, P1 이슈 해결

### 중기 (3개월)
- [ ] 플러그인 시스템 베타 출시
- [ ] 멀티플레이어 프로토타입 완성
- [ ] 문서화 100% 완료
- [ ] 커뮤니티 피드백 수집 시작

### 장기 (6개월)
- [ ] 정식 1.0 버전 출시
- [ ] 상용 프로젝트 3개 이상 적용
- [ ] 플러그인 생태계 구축
- [ ] 엔터프라이즈 지원 시작

## 리스크 관리

### 기술적 리스크
1. **Breaking Changes**: 
   - 마이그레이션 가이드 제공
   - Deprecation 경고 단계적 적용
   - 호환성 레이어 유지

2. **성능 저하**:
   - 각 변경사항 벤치마크
   - 성능 회귀 테스트 자동화
   - 최적화 가이드라인 수립

### 조직적 리스크
1. **리소스 부족**:
   - 우선순위 재조정 가능
   - 커뮤니티 기여 활성화
   - 단계적 출시 전략

2. **기술 부채 증가**:
   - 리팩토링 스프린트 정기 운영
   - 코드 리뷰 프로세스 강화
   - 자동화 도구 도입

## 결론

이 계획서는 Gaesup World를 상용 수준의 3D 웹 프레임워크로 발전시키기 위한 로드맵입니다.
단계별 접근을 통해 안정성을 유지하면서도 혁신적인 기능들을 추가할 수 있을 것으로 기대합니다.

정기적인 진행 상황 점검과 커뮤니티 피드백을 통해 계획을 조정하며 실행해 나가겠습니다. 