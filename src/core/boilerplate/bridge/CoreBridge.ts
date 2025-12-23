import 'reflect-metadata'

import { logger } from '../../utils/logger'
import { IDisposable } from '../types'
import { AbstractBridge } from './AbstractBridge'

const isProduction = process.env['NODE_ENV'] === 'production'
const enableLogs = !isProduction && process.env['VITE_ENABLE_BRIDGE_LOGS'] !== 'false'

export abstract class CoreBridge<
  EngineType extends IDisposable,
  SnapshotType,
  CommandType,
> extends AbstractBridge<EngineType, SnapshotType, CommandType> {
  constructor() {
    super()
    this.processMetrics()
    this.processEventLog()
  }
  private processMetrics(): void {
    const prototype = Object.getPrototypeOf(this)
    const enableMetrics = Reflect.getMetadata('enableMetrics', prototype)
    if (enableMetrics && enableLogs) {
      this.use((event, next) => {
        logger.log(`[Metrics] ${event.type} - ${event.id} at ${new Date(event.timestamp).toISOString()}`)
        next()
      })
    }
  }
  private processEventLog(): void {
    const prototype = Object.getPrototypeOf(this)
    const enableEventLog = Reflect.getMetadata('enableEventLog', prototype)
    if (enableEventLog && enableLogs) {
      this.on('register', (event) => {
        logger.log(`[Event] Registered entity: ${event.id}`)
      })
      this.on('execute', (event) => {
        logger.log(`[Event] Executed command on ${event.id}:`, event.data?.command)
      })
      this.on('unregister', (event) => {
        logger.log(`[Event] Unregistered entity: ${event.id}`)
      })
    }
  }
} 