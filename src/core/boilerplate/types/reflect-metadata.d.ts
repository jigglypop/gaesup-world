/// <reference types="reflect-metadata" />

declare global {
  namespace Reflect {
    function defineMetadata(metadataKey: string | symbol, metadataValue: unknown, target: unknown): void
    function defineMetadata(metadataKey: string | symbol, metadataValue: unknown, target: unknown, propertyKey: string | symbol): void
    function getMetadata(metadataKey: string | symbol, target: unknown): unknown
    function getMetadata(metadataKey: string | symbol, target: unknown, propertyKey: string | symbol): unknown
  }
}

interface Performance {
  memory: {
    totalJSHeapSize: number;
    usedJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
} 