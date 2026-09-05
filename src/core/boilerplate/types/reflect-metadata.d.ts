/// <reference types="reflect-metadata" />

type ReflectMetadataValue =
  | object
  | string
  | number
  | boolean
  | bigint
  | symbol
  | null
  | undefined;

declare global {
  namespace Reflect {
    function defineMetadata(metadataKey: string | symbol, metadataValue: ReflectMetadataValue, target: ReflectMetadataValue): void
    function defineMetadata(metadataKey: string | symbol, metadataValue: ReflectMetadataValue, target: ReflectMetadataValue, propertyKey: string | symbol): void
    function getMetadata(metadataKey: string | symbol, target: ReflectMetadataValue): ReflectMetadataValue
    function getMetadata(metadataKey: string | symbol, target: ReflectMetadataValue, propertyKey: string | symbol): ReflectMetadataValue
  }
}

interface Performance {
  memory: {
    totalJSHeapSize: number;
    usedJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
} 
