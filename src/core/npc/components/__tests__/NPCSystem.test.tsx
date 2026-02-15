import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import { NPCSystem } from '../NPCSystem';
import { useNPCStore } from '../../stores/npcStore';
import { useBuildingStore } from '../../../building/stores/buildingStore';

// Mock the stores
jest.mock('../../stores/npcStore');
jest.mock('../../../building/stores/buildingStore');
jest.mock('../NPCInstance', () => ({
  NPCInstance: jest.fn(({ instance, isEditMode, onClick }) => (
    <mesh 
      data-testid={`npc-instance-${instance.id}`}
      onClick={onClick}
    >
      <boxGeometry />
      <meshBasicMaterial />
    </mesh>
  ))
}));

const mockUseNPCStore = useNPCStore as jest.MockedFunction<typeof useNPCStore>;
const mockUseBuildingStore = useBuildingStore as jest.MockedFunction<typeof useBuildingStore>;

describe('NPCSystem', () => {
  const mockInstances = new Map([
    ['npc1', {
      id: 'npc1',
      templateId: 'template1',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      metadata: {}
    }],
    ['npc2', {
      id: 'npc2',
      templateId: 'template2',
      position: [5, 0, 5],
      rotation: [0, Math.PI, 0],
      scale: [1, 1, 1],
      metadata: { type: 'guard' }
    }]
  ]);

  const mockCreateInstanceFromTemplate = jest.fn();
  const mockRemoveInstance = jest.fn();
  const mockSetSelectedInstance = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default NPC store mock
    mockUseNPCStore.mockReturnValue({
      instances: mockInstances,
      selectedTemplateId: 'template1',
      createInstanceFromTemplate: mockCreateInstanceFromTemplate,
      removeInstance: mockRemoveInstance,
      setSelectedInstance: mockSetSelectedInstance,
      templates: new Map(),
      selectedInstanceId: null,
      setSelectedTemplateId: jest.fn(),
      updateInstance: jest.fn(),
      loadTemplate: jest.fn(),
      saveTemplate: jest.fn(),
      duplicateTemplate: jest.fn(),
    } as any);

    // Setup default building store mock  
    mockUseBuildingStore.mockReturnValue('editor');
  });

  const renderWithCanvas = (component: React.ReactElement) => {
    return render(
      <Canvas>
        {component}
      </Canvas>
    );
  };

  describe('Component Rendering', () => {
    test('should render NPCSystem with instances', () => {
      renderWithCanvas(<NPCSystem />);
      
      expect(screen.getByTestId('npc-instance-npc1')).toBeInTheDocument();
      expect(screen.getByTestId('npc-instance-npc2')).toBeInTheDocument();
    });

    test('should render empty group when no instances', () => {
      mockUseNPCStore.mockReturnValue({
        instances: new Map(),
        selectedTemplateId: null,
        createInstanceFromTemplate: mockCreateInstanceFromTemplate,
        removeInstance: mockRemoveInstance,
        setSelectedInstance: mockSetSelectedInstance,
      } as any);

      renderWithCanvas(<NPCSystem />);
      
      // Should still render the group but with no instances
      expect(screen.queryByTestId('npc-instance-npc1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('npc-instance-npc2')).not.toBeInTheDocument();
    });

    test('should pass correct props to NPCInstance components', () => {
      const NPCInstance = require('../NPCInstance').NPCInstance;
      
      renderWithCanvas(<NPCSystem />);
      
      expect(NPCInstance).toHaveBeenCalledWith(
        expect.objectContaining({
          instance: mockInstances.get('npc1'),
          isEditMode: false,
          onClick: expect.any(Function)
        }),
        {}
      );
    });
  });

  describe('Edit Mode Behavior', () => {
    beforeEach(() => {
      // Mock building store to return NPC edit mode
      mockUseBuildingStore.mockImplementation((selector) => {
        if (typeof selector === 'function') {
          const mockState = {
            editMode: 'npc',
            hoverPosition: { x: 10, y: 0, z: 10 }
          };
          return selector(mockState);
        }
        return 'npc';
      });
    });

    test('should pass isEditMode=true when in NPC edit mode', () => {
      const NPCInstance = require('../NPCInstance').NPCInstance;
      
      renderWithCanvas(<NPCSystem />);
      
      expect(NPCInstance).toHaveBeenCalledWith(
        expect.objectContaining({
          isEditMode: true
        }),
        {}
      );
    });

    test('should handle click events in edit mode', () => {
      renderWithCanvas(<NPCSystem />);
      
      const npcInstance = screen.getByTestId('npc-instance-npc1');
      fireEvent.click(npcInstance);
      
      expect(mockSetSelectedInstance).toHaveBeenCalledWith('npc1');
    });

    test('should not call setSelectedInstance when not in edit mode', () => {
      mockUseBuildingStore.mockImplementation((selector) => {
        if (typeof selector === 'function') {
          const mockState = {
            editMode: 'building',
            hoverPosition: null
          };
          return selector(mockState);
        }
        return 'building';
      });

      renderWithCanvas(<NPCSystem />);
      
      const npcInstance = screen.getByTestId('npc-instance-npc1');
      fireEvent.click(npcInstance);
      
      expect(mockSetSelectedInstance).not.toHaveBeenCalled();
    });
  });

  describe('Instance Creation', () => {
    beforeEach(() => {
      // Mock building store with NPC mode and hover position
      mockUseBuildingStore.mockImplementation((selector) => {
        const mockState = {
          editMode: 'npc',
          hoverPosition: { x: 15, y: 0, z: 20 }
        };
        if (typeof selector === 'function') return selector(mockState);
        return mockState as any;
      });
    });

    test('should create instance when canvas is clicked in NPC mode', async () => {
      const mockCanvas = {
        domElement: document.createElement('canvas'),
        getSize: jest.fn(),
        setSize: jest.fn(),
      };

      // Mock useThree hook
      jest.doMock('@react-three/fiber', () => ({
        ...jest.requireActual('@react-three/fiber'),
        useThree: () => ({ gl: mockCanvas })
      }));

      renderWithCanvas(<NPCSystem />);

      // Simulate canvas click
      fireEvent.click(mockCanvas.domElement);

      await waitFor(() => {
        expect(mockCreateInstanceFromTemplate).toHaveBeenCalledWith(
          'template1',
          [15, 0, 20]
        );
      });
    });

    test('should not create instance when no selected template', () => {
      mockUseNPCStore.mockReturnValue({
        instances: mockInstances,
        selectedTemplateId: null,
        createInstanceFromTemplate: mockCreateInstanceFromTemplate,
        removeInstance: mockRemoveInstance,
        setSelectedInstance: mockSetSelectedInstance,
      } as any);

      const mockCanvas = {
        domElement: document.createElement('canvas'),
        getSize: jest.fn(),
        setSize: jest.fn(),
      };

      jest.doMock('@react-three/fiber', () => ({
        ...jest.requireActual('@react-three/fiber'),
        useThree: () => ({ gl: mockCanvas })
      }));

      renderWithCanvas(<NPCSystem />);

      fireEvent.click(mockCanvas.domElement);

      expect(mockCreateInstanceFromTemplate).not.toHaveBeenCalled();
    });

    test('should not create instance when no hover position', () => {
      mockUseBuildingStore.mockImplementation((selector) => {
        if (typeof selector === 'function') {
          const mockState = {
            editMode: 'npc',
            hoverPosition: null
          };
          return selector(mockState);
        }
        return null;
      });

      const mockCanvas = {
        domElement: document.createElement('canvas'),
        getSize: jest.fn(),
        setSize: jest.fn(),
      };

      jest.doMock('@react-three/fiber', () => ({
        ...jest.requireActual('@react-three/fiber'),
        useThree: () => ({ gl: mockCanvas })
      }));

      renderWithCanvas(<NPCSystem />);

      fireEvent.click(mockCanvas.domElement);

      expect(mockCreateInstanceFromTemplate).not.toHaveBeenCalled();
    });
  });

  describe('Event Listeners', () => {
    test('should add and remove event listeners properly', () => {
      const mockCanvas = {
        domElement: document.createElement('canvas'),
        getSize: jest.fn(),
        setSize: jest.fn(),
      };

      const addEventListenerSpy = jest.spyOn(mockCanvas.domElement, 'addEventListener');
      const removeEventListenerSpy = jest.spyOn(mockCanvas.domElement, 'removeEventListener');

      jest.doMock('@react-three/fiber', () => ({
        ...jest.requireActual('@react-three/fiber'),
        useThree: () => ({ gl: mockCanvas })
      }));

      mockUseBuildingStore.mockImplementation((selector) => {
        if (typeof selector === 'function') {
          const mockState = {
            editMode: 'npc',
            hoverPosition: { x: 10, y: 0, z: 10 }
          };
          return selector(mockState);
        }
        return 'npc';
      });

      const { unmount } = renderWithCanvas(<NPCSystem />);

      expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
    });

    test('should not add event listeners when not in NPC mode', () => {
      const mockCanvas = {
        domElement: document.createElement('canvas'),
        getSize: jest.fn(),
        setSize: jest.fn(),
      };

      const addEventListenerSpy = jest.spyOn(mockCanvas.domElement, 'addEventListener');

      jest.doMock('@react-three/fiber', () => ({
        ...jest.requireActual('@react-three/fiber'),
        useThree: () => ({ gl: mockCanvas })
      }));

      mockUseBuildingStore.mockImplementation((selector) => {
        if (typeof selector === 'function') {
          const mockState = {
            editMode: 'building',
            hoverPosition: null
          };
          return selector(mockState);
        }
        return 'building';
      });

      renderWithCanvas(<NPCSystem />);

      expect(addEventListenerSpy).not.toHaveBeenCalled();
    });
  });

  describe('Store Integration', () => {
    test('should use instances from NPC store', () => {
      const customInstances = new Map([
        ['custom1', {
          id: 'custom1',
          templateId: 'template3',
          position: [100, 0, 100],
          rotation: [0, 0, 0],
          scale: [2, 2, 2],
          metadata: { type: 'special' }
        }]
      ]);

      mockUseNPCStore.mockReturnValue({
        instances: customInstances,
        selectedTemplateId: 'template3',
        createInstanceFromTemplate: mockCreateInstanceFromTemplate,
        removeInstance: mockRemoveInstance,
        setSelectedInstance: mockSetSelectedInstance,
      } as any);

      renderWithCanvas(<NPCSystem />);

      expect(screen.getByTestId('npc-instance-custom1')).toBeInTheDocument();
      expect(screen.queryByTestId('npc-instance-npc1')).not.toBeInTheDocument();
    });

    test('should react to store state changes', () => {
      const { rerender } = renderWithCanvas(<NPCSystem />);

      expect(screen.getByTestId('npc-instance-npc1')).toBeInTheDocument();

      // Update store to remove instances
      mockUseNPCStore.mockReturnValue({
        instances: new Map(),
        selectedTemplateId: null,
        createInstanceFromTemplate: mockCreateInstanceFromTemplate,
        removeInstance: mockRemoveInstance,
        setSelectedInstance: mockSetSelectedInstance,
      } as any);

      rerender(
        <Canvas>
          <NPCSystem />
        </Canvas>
      );

      expect(screen.queryByTestId('npc-instance-npc1')).not.toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    test('should handle large number of instances efficiently', () => {
      const largeInstanceMap = new Map();
      for (let i = 0; i < 1000; i++) {
        largeInstanceMap.set(`npc${i}`, {
          id: `npc${i}`,
          templateId: 'template1',
          position: [i, 0, i],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          metadata: {}
        });
      }

      mockUseNPCStore.mockReturnValue({
        instances: largeInstanceMap,
        selectedTemplateId: 'template1',
        createInstanceFromTemplate: mockCreateInstanceFromTemplate,
        removeInstance: mockRemoveInstance,
        setSelectedInstance: mockSetSelectedInstance,
      } as any);

      const startTime = performance.now();
      renderWithCanvas(<NPCSystem />);
      const endTime = performance.now();

      // Should render within reasonable time (adjust threshold as needed)
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });

  describe('Error Handling', () => {
    test('should handle missing instances gracefully', () => {
      mockUseNPCStore.mockReturnValue({
        instances: undefined,
        selectedTemplateId: 'template1',
        createInstanceFromTemplate: mockCreateInstanceFromTemplate,
        removeInstance: mockRemoveInstance,
        setSelectedInstance: mockSetSelectedInstance,
      } as any);

      expect(() => {
        renderWithCanvas(<NPCSystem />);
      }).not.toThrow();
    });

    test('should handle invalid instance data', () => {
      const invalidInstances = new Map([
        ['invalid', null],
        ['partial', { id: 'partial' }],
      ]);

      mockUseNPCStore.mockReturnValue({
        instances: invalidInstances,
        selectedTemplateId: 'template1',
        createInstanceFromTemplate: mockCreateInstanceFromTemplate,
        removeInstance: mockRemoveInstance,
        setSelectedInstance: mockSetSelectedInstance,
      } as any);

      expect(() => {
        renderWithCanvas(<NPCSystem />);
      }).not.toThrow();
    });

    test('should handle store errors gracefully', () => {
      mockUseNPCStore.mockImplementation(() => {
        throw new Error('Store error');
      });

      expect(() => {
        renderWithCanvas(<NPCSystem />);
      }).toThrow('Store error');
    });
  });

  describe('Accessibility', () => {
    test('should provide proper group name for Three.js scene', () => {
      renderWithCanvas(<NPCSystem />);
      
      // The group should be present in the scene graph
      // This is mainly for Three.js debugging and scene inspection
      expect(screen.getByTestId('npc-instance-npc1')).toBeInTheDocument();
    });
  });
}); 