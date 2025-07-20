import * as THREE from 'three';
import { MaterialManager } from '../MaterialManager';
import { MeshConfig } from '../../types';

// THREE.js 텍스처 로더 모킹
jest.mock('three', () => {
  const originalThree = jest.requireActual('three');
  
  const mockTexture = {
    wrapS: null,
    wrapT: null,
    needsUpdate: false,
    dispose: jest.fn()
  };

  const mockTextureLoader = {
    load: jest.fn(() => mockTexture)
  };

  const mockMaterial = {
    color: { set: jest.fn() },
    roughness: 0.5,
    metalness: 0,
    opacity: 1,
    needsUpdate: false,
    dispose: jest.fn()
  };

  return {
    ...originalThree,
    TextureLoader: jest.fn(() => mockTextureLoader),
    MeshStandardMaterial: jest.fn(() => mockMaterial),
    MeshPhysicalMaterial: jest.fn(() => mockMaterial),
    RepeatWrapping: 'RepeatWrapping'
  };
});

describe('MaterialManager 테스트', () => {
  let materialManager: MaterialManager;
  let mockTextureLoader: any;
  let mockMaterial: any;

  beforeEach(() => {
    jest.clearAllMocks();
    materialManager = new MaterialManager();
    
    // 모킹된 객체들 참조
    mockTextureLoader = (THREE.TextureLoader as jest.Mock).mock.results[0].value;
    mockMaterial = (THREE.MeshStandardMaterial as jest.Mock).mock.results[0].value;
  });

  afterEach(() => {
    materialManager.dispose();
  });

  describe('생성자', () => {
    test('MaterialManager가 올바르게 초기화되어야 함', () => {
      expect(materialManager).toBeInstanceOf(MaterialManager);
      expect(THREE.TextureLoader).toHaveBeenCalledTimes(1);
    });
  });

  describe('기본 재질 생성', () => {
    test('기본 MeshStandardMaterial이 생성되어야 함', () => {
      const meshConfig: MeshConfig = {
        id: 'test-material',
        color: '#FF0000',
        roughness: 0.8,
        metalness: 0.2
      };

      const material = materialManager.getMaterial(meshConfig);

      expect(THREE.MeshStandardMaterial).toHaveBeenCalledWith({
        color: '#FF0000',
        roughness: 0.8,
        metalness: 0.2,
        opacity: 1,
        transparent: false
      });
      expect(material).toBeDefined();
    });

    test('기본값이 올바르게 적용되어야 함', () => {
      const meshConfig: MeshConfig = {
        id: 'default-material'
      };

      materialManager.getMaterial(meshConfig);

      expect(THREE.MeshStandardMaterial).toHaveBeenCalledWith({
        color: '#ffffff',
        roughness: 0.5,
        metalness: 0,
        opacity: 1,
        transparent: false
      });
    });

    test('투명도 설정이 올바르게 적용되어야 함', () => {
      const meshConfig: MeshConfig = {
        id: 'transparent-material',
        opacity: 0.7,
        transparent: true
      };

      materialManager.getMaterial(meshConfig);

      expect(THREE.MeshStandardMaterial).toHaveBeenCalledWith({
        color: '#ffffff',
        roughness: 0.5,
        metalness: 0,
        opacity: 0.7,
        transparent: true
      });
    });
  });

  describe('GLASS 재질 생성', () => {
    test('GLASS 타입일 때 MeshPhysicalMaterial이 생성되어야 함', () => {
      const meshConfig: MeshConfig = {
        id: 'glass-material',
        material: 'GLASS',
        color: '#87CEEB'
      };

      materialManager.getMaterial(meshConfig);

      expect(THREE.MeshPhysicalMaterial).toHaveBeenCalledWith({
        color: '#87CEEB',
        roughness: 0.1,
        metalness: 0,
        opacity: 1,
        transparent: false,
        transmission: 0.98,
        envMapIntensity: 1
      });
    });

    test('GLASS 재질의 특별한 속성이 올바르게 설정되어야 함', () => {
      const meshConfig: MeshConfig = {
        id: 'glass-material',
        material: 'GLASS',
        opacity: 0.3,
        transparent: true
      };

      materialManager.getMaterial(meshConfig);

      expect(THREE.MeshPhysicalMaterial).toHaveBeenCalledWith(
        expect.objectContaining({
          transmission: 0.98,
          roughness: 0.1,
          envMapIntensity: 1,
          opacity: 0.3,
          transparent: true
        })
      );
    });
  });

  describe('텍스처 로딩', () => {
    test('map 텍스처가 올바르게 로드되어야 함', () => {
      const meshConfig: MeshConfig = {
        id: 'textured-material',
        mapTextureUrl: 'https://example.com/texture.jpg'
      };

      materialManager.getMaterial(meshConfig);

      expect(mockTextureLoader.load).toHaveBeenCalledWith('https://example.com/texture.jpg');
      expect(THREE.MeshStandardMaterial).toHaveBeenCalledWith(
        expect.objectContaining({
          map: expect.any(Object)
        })
      );
    });

    test('normal 텍스처가 올바르게 로드되어야 함', () => {
      const meshConfig: MeshConfig = {
        id: 'normal-material',
        normalTextureUrl: 'https://example.com/normal.jpg'
      };

      materialManager.getMaterial(meshConfig);

      expect(mockTextureLoader.load).toHaveBeenCalledWith('https://example.com/normal.jpg');
      expect(THREE.MeshStandardMaterial).toHaveBeenCalledWith(
        expect.objectContaining({
          normalMap: expect.any(Object)
        })
      );
    });

    test('맵과 노멀 텍스처가 동시에 로드되어야 함', () => {
      const meshConfig: MeshConfig = {
        id: 'full-textured-material',
        mapTextureUrl: 'https://example.com/texture.jpg',
        normalTextureUrl: 'https://example.com/normal.jpg'
      };

      materialManager.getMaterial(meshConfig);

      expect(mockTextureLoader.load).toHaveBeenCalledTimes(2);
      expect(mockTextureLoader.load).toHaveBeenCalledWith('https://example.com/texture.jpg');
      expect(mockTextureLoader.load).toHaveBeenCalledWith('https://example.com/normal.jpg');
    });

    test('텍스처 wrapping 설정이 올바르게 적용되어야 함', () => {
      const meshConfig: MeshConfig = {
        id: 'wrapped-material',
        mapTextureUrl: 'https://example.com/texture.jpg'
      };

      materialManager.getMaterial(meshConfig);

      // loadTexture 메서드가 호출되고 텍스처 설정이 적용되는지 확인
      const loadedTexture = mockTextureLoader.load.mock.results[0].value;
      expect(loadedTexture.wrapS).toBe('RepeatWrapping');
      expect(loadedTexture.wrapT).toBe('RepeatWrapping');
      expect(loadedTexture.needsUpdate).toBe(true);
    });
  });

  describe('재질 캐싱', () => {
    test('같은 ID의 재질은 캐시에서 반환되어야 함', () => {
      const meshConfig: MeshConfig = {
        id: 'cached-material',
        color: '#FF0000'
      };

      const material1 = materialManager.getMaterial(meshConfig);
      const material2 = materialManager.getMaterial(meshConfig);

      expect(material1).toBe(material2);
      expect(THREE.MeshStandardMaterial).toHaveBeenCalledTimes(1);
    });

    test('다른 ID의 재질은 새로 생성되어야 함', () => {
      const meshConfig1: MeshConfig = {
        id: 'material-1',
        color: '#FF0000'
      };
      const meshConfig2: MeshConfig = {
        id: 'material-2',
        color: '#00FF00'
      };

      const material1 = materialManager.getMaterial(meshConfig1);
      const material2 = materialManager.getMaterial(meshConfig2);

      expect(material1).not.toBe(material2);
      expect(THREE.MeshStandardMaterial).toHaveBeenCalledTimes(2);
    });
  });

  describe('재질 업데이트', () => {
    test('기존 재질의 색상이 업데이트되어야 함', () => {
      const meshConfig: MeshConfig = {
        id: 'updatable-material',
        color: '#FF0000'
      };

      materialManager.getMaterial(meshConfig);
      materialManager.updateMaterial('updatable-material', { color: '#00FF00' });

      expect(mockMaterial.color.set).toHaveBeenCalledWith('#00FF00');
      expect(mockMaterial.needsUpdate).toBe(true);
    });

    test('기존 재질의 roughness가 업데이트되어야 함', () => {
      const meshConfig: MeshConfig = {
        id: 'updatable-material',
        roughness: 0.5
      };

      materialManager.getMaterial(meshConfig);
      materialManager.updateMaterial('updatable-material', { roughness: 0.8 });

      expect(mockMaterial.roughness).toBe(0.8);
      expect(mockMaterial.needsUpdate).toBe(true);
    });

    test('기존 재질의 metalness가 업데이트되어야 함', () => {
      const meshConfig: MeshConfig = {
        id: 'updatable-material',
        metalness: 0.2
      };

      materialManager.getMaterial(meshConfig);
      materialManager.updateMaterial('updatable-material', { metalness: 0.9 });

      expect(mockMaterial.metalness).toBe(0.9);
      expect(mockMaterial.needsUpdate).toBe(true);
    });

    test('기존 재질의 opacity가 업데이트되어야 함', () => {
      const meshConfig: MeshConfig = {
        id: 'updatable-material',
        opacity: 1.0
      };

      materialManager.getMaterial(meshConfig);
      materialManager.updateMaterial('updatable-material', { opacity: 0.5 });

      expect(mockMaterial.opacity).toBe(0.5);
      expect(mockMaterial.needsUpdate).toBe(true);
    });

    test('여러 속성이 동시에 업데이트되어야 함', () => {
      const meshConfig: MeshConfig = {
        id: 'multi-updatable-material'
      };

      materialManager.getMaterial(meshConfig);
      materialManager.updateMaterial('multi-updatable-material', {
        color: '#FF00FF',
        roughness: 0.3,
        metalness: 0.7,
        opacity: 0.8
      });

      expect(mockMaterial.color.set).toHaveBeenCalledWith('#FF00FF');
      expect(mockMaterial.roughness).toBe(0.3);
      expect(mockMaterial.metalness).toBe(0.7);
      expect(mockMaterial.opacity).toBe(0.8);
      expect(mockMaterial.needsUpdate).toBe(true);
    });

    test('존재하지 않는 재질 업데이트 시 무시되어야 함', () => {
      materialManager.updateMaterial('non-existent-material', { color: '#FF0000' });

      expect(mockMaterial.color.set).not.toHaveBeenCalled();
    });
  });

  describe('메모리 관리', () => {
    test('dispose 호출 시 모든 재질이 정리되어야 함', () => {
      const meshConfig1: MeshConfig = {
        id: 'material-1',
        color: '#FF0000'
      };
      const meshConfig2: MeshConfig = {
        id: 'material-2',
        color: '#00FF00'
      };

      // 여러 재질 생성
      materialManager.getMaterial(meshConfig1);
      materialManager.getMaterial(meshConfig2);

      // dispose 호출
      materialManager.dispose();

      // 모든 재질의 dispose가 호출되어야 함
      expect(mockMaterial.dispose).toHaveBeenCalledTimes(2);
    });

    test('dispose 후 새로운 재질을 생성할 수 있어야 함', () => {
      const meshConfig: MeshConfig = {
        id: 'new-material-after-dispose',
        color: '#FF0000'
      };

      materialManager.getMaterial(meshConfig);
      materialManager.dispose();

      // dispose 후 새로운 재질 생성
      const newMaterial = materialManager.getMaterial(meshConfig);

      expect(newMaterial).toBeDefined();
      expect(THREE.MeshStandardMaterial).toHaveBeenCalledTimes(2); // 초기 + dispose 후
    });
  });

  describe('에러 처리', () => {
    test('잘못된 텍스처 URL에 대해 예외가 처리되어야 함', () => {
      const meshConfig: MeshConfig = {
        id: 'error-material',
        mapTextureUrl: 'invalid-url'
      };

      // @HandleError 데코레이터가 있어서 예외가 throw되지 않아야 함
      expect(() => {
        materialManager.getMaterial(meshConfig);
      }).not.toThrow();
    });

    test('잘못된 MeshConfig에 대해 예외가 처리되어야 함', () => {
      const invalidConfig = null as any;

      expect(() => {
        materialManager.getMaterial(invalidConfig);
      }).not.toThrow();
    });
  });

  describe('성능 및 최적화', () => {
    test('캐시 히트율이 높아야 함', () => {
      const meshConfig: MeshConfig = {
        id: 'performance-test-material',
        color: '#FF0000'
      };

      // 동일한 재질을 여러 번 요청
      for (let i = 0; i < 10; i++) {
        materialManager.getMaterial(meshConfig);
      }

      // 실제 재질 생성은 한 번만 일어나야 함
      expect(THREE.MeshStandardMaterial).toHaveBeenCalledTimes(1);
    });

    test('서로 다른 재질들이 독립적으로 관리되어야 함', () => {
      const configs: MeshConfig[] = [];
      for (let i = 0; i < 5; i++) {
        configs.push({
          id: `material-${i}`,
          color: `#${i}${i}${i}000`
        });
      }

      // 서로 다른 재질들 생성
      configs.forEach(config => {
        materialManager.getMaterial(config);
      });

      // 각각이 독립적으로 생성되어야 함
      expect(THREE.MeshStandardMaterial).toHaveBeenCalledTimes(5);
    });
  });

  describe('데코레이터 통합', () => {
    test('@Profile 데코레이터가 적용되어야 함', () => {
      // Profile 데코레이터는 성능 측정을 위한 것이므로
      // 실제 동작에는 영향을 주지 않아야 함
      const meshConfig: MeshConfig = {
        id: 'profiled-material',
        color: '#FF0000'
      };

      expect(() => {
        materialManager.getMaterial(meshConfig);
      }).not.toThrow();
    });

    test('@HandleError 데코레이터가 적용되어야 함', () => {
      // HandleError 데코레이터는 예외를 잡아서 처리하므로
      // 예외가 발생해도 throw되지 않아야 함
      expect(() => {
        materialManager.updateMaterial('non-existent', { color: '#FF0000' });
      }).not.toThrow();
    });

    test('@MonitorMemory 데코레이터가 적용되어야 함', () => {
      // MonitorMemory 데코레이터는 메모리 모니터링을 위한 것이므로
      // 실제 동작에는 영향을 주지 않아야 함
      const meshConfig: MeshConfig = {
        id: 'memory-monitored-material',
        mapTextureUrl: 'https://example.com/texture.jpg'
      };

      expect(() => {
        materialManager.getMaterial(meshConfig);
      }).not.toThrow();
    });
  });
}); 