// Boilerplate root - shared snippets/helpers will be placed here.
export { 
  AbstractBridge, 
  type IDisposable,
  type BridgeEventType,
  type BridgeEvent,
  type BridgeMiddleware
} from './AbstractBridge';

export { 
  ManagedEntity,
  type ManagedEntityOptions
} from './ManagedEntity';

// Hook exports
export { 
  useBaseLifecycle,
  useDeferredLifecycle,
  useMultipleLifecycles,
  type UseBaseLifecycleOptions
} from './useBaseLifecycle';

export { 
  useBaseFrame,
  useConditionalFrame,
  useThrottledFrame,
  type UseBaseFrameOptions
} from './useBaseFrame';

export { 
  useManagedEntity,
  useManagedEntities,
  type UseManagedEntityOptions
} from './useManagedEntity'; 