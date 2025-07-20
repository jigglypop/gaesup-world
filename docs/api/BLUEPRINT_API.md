# Blueprint Domain API Reference

## 개요

Blueprint Domain은 **데이터 중심 엔티티 시스템, 동적 엔티티 생성, 컴포넌트 기반 아키텍처**를 제공하는 도메인입니다. JSON 기반의 블루프린트로부터 3D 엔티티를 동적으로 생성하고, 다양한 컴포넌트를 조합하여 복잡한 게임 오브젝트를 구성할 수 있습니다.

**경로**: `src/blueprints/`

## 핵심 시스템

### BlueprintLoader

블루프린트 데이터를 로드하고 파싱하는 시스템입니다.

```typescript
class BlueprintLoader {
  static async loadBlueprint(path: string): Promise<BlueprintData>
  static async loadBlueprintFromUrl(url: string): Promise<BlueprintData>
  static validateBlueprint(data: any): BlueprintValidationResult
  
  // 캐싱
  static enableCache(enabled: boolean): void
  static clearCache(): void
  static getCachedBlueprint(path: string): BlueprintData | null
  
  // 배치 로드
  static async loadMultipleBlueprints(paths: string[]): Promise<BlueprintData[]>
  static async preloadBlueprints(paths: string[]): Promise<void>
}
```

### BlueprintFactory

블루프린트로부터 실제 엔티티를 생성하는 팩토리입니다.

```typescript
class BlueprintFactory {
  // 엔티티 생성
  static createEntity(blueprint: BlueprintData, options?: EntityCreationOptions): BlueprintEntity
  static createBatch(blueprints: BlueprintData[], options?: BatchCreationOptions): BlueprintEntity[]
  
  // 컴포넌트 팩토리 등록
  static registerComponentFactory<T extends BaseComponent>(
    type: string, 
    factory: ComponentFactory<T>
  ): void
  
  // 커스텀 엔티티 타입 등록
  static registerEntityType<T extends BlueprintEntity>(
    type: string, 
    constructor: EntityConstructor<T>
  ): void
  
  // 팩토리 조회
  static getComponentFactory(type: string): ComponentFactory<any> | null
  static getEntityType(type: string): EntityConstructor<any> | null
  static getRegisteredTypes(): string[]
}
```

이 API 가이드는 Blueprint Domain의 모든 기능을 상세히 다루며, 데이터 중심의 엔티티 시스템부터 복잡한 컴포넌트 조합까지 완전한 블루프린트 시스템을 구축할 수 있는 레퍼런스를 제공합니다.