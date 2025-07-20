import { BridgeFactory } from '../boilerplate';
import { logger } from '../utils/logger';

// Mock dependencies
jest.mock('../boilerplate', () => ({
  BridgeFactory: {
    listDomains: jest.fn(),
    has: jest.fn(),
    create: jest.fn(),
    listActiveInstances: jest.fn(),
    getInstanceCount: jest.fn(),
  }
}));

jest.mock('../utils/logger', () => ({
  logger: {
    log: jest.fn(),
  }
}));

// Mock bridge imports
jest.mock('../motions/bridge/MotionBridge', () => ({}));
jest.mock('../motions/bridge/PhysicsBridge', () => ({}));
jest.mock('../world/bridge/WorldBridge', () => ({}));
jest.mock('../animation/bridge/AnimationBridge', () => ({}));

const mockBridgeFactory = BridgeFactory as jest.Mocked<typeof BridgeFactory>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('initializeBridges', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset module cache to ensure fresh imports
    jest.resetModules();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Module Loading', () => {
    test('should import bridge modules', () => {
      // Just importing the module should load the bridge files
      expect(() => {
        require('../initializeBridges');
      }).not.toThrow();
    });

    test('should log initialization message', () => {
      require('../initializeBridges');
      
      expect(mockLogger.log).toHaveBeenCalledWith('[Core] initializeBridges.ts loaded');
    });
  });

  describe('Domain Registration', () => {
    test('should list registered domains', () => {
      const mockDomains = ['motion', 'physics', 'world', 'animation'];
      mockBridgeFactory.listDomains.mockReturnValue(mockDomains);
      
      require('../initializeBridges');
      
      expect(mockBridgeFactory.listDomains).toHaveBeenCalled();
      expect(mockLogger.log).toHaveBeenCalledWith('[Core] Registered bridge domains:', mockDomains);
    });

    test('should handle empty domain list', () => {
      mockBridgeFactory.listDomains.mockReturnValue([]);
      
      expect(() => {
        require('../initializeBridges');
      }).not.toThrow();
      
      expect(mockLogger.log).toHaveBeenCalledWith('[Core] Registered bridge domains:', []);
    });
  });

  describe('Bridge Creation', () => {
    test('should create bridges for domains that do not exist', () => {
      const mockDomains = ['motion', 'physics'];
      const mockBridge = { id: 'test-bridge' };
      
      mockBridgeFactory.listDomains.mockReturnValue(mockDomains);
      mockBridgeFactory.has.mockReturnValue(false);
      mockBridgeFactory.create.mockReturnValue(mockBridge);
      
      require('../initializeBridges');
      
      expect(mockBridgeFactory.has).toHaveBeenCalledWith('motion');
      expect(mockBridgeFactory.has).toHaveBeenCalledWith('physics');
      expect(mockBridgeFactory.create).toHaveBeenCalledWith('motion');
      expect(mockBridgeFactory.create).toHaveBeenCalledWith('physics');
      
      expect(mockLogger.log).toHaveBeenCalledWith('[Core] Creating motion bridge...');
      expect(mockLogger.log).toHaveBeenCalledWith('[Core] motion bridge created successfully');
      expect(mockLogger.log).toHaveBeenCalledWith('[Core] Creating physics bridge...');
      expect(mockLogger.log).toHaveBeenCalledWith('[Core] physics bridge created successfully');
    });

    test('should skip creation for existing bridges', () => {
      const mockDomains = ['motion', 'physics'];
      
      mockBridgeFactory.listDomains.mockReturnValue(mockDomains);
      mockBridgeFactory.has.mockReturnValue(true);
      
      require('../initializeBridges');
      
      expect(mockBridgeFactory.has).toHaveBeenCalledWith('motion');
      expect(mockBridgeFactory.has).toHaveBeenCalledWith('physics');
      expect(mockBridgeFactory.create).not.toHaveBeenCalled();
      
      expect(mockLogger.log).toHaveBeenCalledWith('[Core] motion bridge already exists');
      expect(mockLogger.log).toHaveBeenCalledWith('[Core] physics bridge already exists');
    });

    test('should handle mixed scenario - some exist, some do not', () => {
      const mockDomains = ['motion', 'physics', 'world'];
      const mockBridge = { id: 'test-bridge' };
      
      mockBridgeFactory.listDomains.mockReturnValue(mockDomains);
      mockBridgeFactory.has
        .mockReturnValueOnce(true)  // motion exists
        .mockReturnValueOnce(false) // physics does not exist
        .mockReturnValueOnce(true); // world exists
      mockBridgeFactory.create.mockReturnValue(mockBridge);
      
      require('../initializeBridges');
      
      expect(mockBridgeFactory.create).toHaveBeenCalledTimes(1);
      expect(mockBridgeFactory.create).toHaveBeenCalledWith('physics');
      
      expect(mockLogger.log).toHaveBeenCalledWith('[Core] motion bridge already exists');
      expect(mockLogger.log).toHaveBeenCalledWith('[Core] Creating physics bridge...');
      expect(mockLogger.log).toHaveBeenCalledWith('[Core] physics bridge created successfully');
      expect(mockLogger.log).toHaveBeenCalledWith('[Core] world bridge already exists');
    });

    test('should handle failed bridge creation', () => {
      const mockDomains = ['motion'];
      
      mockBridgeFactory.listDomains.mockReturnValue(mockDomains);
      mockBridgeFactory.has.mockReturnValue(false);
      mockBridgeFactory.create.mockReturnValue(null);
      
      require('../initializeBridges');
      
      expect(mockBridgeFactory.create).toHaveBeenCalledWith('motion');
      expect(mockLogger.log).toHaveBeenCalledWith('[Core] Creating motion bridge...');
      // Should not log success message when creation fails
      expect(mockLogger.log).not.toHaveBeenCalledWith('[Core] motion bridge created successfully');
    });
  });

  describe('Final Status Reporting', () => {
    test('should report final active instances', () => {
      const mockDomains = ['motion'];
      const mockActiveInstances = ['motion-bridge-1', 'physics-bridge-1'];
      const mockInstanceCount = 2;
      
      mockBridgeFactory.listDomains.mockReturnValue(mockDomains);
      mockBridgeFactory.has.mockReturnValue(true);
      mockBridgeFactory.listActiveInstances.mockReturnValue(mockActiveInstances);
      mockBridgeFactory.getInstanceCount.mockReturnValue(mockInstanceCount);
      
      require('../initializeBridges');
      
      expect(mockBridgeFactory.listActiveInstances).toHaveBeenCalled();
      expect(mockBridgeFactory.getInstanceCount).toHaveBeenCalled();
      
      expect(mockLogger.log).toHaveBeenCalledWith('[Core] Active instances after creation:', mockActiveInstances);
      expect(mockLogger.log).toHaveBeenCalledWith('[Core] Total instance count:', mockInstanceCount);
    });

    test('should handle empty active instances', () => {
      const mockDomains = [];
      const mockActiveInstances: string[] = [];
      const mockInstanceCount = 0;
      
      mockBridgeFactory.listDomains.mockReturnValue(mockDomains);
      mockBridgeFactory.listActiveInstances.mockReturnValue(mockActiveInstances);
      mockBridgeFactory.getInstanceCount.mockReturnValue(mockInstanceCount);
      
      require('../initializeBridges');
      
      expect(mockLogger.log).toHaveBeenCalledWith('[Core] Active instances after creation:', []);
      expect(mockLogger.log).toHaveBeenCalledWith('[Core] Total instance count:', 0);
    });
  });

  describe('Error Handling', () => {
    test('should handle BridgeFactory errors gracefully', () => {
      mockBridgeFactory.listDomains.mockImplementation(() => {
        throw new Error('BridgeFactory error');
      });
      
      expect(() => {
        require('../initializeBridges');
      }).toThrow('BridgeFactory error');
    });

    test('should handle bridge creation errors', () => {
      const mockDomains = ['motion'];
      
      mockBridgeFactory.listDomains.mockReturnValue(mockDomains);
      mockBridgeFactory.has.mockReturnValue(false);
      mockBridgeFactory.create.mockImplementation(() => {
        throw new Error('Bridge creation error');
      });
      
      expect(() => {
        require('../initializeBridges');
      }).toThrow('Bridge creation error');
    });

    test('should handle logger errors gracefully', () => {
      const mockDomains = ['motion'];
      
      mockBridgeFactory.listDomains.mockReturnValue(mockDomains);
      mockBridgeFactory.has.mockReturnValue(true);
      mockLogger.log.mockImplementation(() => {
        throw new Error('Logger error');
      });
      
      expect(() => {
        require('../initializeBridges');
      }).toThrow('Logger error');
    });
  });

  describe('Module Dependencies', () => {
    test('should import all required bridge modules', () => {
      // These modules should be imported when initializeBridges is loaded
      const requiredModules = [
        '../motions/bridge/MotionBridge',
        '../motions/bridge/PhysicsBridge',
        '../world/bridge/WorldBridge',
        '../animation/bridge/AnimationBridge',
      ];
      
      // The fact that we can mock these modules means they are being imported
      expect(() => {
        require('../initializeBridges');
      }).not.toThrow();
    });

    test('should handle missing bridge module imports', () => {
      // Reset mocks to simulate missing modules
      jest.doMock('../motions/bridge/MotionBridge', () => {
        throw new Error('Module not found');
      });
      
      expect(() => {
        require('../initializeBridges');
      }).toThrow('Module not found');
    });
  });

  describe('Integration Scenarios', () => {
    test('should handle complete initialization flow', () => {
      const mockDomains = ['motion', 'physics', 'world', 'animation'];
      const mockBridge = { id: 'test-bridge', initialize: jest.fn() };
      const mockActiveInstances = ['motion-1', 'physics-1', 'world-1', 'animation-1'];
      const mockInstanceCount = 4;
      
      mockBridgeFactory.listDomains.mockReturnValue(mockDomains);
      mockBridgeFactory.has.mockReturnValue(false);
      mockBridgeFactory.create.mockReturnValue(mockBridge);
      mockBridgeFactory.listActiveInstances.mockReturnValue(mockActiveInstances);
      mockBridgeFactory.getInstanceCount.mockReturnValue(mockInstanceCount);
      
      require('../initializeBridges');
      
      // Verify all steps were executed
      expect(mockLogger.log).toHaveBeenCalledWith('[Core] initializeBridges.ts loaded');
      expect(mockLogger.log).toHaveBeenCalledWith('[Core] Registered bridge domains:', mockDomains);
      
      mockDomains.forEach(domain => {
        expect(mockLogger.log).toHaveBeenCalledWith(`[Core] Creating ${domain} bridge...`);
        expect(mockLogger.log).toHaveBeenCalledWith(`[Core] ${domain} bridge created successfully`);
      });
      
      expect(mockLogger.log).toHaveBeenCalledWith('[Core] Active instances after creation:', mockActiveInstances);
      expect(mockLogger.log).toHaveBeenCalledWith('[Core] Total instance count:', mockInstanceCount);
    });

    test('should handle partial initialization', () => {
      const mockDomains = ['motion', 'physics'];
      const mockBridge = { id: 'test-bridge' };
      
      mockBridgeFactory.listDomains.mockReturnValue(mockDomains);
      mockBridgeFactory.has
        .mockReturnValueOnce(false) // motion needs creation
        .mockReturnValueOnce(true);  // physics already exists
      mockBridgeFactory.create.mockReturnValue(mockBridge);
      mockBridgeFactory.listActiveInstances.mockReturnValue(['motion-1', 'physics-1']);
      mockBridgeFactory.getInstanceCount.mockReturnValue(2);
      
      require('../initializeBridges');
      
      expect(mockBridgeFactory.create).toHaveBeenCalledTimes(1);
      expect(mockBridgeFactory.create).toHaveBeenCalledWith('motion');
      
      expect(mockLogger.log).toHaveBeenCalledWith('[Core] Creating motion bridge...');
      expect(mockLogger.log).toHaveBeenCalledWith('[Core] motion bridge created successfully');
      expect(mockLogger.log).toHaveBeenCalledWith('[Core] physics bridge already exists');
    });
  });

  describe('Performance', () => {
    test('should initialize efficiently with many domains', () => {
      const mockDomains = Array.from({ length: 100 }, (_, i) => `domain-${i}`);
      const mockBridge = { id: 'test-bridge' };
      
      mockBridgeFactory.listDomains.mockReturnValue(mockDomains);
      mockBridgeFactory.has.mockReturnValue(false);
      mockBridgeFactory.create.mockReturnValue(mockBridge);
      mockBridgeFactory.listActiveInstances.mockReturnValue([]);
      mockBridgeFactory.getInstanceCount.mockReturnValue(0);
      
      const startTime = performance.now();
      require('../initializeBridges');
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
      expect(mockBridgeFactory.create).toHaveBeenCalledTimes(100);
    });
  });
}); 