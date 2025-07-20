import 'reflect-metadata';
import { Blueprint, BlueprintProperty, FromBlueprint } from '../blueprint/BlueprintDecorators';

// Mock blueprint registry
const mockBlueprintRegistry = {
  register: jest.fn(),
  get: jest.fn()
};

jest.doMock('../../../../blueprints/registry', () => ({
  blueprintRegistry: mockBlueprintRegistry
}));

describe('Blueprint Decorators', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBlueprintRegistry.register = jest.fn();
    mockBlueprintRegistry.get = jest.fn();
  });

  describe('@Blueprint', () => {
    test('should register blueprint with full configuration', () => {
      const blueprintData = {
        id: 'test-blueprint',
        name: 'Test Blueprint',
        type: 'character' as const,
        version: '2.0.0',
        tags: ['test', 'example']
      };

      @Blueprint(blueprintData)
      class TestCharacter {
        public name = 'test-character';
      }

      const expectedBlueprint = {
        id: 'test-blueprint',
        name: 'Test Blueprint',
        type: 'character',
        version: '2.0.0',
        tags: ['test', 'example']
      };

      expect(mockBlueprintRegistry.register).toHaveBeenCalledWith(expectedBlueprint);

      // Verify metadata is set
      const metadata = Reflect.getMetadata('blueprint', TestCharacter);
      expect(metadata).toEqual(expectedBlueprint);
    });

    test('should use defaults for missing blueprint properties', () => {
      @Blueprint({ id: 'minimal-blueprint' })
      class MinimalCharacter {
        public value = 42;
      }

      const expectedBlueprint = {
        id: 'minimal-blueprint',
        name: 'MinimalCharacter',
        type: 'character',
        version: '1.0.0',
        tags: []
      };

      expect(mockBlueprintRegistry.register).toHaveBeenCalledWith(expectedBlueprint);
    });

    test('should derive id from class name if not provided', () => {
      @Blueprint({})
      class AutoIdBlueprint {
        public data = 'auto';
      }

      const expectedBlueprint = {
        id: 'autoidblueprint',
        name: 'AutoIdBlueprint',
        type: 'character',
        version: '1.0.0',
        tags: []
      };

      expect(mockBlueprintRegistry.register).toHaveBeenCalledWith(expectedBlueprint);
    });

    test('should handle different blueprint types', () => {
      @Blueprint({ type: 'building' })
      class BuildingBlueprint {
        public structure = 'house';
      }

      @Blueprint({ type: 'item' })
      class ItemBlueprint {
        public weight = 5;
      }

      expect(mockBlueprintRegistry.register).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'building' })
      );
      expect(mockBlueprintRegistry.register).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'item' })
      );
    });

    test('should preserve class functionality', () => {
      @Blueprint({ id: 'functional-blueprint' })
      class FunctionalClass {
        constructor(public value: number) {}

        getValue() {
          return this.value;
        }

        processValue() {
          return this.value * 2;
        }
      }

      const instance = new FunctionalClass(42);
      expect(instance.getValue()).toBe(42);
      expect(instance.processValue()).toBe(84);
      expect(instance.value).toBe(42);
    });

    test('should handle inheritance correctly', () => {
      class BaseClass {
        protected baseValue = 'base';
      }

      @Blueprint({ id: 'inherited-blueprint' })
      class InheritedClass extends BaseClass {
        public derivedValue = 'derived';

        getValues() {
          return `${this.baseValue}-${this.derivedValue}`;
        }
      }

      const instance = new InheritedClass();
      expect(instance.getValues()).toBe('base-derived');
      expect(mockBlueprintRegistry.register).toHaveBeenCalled();
    });

    test('should handle complex blueprint data', () => {
      const complexBlueprint = {
        id: 'complex-blueprint',
        name: 'Complex Blueprint',
        type: 'character' as const,
        version: '3.0.0',
        tags: ['complex', 'advanced', 'test'],
        customProperty: 'custom-value',
        nestedData: {
          stats: { health: 100, mana: 50 },
          equipment: ['sword', 'shield']
        }
      };

      @Blueprint(complexBlueprint)
      class ComplexClass {
        public data = 'complex';
      }

      expect(mockBlueprintRegistry.register).toHaveBeenCalledWith(complexBlueprint);
    });

    test('should handle multiple blueprint registrations', () => {
      @Blueprint({ id: 'blueprint-1', type: 'character' })
      class Blueprint1 {}

      @Blueprint({ id: 'blueprint-2', type: 'building' })
      class Blueprint2 {}

      @Blueprint({ id: 'blueprint-3', type: 'item' })
      class Blueprint3 {}

      expect(mockBlueprintRegistry.register).toHaveBeenCalledTimes(3);
      expect(mockBlueprintRegistry.register).toHaveBeenNthCalledWith(1, 
        expect.objectContaining({ id: 'blueprint-1', type: 'character' })
      );
      expect(mockBlueprintRegistry.register).toHaveBeenNthCalledWith(2, 
        expect.objectContaining({ id: 'blueprint-2', type: 'building' })
      );
      expect(mockBlueprintRegistry.register).toHaveBeenNthCalledWith(3, 
        expect.objectContaining({ id: 'blueprint-3', type: 'item' })
      );
    });
  });

  describe('@BlueprintProperty', () => {
    test('should map property to blueprint path', () => {
      class TestClass {
        @BlueprintProperty('stats.health')
        public health?: number;

        @BlueprintProperty('equipment.weapon')
        public weapon?: string;

        @BlueprintProperty('general.name')
        public displayName?: string;
      }

      const properties = Reflect.getMetadata('blueprintProperties', TestClass.prototype);
      expect(properties).toEqual({
        health: 'stats.health',
        weapon: 'equipment.weapon',
        displayName: 'general.name'
      });
    });

    test('should handle multiple properties on same class', () => {
      class CharacterClass {
        @BlueprintProperty('stats.strength')
        public strength?: number;

        @BlueprintProperty('stats.dexterity')
        public dexterity?: number;

        @BlueprintProperty('stats.intelligence')
        public intelligence?: number;

        @BlueprintProperty('info.level')
        public level?: number;
      }

      const properties = Reflect.getMetadata('blueprintProperties', CharacterClass.prototype);
      expect(properties).toEqual({
        strength: 'stats.strength',
        dexterity: 'stats.dexterity',
        intelligence: 'stats.intelligence',
        level: 'info.level'
      });
    });

    test('should work with inherited classes', () => {
      class BaseClass {
        @BlueprintProperty('base.value')
        public baseValue?: string;
      }

      class DerivedClass extends BaseClass {
        @BlueprintProperty('derived.value')
        public derivedValue?: string;
      }

      const baseProperties = Reflect.getMetadata('blueprintProperties', BaseClass.prototype);
      const derivedProperties = Reflect.getMetadata('blueprintProperties', DerivedClass.prototype);

      expect(baseProperties).toEqual({
        baseValue: 'base.value'
      });
      expect(derivedProperties).toEqual({
        derivedValue: 'derived.value'
      });
    });

    test('should preserve property functionality', () => {
      class TestClass {
        @BlueprintProperty('test.value')
        public testValue: number = 42;

        @BlueprintProperty('test.name')
        public testName: string = 'test';

        getFullInfo() {
          return `${this.testName}: ${this.testValue}`;
        }
      }

      const instance = new TestClass();
      expect(instance.testValue).toBe(42);
      expect(instance.testName).toBe('test');
      expect(instance.getFullInfo()).toBe('test: 42');
    });

    test('should handle complex property paths', () => {
      class ComplexClass {
        @BlueprintProperty('character.stats.combat.melee.damage')
        public meleeDamage?: number;

        @BlueprintProperty('character.equipment.armor.chest.defense')
        public chestDefense?: number;

        @BlueprintProperty('meta.creation.timestamp')
        public createdAt?: number;
      }

      const properties = Reflect.getMetadata('blueprintProperties', ComplexClass.prototype);
      expect(properties).toEqual({
        meleeDamage: 'character.stats.combat.melee.damage',
        chestDefense: 'character.equipment.armor.chest.defense',
        createdAt: 'meta.creation.timestamp'
      });
    });

    test('should handle empty or special character paths', () => {
      class SpecialClass {
        @BlueprintProperty('')
        public empty?: any;

        @BlueprintProperty('with-dash')
        public withDash?: string;

        @BlueprintProperty('with_underscore')
        public withUnderscore?: string;

        @BlueprintProperty('with.dots.and-dashes_and_underscores')
        public complex?: string;
      }

      const properties = Reflect.getMetadata('blueprintProperties', SpecialClass.prototype);
      expect(properties).toEqual({
        empty: '',
        withDash: 'with-dash',
        withUnderscore: 'with_underscore',
        complex: 'with.dots.and-dashes_and_underscores'
      });
    });
  });

  describe('@FromBlueprint', () => {
    test('should link property to blueprint when blueprint exists', () => {
      const mockBlueprint = {
        id: 'test-blueprint',
        name: 'Test Blueprint',
        type: 'character',
        stats: { health: 100 }
      };

      mockBlueprintRegistry.get.mockReturnValue(mockBlueprint);

      class TestClass {
        @FromBlueprint('test-blueprint')
        public blueprint?: any;

        @FromBlueprint('test-blueprint')
        public anotherReference?: any;
      }

      expect(mockBlueprintRegistry.get).toHaveBeenCalledWith('test-blueprint');

      const metadata1 = Reflect.getMetadata('fromBlueprint', TestClass.prototype, 'blueprint');
      const metadata2 = Reflect.getMetadata('fromBlueprint', TestClass.prototype, 'anotherReference');

      expect(metadata1).toBe('test-blueprint');
      expect(metadata2).toBe('test-blueprint');
    });

    test('should handle missing blueprint gracefully', () => {
      mockBlueprintRegistry.get.mockReturnValue(undefined);

      class TestClass {
        @FromBlueprint('missing-blueprint')
        public blueprint?: any;
      }

      expect(mockBlueprintRegistry.get).toHaveBeenCalledWith('missing-blueprint');

      const metadata = Reflect.getMetadata('fromBlueprint', TestClass.prototype, 'blueprint');
      expect(metadata).toBeUndefined();
    });

    test('should work with different blueprint types', () => {
      const characterBlueprint = { id: 'character-1', type: 'character' };
      const buildingBlueprint = { id: 'building-1', type: 'building' };
      const itemBlueprint = { id: 'item-1', type: 'item' };

      mockBlueprintRegistry.get
        .mockReturnValueOnce(characterBlueprint)
        .mockReturnValueOnce(buildingBlueprint)
        .mockReturnValueOnce(itemBlueprint);

      class TestClass {
        @FromBlueprint('character-1')
        public character?: any;

        @FromBlueprint('building-1')
        public building?: any;

        @FromBlueprint('item-1')
        public item?: any;
      }

      expect(mockBlueprintRegistry.get).toHaveBeenCalledTimes(3);
      expect(mockBlueprintRegistry.get).toHaveBeenNthCalledWith(1, 'character-1');
      expect(mockBlueprintRegistry.get).toHaveBeenNthCalledWith(2, 'building-1');
      expect(mockBlueprintRegistry.get).toHaveBeenNthCalledWith(3, 'item-1');
    });

    test('should preserve property functionality', () => {
      const testBlueprint = { id: 'test', value: 42 };
      mockBlueprintRegistry.get.mockReturnValue(testBlueprint);

      class TestClass {
        @FromBlueprint('test')
        public blueprint?: any;

        public normalProperty: string = 'normal';

        getInfo() {
          return `${this.normalProperty}: ${this.blueprint?.value || 'none'}`;
        }
      }

      const instance = new TestClass();
      expect(instance.normalProperty).toBe('normal');
      expect(instance.getInfo()).toBe('normal: none'); // blueprint is not auto-populated
    });

    test('should work with multiple blueprint references', () => {
      const blueprint1 = { id: 'bp1', value: 1 };
      const blueprint2 = { id: 'bp2', value: 2 };

      mockBlueprintRegistry.get
        .mockReturnValueOnce(blueprint1)
        .mockReturnValueOnce(blueprint2)
        .mockReturnValueOnce(blueprint1); // Same blueprint referenced again

      class TestClass {
        @FromBlueprint('bp1')
        public first?: any;

        @FromBlueprint('bp2')
        public second?: any;

        @FromBlueprint('bp1')
        public firstAgain?: any;
      }

      expect(mockBlueprintRegistry.get).toHaveBeenCalledTimes(3);

      const meta1 = Reflect.getMetadata('fromBlueprint', TestClass.prototype, 'first');
      const meta2 = Reflect.getMetadata('fromBlueprint', TestClass.prototype, 'second');
      const meta3 = Reflect.getMetadata('fromBlueprint', TestClass.prototype, 'firstAgain');

      expect(meta1).toBe('bp1');
      expect(meta2).toBe('bp2');
      expect(meta3).toBe('bp1');
    });
  });

  describe('Combined Usage', () => {
    test('should work when all blueprint decorators are used together', () => {
      const testBlueprint = { id: 'source-blueprint', value: 'source' };
      mockBlueprintRegistry.get.mockReturnValue(testBlueprint);

      @Blueprint({ id: 'combined-blueprint', type: 'character' })
      class CombinedClass {
        @BlueprintProperty('stats.health')
        public health?: number;

        @BlueprintProperty('stats.mana')
        public mana?: number;

        @FromBlueprint('source-blueprint')
        public sourceBlueprint?: any;

        @FromBlueprint('source-blueprint')
        public anotherSource?: any;

        public normalProperty: string = 'normal';

        getInfo() {
          return `Health: ${this.health || 0}, Mana: ${this.mana || 0}`;
        }
      }

      // Verify Blueprint decorator
      expect(mockBlueprintRegistry.register).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'combined-blueprint', type: 'character' })
      );

      // Verify BlueprintProperty decorator
      const properties = Reflect.getMetadata('blueprintProperties', CombinedClass.prototype);
      expect(properties).toEqual({
        health: 'stats.health',
        mana: 'stats.mana'
      });

      // Verify FromBlueprint decorator
      expect(mockBlueprintRegistry.get).toHaveBeenCalledWith('source-blueprint');

      const instance = new CombinedClass();
      expect(instance.getInfo()).toBe('Health: 0, Mana: 0');
      expect(instance.normalProperty).toBe('normal');
    });

    test('should handle inheritance with blueprint decorators', () => {
      const sourceBlueprint = { id: 'base-source', value: 'base' };
      mockBlueprintRegistry.get.mockReturnValue(sourceBlueprint);

      @Blueprint({ id: 'base-blueprint', type: 'character' })
      class BaseClass {
        @BlueprintProperty('base.value')
        public baseValue?: string;

        @FromBlueprint('base-source')
        public baseSource?: any;
      }

      @Blueprint({ id: 'derived-blueprint', type: 'character' })
      class DerivedClass extends BaseClass {
        @BlueprintProperty('derived.value')
        public derivedValue?: string;

        @FromBlueprint('base-source')
        public derivedSource?: any;
      }

      expect(mockBlueprintRegistry.register).toHaveBeenCalledTimes(2);
      expect(mockBlueprintRegistry.register).toHaveBeenNthCalledWith(1,
        expect.objectContaining({ id: 'base-blueprint' })
      );
      expect(mockBlueprintRegistry.register).toHaveBeenNthCalledWith(2,
        expect.objectContaining({ id: 'derived-blueprint' })
      );
    });
  });

  describe('Integration Tests', () => {
    test('should work with reflect-metadata operations', () => {
      const testBlueprint = { id: 'meta-test', data: 'metadata' };
      mockBlueprintRegistry.get.mockReturnValue(testBlueprint);

      @Blueprint({ id: 'meta-blueprint' })
      class MetaClass {
        @BlueprintProperty('meta.value')
        public metaValue?: string;

        @FromBlueprint('meta-test')
        public metaSource?: any;
      }

      // Custom metadata operations
      Reflect.defineMetadata('customKey', 'customValue', MetaClass);
      const customMeta = Reflect.getMetadata('customKey', MetaClass);
      expect(customMeta).toBe('customValue');

      // Verify blueprint metadata still works
      const blueprintMeta = Reflect.getMetadata('blueprint', MetaClass);
      expect(blueprintMeta).toEqual(
        expect.objectContaining({ id: 'meta-blueprint' })
      );
    });

    test('should preserve descriptor properties', () => {
      @Blueprint({ id: 'descriptor-test' })
      class DescriptorClass {
        @BlueprintProperty('test.value')
        public testValue?: number;

        testMethod() {
          return 'test';
        }
      }

      const descriptor = Object.getOwnPropertyDescriptor(DescriptorClass.prototype, 'testMethod');
      expect(descriptor).toBeDefined();
      expect(typeof descriptor!.value).toBe('function');
    });
  });

  describe('Performance Tests', () => {
    test('blueprint decorators should not significantly impact performance', () => {
      const mockBlueprint = { id: 'perf-test', value: 1 };
      mockBlueprintRegistry.get.mockReturnValue(mockBlueprint);

      const startTime = performance.now();

      // Create many classes with blueprint decorators
      for (let i = 0; i < 100; i++) {
        @Blueprint({ id: `perf-blueprint-${i}` })
        class PerfClass {
          @BlueprintProperty(`stats.value${i}`)
          public value?: number;

          @FromBlueprint('perf-test')
          public source?: any;
        }

        new PerfClass();
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should complete 100 class creations in reasonable time
      expect(totalTime).toBeLessThan(100);
    });

    test('should handle memory usage efficiently', () => {
      const mockBlueprint = { id: 'memory-test', data: new Array(1000).fill('data') };
      mockBlueprintRegistry.get.mockReturnValue(mockBlueprint);

      const instances: any[] = [];
      const startMemory = process.memoryUsage().heapUsed;

      @Blueprint({ id: 'memory-blueprint' })
      class MemoryClass {
        @BlueprintProperty('memory.data')
        public data?: any[];

        @FromBlueprint('memory-test')
        public source?: any;
      }

      // Create many instances
      for (let i = 0; i < 100; i++) {
        instances.push(new MemoryClass());
      }

      const endMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = endMemory - startMemory;

      // Memory increase should be reasonable
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // Less than 10MB
    });
  });

  describe('Error Handling', () => {
    test('should handle blueprint registry errors gracefully', () => {
      mockBlueprintRegistry.register.mockImplementation(() => {
        throw new Error('Registry error');
      });

      expect(() => {
        @Blueprint({ id: 'error-blueprint' })
        class ErrorClass {}
        new ErrorClass();
      }).toThrow('Registry error');
    });

    test('should handle blueprint retrieval errors gracefully', () => {
      mockBlueprintRegistry.get.mockImplementation(() => {
        throw new Error('Retrieval error');
      });

      expect(() => {
        class TestClass {
          @FromBlueprint('error-blueprint')
          public blueprint?: any;
        }
        new TestClass();
      }).toThrow('Retrieval error');
    });

    test('should handle metadata errors gracefully', () => {
      // Mock Reflect.defineMetadata to throw
      const originalDefineMetadata = Reflect.defineMetadata;
      jest.spyOn(Reflect, 'defineMetadata').mockImplementation(() => {
        throw new Error('Metadata error');
      });

      expect(() => {
        @Blueprint({ id: 'metadata-error' })
        class MetadataErrorClass {}
      }).toThrow('Metadata error');

      // Restore original function
      jest.spyOn(Reflect, 'defineMetadata').mockImplementation(originalDefineMetadata);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty blueprint data', () => {
      expect(() => {
        @Blueprint({} as any)
        class EmptyBlueprintClass {}
        new EmptyBlueprintClass();
      }).not.toThrow();
    });

    test('should handle null/undefined blueprint properties', () => {
      const testBlueprint = null;
      mockBlueprintRegistry.get.mockReturnValue(testBlueprint);

      expect(() => {
        class TestClass {
          @FromBlueprint('null-blueprint')
          public blueprint?: any;
        }
        new TestClass();
      }).not.toThrow();
    });

    test('should handle complex property path edge cases', () => {
      expect(() => {
        class TestClass {
          @BlueprintProperty('...')
          public dots?: any;

          @BlueprintProperty('a.b.c.d.e.f.g.h.i.j')
          public deep?: any;

          @BlueprintProperty('123.456')
          public numbers?: any;
        }
        new TestClass();
      }).not.toThrow();
    });
  });
}); 