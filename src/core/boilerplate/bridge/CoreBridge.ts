import { isProductionEnv } from '../../utils/env'
import { logger, type LogValue } from '../../utils/logger'
import { IDisposable } from '../types'
import { AbstractBridge } from './AbstractBridge'

const isProduction = isProductionEnv()
const enableLogs = !isProduction && process.env.VITE_ENABLE_BRIDGE_LOGS !== 'false'

function toBridgeLogValue<ValueType>(value: ValueType | undefined): LogValue {
  if (value === undefined) return undefined
  if (value === null) return null

  const valueType = typeof value
  if (
    valueType === 'object' ||
    valueType === 'string' ||
    valueType === 'number' ||
    valueType === 'boolean' ||
    valueType === 'bigint' ||
    valueType === 'symbol'
  ) {
    return value as LogValue
  }

  return String(value)
}

/** Development logging a bridge opts into; `VITE_ENABLE_BRIDGE_LOGS=false` and production builds turn it off. */
export type CoreBridgeOptions = {
  /** Logs every bridge event. */
  metrics?: boolean
  /** Logs register, execute and unregister. */
  eventLog?: boolean
}

export abstract class CoreBridge<
  EngineType extends IDisposable,
  SnapshotType,
  CommandType,
> extends AbstractBridge<EngineType, SnapshotType, CommandType> {
  constructor(options: CoreBridgeOptions = {}) {
    super()
    if (!enableLogs) return
    if (options.metrics) {
      this.use((event, next) => {
        logger.log(`[Metrics] ${event.type} - ${event.id} at ${new Date(event.timestamp).toISOString()}`)
        next()
      })
    }
    if (options.eventLog) {
      this.on('register', (event) => {
        logger.log(`[Event] Registered entity: ${event.id}`)
      })
      this.on('execute', (event) => {
        logger.log(`[Event] Executed command on ${event.id}:`, toBridgeLogValue(event.data?.command))
      })
      this.on('unregister', (event) => {
        logger.log(`[Event] Unregistered entity: ${event.id}`)
      })
    }
  }
}
