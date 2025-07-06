import { AbstractBridge } from './AbstractBridge'
import { IDisposable } from '../types'
import { DIContainer } from '../di/container'
import 'reflect-metadata'

const isProduction = process.env['NODE_ENV'] === 'production'
const enableLogs = !isProduction && process.env['VITE_ENABLE_BRIDGE_LOGS'] !== 'false'

export abstract class CoreBridge<
  EngineType extends IDisposable,
  SnapshotType,
  CommandType,
> extends AbstractBridge<EngineType, SnapshotType, CommandType> {
  constructor() {
    super()
    this.processAutowired()
    this.processMetrics()
    this.processEventLog()
  }
  private processAutowired(): void {
    const container = DIContainer.getInstance()
    const prototype = Object.getPrototypeOf(this)
    const fields: string[] = Reflect.getMetadata('autowired', prototype) || []
    const injectedProps = Reflect.getMetadata('inject:properties', prototype) || []
    fields.forEach(field => {
      const fieldType = Reflect.getMetadata('design:type', prototype, field)
      if (fieldType) {
        try {
          ;(this as any)[field] = container.resolve(fieldType)
        } catch {}
      }
    })
    injectedProps.forEach(({ propertyKey, token }: any) => {
      try {
        const resolveToken = token || Reflect.getMetadata('design:type', prototype, propertyKey)
        ;(this as any)[propertyKey] = container.resolve(resolveToken)
      } catch {}
    })
  }
  private processMetrics(): void {
    const prototype = Object.getPrototypeOf(this)
    const enableMetrics = Reflect.getMetadata('enableMetrics', prototype)
    if (enableMetrics && enableLogs) {
      this.use((event, next) => {
        console.log(`[Metrics] ${event.type} - ${event.id} at ${new Date(event.timestamp).toISOString()}`)
        next()
      })
    }
  }
  private processEventLog(): void {
    const prototype = Object.getPrototypeOf(this)
    const enableEventLog = Reflect.getMetadata('enableEventLog', prototype)
    if (enableEventLog && enableLogs) {
      this.on('register', (event) => {
        console.log(`[Event] Registered entity: ${event.id}`)
      })
      this.on('execute', (event) => {
        console.log(`[Event] Executed command on ${event.id}:`, event.data?.command)
      })
      this.on('unregister', (event) => {
        console.log(`[Event] Unregistered entity: ${event.id}`)
      })
    }
  }
} 