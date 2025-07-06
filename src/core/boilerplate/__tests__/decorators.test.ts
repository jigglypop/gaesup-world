import 'reflect-metadata'
import { DomainBridge, Command, EnableMetrics } from '../decorators'
import { CoreBridge } from '../bridge/CoreBridge'
import { BridgeRegistry } from '../bridge/BridgeRegistry'
import { DIContainer } from '../di/container'
import { IDisposable } from '../types'

class TestEngine implements IDisposable {
  private value = 0
  
  getValue(): number {
    return this.value
  }
  
  setValue(value: number): void {
    this.value = value
  }
  
  dispose(): void {
    this.value = 0
  }
}

type TestSnapshot = {
  value: number
}

type TestCommand = {
  type: 'set' | 'increment'
  value?: number
}

@DomainBridge('test')
@EnableMetrics()
class TestBridge extends CoreBridge<TestEngine, TestSnapshot, TestCommand> {
  protected buildEngine(): TestEngine {
    return new TestEngine()
  }
  
  protected executeCommand(engine: TestEngine, command: TestCommand): void {
    switch (command.type) {
      case 'set':
        if (command.value !== undefined) {
          engine.setValue(command.value)
        }
        break
      case 'increment':
        engine.setValue(engine.getValue() + (command.value || 1))
        break
    }
  }
  
  protected createSnapshot(engine: TestEngine): TestSnapshot {
    return { value: engine.getValue() }
  }
}

describe('데코레이터 기반 브릿지 시스템', () => {
  beforeEach(() => {
    DIContainer.getInstance().clear()
  })

  it('브릿지가 레지스트리에 등록되어야 함', () => {
    const domains = BridgeRegistry.list()
    expect(domains).toContain('test')
  })
  
  it('브릿지 인스턴스를 생성하고 사용할 수 있어야 함', () => {
    const bridge = new TestBridge()
    
    bridge.register('entity1')
    bridge.execute('entity1', { type: 'set', value: 42 })
    
    const snapshot = bridge.snapshot('entity1')
    expect(snapshot?.value).toBe(42)
    
    bridge.dispose()
  })
  
  it('@EnableMetrics 데코레이터가 메트릭을 활성화해야 함', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
    
    const bridge = new TestBridge()
    bridge.register('entity1')
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[Metrics] register')
    )
    
    consoleSpy.mockRestore()
    bridge.dispose()
  })
  

  
  it('의존성 주입이 작동해야 함', () => {
    class TestService {
      getData(): string {
        return 'test data'
      }
    }
    
    const container = DIContainer.getInstance()
    container.registerClass(TestService)
    
    const service = container.resolve(TestService)
    expect(service.getData()).toBe('test data')
  })
}) 