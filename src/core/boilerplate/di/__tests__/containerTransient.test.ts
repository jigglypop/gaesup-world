import 'reflect-metadata';

import { DIContainer } from '../container';
import { Service } from '../Service';

@Service({ singleton: false })
class TransientService {
  static count = 0;
  constructor() {
    TransientService.count++;
  }
}

@Service({ singleton: true })
class SingletonService {
  static count = 0;
  constructor() {
    SingletonService.count++;
  }
}

describe('DIContainer 트랜지언트/싱글톤 옵션 보존', () => {
  let container: DIContainer;

  beforeEach(() => {
    container = DIContainer.getInstance();
    container.clear();
    TransientService.count = 0;
    SingletonService.count = 0;
  });

  afterEach(() => {
    container.clear();
  });

  test('register(token, factory, false) 로 등록한 서비스는 매 resolve 마다 새 인스턴스를 만든다', () => {
    let createCount = 0;
    container.register('transient-token', () => ({ id: ++createCount }), false);

    const a = container.resolve<{ id: number }>('transient-token');
    const b = container.resolve<{ id: number }>('transient-token');

    expect(a).not.toBe(b);
    expect(createCount).toBe(2);
  });

  test('@Service({ singleton: false }) 데코레이터 클래스는 매 resolve 마다 새 인스턴스를 만든다', () => {
    container.registerService(TransientService);

    container.resolve(TransientService);
    container.resolve(TransientService);
    container.resolve(TransientService);

    expect(TransientService.count).toBe(3);
  });

  test('@Service({ singleton: true }) 클래스는 단일 인스턴스를 재사용한다', () => {
    container.registerService(SingletonService);

    const a = container.resolve(SingletonService);
    const b = container.resolve(SingletonService);

    expect(a).toBe(b);
    expect(SingletonService.count).toBe(1);
  });
});
