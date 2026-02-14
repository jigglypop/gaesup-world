import {
  PHYSICS_CONSTANTS,
  CAMERA_CONSTANTS,
  UI_CONSTANTS,
  GAME_CONSTANTS,
  STORAGE_KEYS,
} from '../index';

describe('Application Constants', () => {
  describe('PHYSICS_CONSTANTS', () => {
    test('should have correct gravity value', () => {
      expect(PHYSICS_CONSTANTS.GRAVITY).toBe(-9.81);
    });

    test('should have realistic fall speed limit', () => {
      expect(PHYSICS_CONSTANTS.MAX_FALL_SPEED).toBe(50);
      expect(PHYSICS_CONSTANTS.MAX_FALL_SPEED).toBeGreaterThan(0);
    });

    test('should have reasonable default mass', () => {
      expect(PHYSICS_CONSTANTS.DEFAULT_MASS).toBe(70);
      expect(PHYSICS_CONSTANTS.DEFAULT_MASS).toBeGreaterThan(0);
    });

    test('should have valid friction coefficient', () => {
      expect(PHYSICS_CONSTANTS.DEFAULT_FRICTION).toBe(0.5);
      expect(PHYSICS_CONSTANTS.DEFAULT_FRICTION).toBeGreaterThanOrEqual(0);
      expect(PHYSICS_CONSTANTS.DEFAULT_FRICTION).toBeLessThanOrEqual(1);
    });

    test('should have valid restitution coefficient', () => {
      expect(PHYSICS_CONSTANTS.DEFAULT_RESTITUTION).toBe(0.2);
      expect(PHYSICS_CONSTANTS.DEFAULT_RESTITUTION).toBeGreaterThanOrEqual(0);
      expect(PHYSICS_CONSTANTS.DEFAULT_RESTITUTION).toBeLessThanOrEqual(1);
    });

    test('should be immutable', () => {
      expect(() => {
        (PHYSICS_CONSTANTS as any).GRAVITY = -5;
      }).toThrow();
    });

    test('should have all required physics properties', () => {
      const requiredProperties = [
        'GRAVITY',
        'MAX_FALL_SPEED',
        'DEFAULT_MASS',
        'DEFAULT_FRICTION',
        'DEFAULT_RESTITUTION',
      ];

      requiredProperties.forEach(prop => {
        expect(PHYSICS_CONSTANTS).toHaveProperty(prop);
        expect(typeof PHYSICS_CONSTANTS[prop as keyof typeof PHYSICS_CONSTANTS]).toBe('number');
      });
    });
  });

  describe('CAMERA_CONSTANTS', () => {
    test('should have valid default FOV', () => {
      expect(CAMERA_CONSTANTS.DEFAULT_FOV).toBe(60);
      expect(CAMERA_CONSTANTS.DEFAULT_FOV).toBeGreaterThan(0);
      expect(CAMERA_CONSTANTS.DEFAULT_FOV).toBeLessThan(180);
    });

    test('should have valid FOV range', () => {
      expect(CAMERA_CONSTANTS.MIN_FOV).toBe(30);
      expect(CAMERA_CONSTANTS.MAX_FOV).toBe(90);
      expect(CAMERA_CONSTANTS.MIN_FOV).toBeLessThan(CAMERA_CONSTANTS.DEFAULT_FOV);
      expect(CAMERA_CONSTANTS.MAX_FOV).toBeGreaterThan(CAMERA_CONSTANTS.DEFAULT_FOV);
      expect(CAMERA_CONSTANTS.MIN_FOV).toBeLessThan(CAMERA_CONSTANTS.MAX_FOV);
    });

    test('should have valid distance range', () => {
      expect(CAMERA_CONSTANTS.DEFAULT_DISTANCE).toBe(10);
      expect(CAMERA_CONSTANTS.MIN_DISTANCE).toBe(2);
      expect(CAMERA_CONSTANTS.MAX_DISTANCE).toBe(50);
      
      expect(CAMERA_CONSTANTS.MIN_DISTANCE).toBeLessThan(CAMERA_CONSTANTS.DEFAULT_DISTANCE);
      expect(CAMERA_CONSTANTS.MAX_DISTANCE).toBeGreaterThan(CAMERA_CONSTANTS.DEFAULT_DISTANCE);
      expect(CAMERA_CONSTANTS.MIN_DISTANCE).toBeLessThan(CAMERA_CONSTANTS.MAX_DISTANCE);
    });

    test('should have valid transition speed', () => {
      expect(CAMERA_CONSTANTS.TRANSITION_SPEED).toBe(0.1);
      expect(CAMERA_CONSTANTS.TRANSITION_SPEED).toBeGreaterThan(0);
      expect(CAMERA_CONSTANTS.TRANSITION_SPEED).toBeLessThanOrEqual(1);
    });

    test('should be immutable', () => {
      expect(() => {
        (CAMERA_CONSTANTS as any).DEFAULT_FOV = 45;
      }).toThrow();
    });

    test('should have all required camera properties', () => {
      const requiredProperties = [
        'DEFAULT_FOV',
        'MIN_FOV',
        'MAX_FOV',
        'DEFAULT_DISTANCE',
        'MIN_DISTANCE',
        'MAX_DISTANCE',
        'TRANSITION_SPEED',
      ];

      requiredProperties.forEach(prop => {
        expect(CAMERA_CONSTANTS).toHaveProperty(prop);
        expect(typeof CAMERA_CONSTANTS[prop as keyof typeof CAMERA_CONSTANTS]).toBe('number');
      });
    });
  });

  describe('UI_CONSTANTS', () => {
    test('should have valid panel dimensions', () => {
      expect(UI_CONSTANTS.PANEL_MIN_WIDTH).toBe(200);
      expect(UI_CONSTANTS.PANEL_MIN_HEIGHT).toBe(100);
      expect(UI_CONSTANTS.PANEL_DEFAULT_WIDTH).toBe(300);
      expect(UI_CONSTANTS.PANEL_DEFAULT_HEIGHT).toBe(400);

      expect(UI_CONSTANTS.PANEL_MIN_WIDTH).toBeLessThan(UI_CONSTANTS.PANEL_DEFAULT_WIDTH);
      expect(UI_CONSTANTS.PANEL_MIN_HEIGHT).toBeLessThan(UI_CONSTANTS.PANEL_DEFAULT_HEIGHT);
    });

    test('should have positive dimension values', () => {
      expect(UI_CONSTANTS.PANEL_MIN_WIDTH).toBeGreaterThan(0);
      expect(UI_CONSTANTS.PANEL_MIN_HEIGHT).toBeGreaterThan(0);
      expect(UI_CONSTANTS.PANEL_DEFAULT_WIDTH).toBeGreaterThan(0);
      expect(UI_CONSTANTS.PANEL_DEFAULT_HEIGHT).toBeGreaterThan(0);
    });

    test('should have valid timing values', () => {
      expect(UI_CONSTANTS.ANIMATION_DURATION).toBe(300);
      expect(UI_CONSTANTS.DEBOUNCE_DELAY).toBe(300);
      
      expect(UI_CONSTANTS.ANIMATION_DURATION).toBeGreaterThan(0);
      expect(UI_CONSTANTS.DEBOUNCE_DELAY).toBeGreaterThan(0);
    });

    test('should be immutable', () => {
      expect(() => {
        (UI_CONSTANTS as any).PANEL_MIN_WIDTH = 150;
      }).toThrow();
    });

    test('should have all required UI properties', () => {
      const requiredProperties = [
        'PANEL_MIN_WIDTH',
        'PANEL_MIN_HEIGHT',
        'PANEL_DEFAULT_WIDTH',
        'PANEL_DEFAULT_HEIGHT',
        'ANIMATION_DURATION',
        'DEBOUNCE_DELAY',
      ];

      requiredProperties.forEach(prop => {
        expect(UI_CONSTANTS).toHaveProperty(prop);
        expect(typeof UI_CONSTANTS[prop as keyof typeof UI_CONSTANTS]).toBe('number');
      });
    });
  });

  describe('GAME_CONSTANTS', () => {
    test('should have reasonable player limits', () => {
      expect(GAME_CONSTANTS.MAX_PLAYERS).toBe(100);
      expect(GAME_CONSTANTS.MAX_PLAYERS).toBeGreaterThan(0);
      expect(GAME_CONSTANTS.MAX_PLAYERS).toBeLessThan(1000); // Sanity check
    });

    test('should have reasonable object limits', () => {
      expect(GAME_CONSTANTS.MAX_OBJECTS).toBe(10000);
      expect(GAME_CONSTANTS.MAX_OBJECTS).toBeGreaterThan(0);
      expect(GAME_CONSTANTS.MAX_OBJECTS).toBeGreaterThan(GAME_CONSTANTS.MAX_PLAYERS);
    });

    test('should have valid update intervals', () => {
      expect(GAME_CONSTANTS.UPDATE_INTERVAL).toBeCloseTo(1000 / 60, 2);
      expect(GAME_CONSTANTS.SAVE_INTERVAL).toBe(60000);
      
      expect(GAME_CONSTANTS.UPDATE_INTERVAL).toBeGreaterThan(0);
      expect(GAME_CONSTANTS.SAVE_INTERVAL).toBeGreaterThan(GAME_CONSTANTS.UPDATE_INTERVAL);
    });

    test('should have reasonable interaction distance', () => {
      expect(GAME_CONSTANTS.INTERACTION_DISTANCE).toBe(5);
      expect(GAME_CONSTANTS.INTERACTION_DISTANCE).toBeGreaterThan(0);
    });

    test('should maintain 60 FPS target', () => {
      const targetFPS = 60;
      const expectedInterval = 1000 / targetFPS;
      expect(GAME_CONSTANTS.UPDATE_INTERVAL).toBeCloseTo(expectedInterval, 0);
    });

    test('should be immutable', () => {
      expect(() => {
        (GAME_CONSTANTS as any).MAX_PLAYERS = 200;
      }).toThrow();
    });

    test('should have all required game properties', () => {
      const requiredProperties = [
        'MAX_PLAYERS',
        'MAX_OBJECTS',
        'UPDATE_INTERVAL',
        'SAVE_INTERVAL',
        'INTERACTION_DISTANCE',
      ];

      requiredProperties.forEach(prop => {
        expect(GAME_CONSTANTS).toHaveProperty(prop);
        expect(typeof GAME_CONSTANTS[prop as keyof typeof GAME_CONSTANTS]).toBe('number');
      });
    });
  });

  describe('STORAGE_KEYS', () => {
    test('should have valid storage key strings', () => {
      expect(STORAGE_KEYS.USER_PREFERENCES).toBe('user_preferences');
      expect(STORAGE_KEYS.GAME_STATE).toBe('game_state');
      expect(STORAGE_KEYS.CAMERA_SETTINGS).toBe('camera_settings');
      expect(STORAGE_KEYS.EDITOR_LAYOUT).toBe('editor_layout');
    });

    test('should use snake_case convention', () => {
      const values = Object.values(STORAGE_KEYS);
      values.forEach(key => {
        expect(key).toMatch(/^[a-z_]+$/);
        expect(key).not.toContain(' ');
        expect(key).not.toContain('-');
      });
    });

    test('should have unique storage keys', () => {
      const values = Object.values(STORAGE_KEYS);
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });

    test('should be immutable', () => {
      expect(() => {
        (STORAGE_KEYS as any).USER_PREFERENCES = 'user_prefs';
      }).toThrow();
    });

    test('should have all required storage properties', () => {
      const requiredProperties = [
        'USER_PREFERENCES',
        'GAME_STATE',
        'CAMERA_SETTINGS',
        'EDITOR_LAYOUT',
      ];

      requiredProperties.forEach(prop => {
        expect(STORAGE_KEYS).toHaveProperty(prop);
        expect(typeof STORAGE_KEYS[prop as keyof typeof STORAGE_KEYS]).toBe('string');
      });
    });
  });

  describe('Cross-constant Relationships', () => {
    test('should have consistent timing relationships', () => {
      // UI animation should be reasonable compared to game update
      expect(UI_CONSTANTS.ANIMATION_DURATION).toBeGreaterThan(GAME_CONSTANTS.UPDATE_INTERVAL);
      
      // Debounce should be reasonable for user interaction
      expect(UI_CONSTANTS.DEBOUNCE_DELAY).toBeGreaterThan(GAME_CONSTANTS.UPDATE_INTERVAL);
      
      // Save interval should be much longer than update interval
      expect(GAME_CONSTANTS.SAVE_INTERVAL).toBeGreaterThan(UI_CONSTANTS.ANIMATION_DURATION * 10);
    });

    test('should have logical size relationships', () => {
      // More objects than players makes sense
      expect(GAME_CONSTANTS.MAX_OBJECTS).toBeGreaterThan(GAME_CONSTANTS.MAX_PLAYERS);
      
      // Default panel should be larger than minimum
      expect(UI_CONSTANTS.PANEL_DEFAULT_WIDTH).toBeGreaterThan(UI_CONSTANTS.PANEL_MIN_WIDTH);
      expect(UI_CONSTANTS.PANEL_DEFAULT_HEIGHT).toBeGreaterThan(UI_CONSTANTS.PANEL_MIN_HEIGHT);
    });

    test('should have reasonable physics constraints', () => {
      // Gravity should be negative (downward)
      expect(PHYSICS_CONSTANTS.GRAVITY).toBeLessThan(0);
      
      // Fall speed should be reasonable for gravity
      expect(PHYSICS_CONSTANTS.MAX_FALL_SPEED).toBeGreaterThan(Math.abs(PHYSICS_CONSTANTS.GRAVITY));
      
      // Default mass should be reasonable for a character
      expect(PHYSICS_CONSTANTS.DEFAULT_MASS).toBeGreaterThan(1);
      expect(PHYSICS_CONSTANTS.DEFAULT_MASS).toBeLessThan(1000);
    });
  });

  describe('Usage Scenarios', () => {
    test('should validate FOV within camera limits', () => {
      const validateFOV = (fov: number): boolean => {
        return fov >= CAMERA_CONSTANTS.MIN_FOV && fov <= CAMERA_CONSTANTS.MAX_FOV;
      };

      expect(validateFOV(CAMERA_CONSTANTS.DEFAULT_FOV)).toBe(true);
      expect(validateFOV(CAMERA_CONSTANTS.MIN_FOV)).toBe(true);
      expect(validateFOV(CAMERA_CONSTANTS.MAX_FOV)).toBe(true);
      expect(validateFOV(CAMERA_CONSTANTS.MIN_FOV - 1)).toBe(false);
      expect(validateFOV(CAMERA_CONSTANTS.MAX_FOV + 1)).toBe(false);
    });

    test('should validate distance within camera limits', () => {
      const validateDistance = (distance: number): boolean => {
        return distance >= CAMERA_CONSTANTS.MIN_DISTANCE && distance <= CAMERA_CONSTANTS.MAX_DISTANCE;
      };

      expect(validateDistance(CAMERA_CONSTANTS.DEFAULT_DISTANCE)).toBe(true);
      expect(validateDistance(CAMERA_CONSTANTS.MIN_DISTANCE)).toBe(true);
      expect(validateDistance(CAMERA_CONSTANTS.MAX_DISTANCE)).toBe(true);
      expect(validateDistance(CAMERA_CONSTANTS.MIN_DISTANCE - 1)).toBe(false);
      expect(validateDistance(CAMERA_CONSTANTS.MAX_DISTANCE + 1)).toBe(false);
    });

    test('should calculate frame rate from update interval', () => {
      const calculateFPS = (interval: number): number => {
        return Math.round(1000 / interval);
      };

      const fps = calculateFPS(GAME_CONSTANTS.UPDATE_INTERVAL);
      expect(fps).toBe(60);
    });

    test('should validate panel dimensions', () => {
      const validatePanelSize = (width: number, height: number): boolean => {
        return width >= UI_CONSTANTS.PANEL_MIN_WIDTH && 
               height >= UI_CONSTANTS.PANEL_MIN_HEIGHT;
      };

      expect(validatePanelSize(UI_CONSTANTS.PANEL_DEFAULT_WIDTH, UI_CONSTANTS.PANEL_DEFAULT_HEIGHT)).toBe(true);
      expect(validatePanelSize(UI_CONSTANTS.PANEL_MIN_WIDTH, UI_CONSTANTS.PANEL_MIN_HEIGHT)).toBe(true);
      expect(validatePanelSize(UI_CONSTANTS.PANEL_MIN_WIDTH - 1, UI_CONSTANTS.PANEL_MIN_HEIGHT)).toBe(false);
      expect(validatePanelSize(UI_CONSTANTS.PANEL_MIN_WIDTH, UI_CONSTANTS.PANEL_MIN_HEIGHT - 1)).toBe(false);
    });

    test('should use storage keys correctly', () => {
      const mockStorage = {
        [STORAGE_KEYS.USER_PREFERENCES]: { theme: 'dark' },
        [STORAGE_KEYS.GAME_STATE]: { level: 1 },
        [STORAGE_KEYS.CAMERA_SETTINGS]: { fov: 60 },
        [STORAGE_KEYS.EDITOR_LAYOUT]: { panels: [] },
      };

      expect(mockStorage[STORAGE_KEYS.USER_PREFERENCES]).toEqual({ theme: 'dark' });
      expect(mockStorage[STORAGE_KEYS.GAME_STATE]).toEqual({ level: 1 });
      expect(mockStorage[STORAGE_KEYS.CAMERA_SETTINGS]).toEqual({ fov: 60 });
      expect(mockStorage[STORAGE_KEYS.EDITOR_LAYOUT]).toEqual({ panels: [] });
    });
  });

  describe('Performance Considerations', () => {
    test('should have update intervals suitable for performance', () => {
      // 60 FPS should be achievable
      expect(GAME_CONSTANTS.UPDATE_INTERVAL).toBeLessThanOrEqual(16.67);
      
      // Save interval should not be too frequent
      expect(GAME_CONSTANTS.SAVE_INTERVAL).toBeGreaterThanOrEqual(10000); // At least 10 seconds
      
      // Debounce should prevent excessive calls
      expect(UI_CONSTANTS.DEBOUNCE_DELAY).toBeGreaterThanOrEqual(100); // At least 100ms
    });

    test('should have reasonable object limits for memory', () => {
      // Limits should prevent memory issues
      expect(GAME_CONSTANTS.MAX_OBJECTS).toBeLessThanOrEqual(100000); // Reasonable upper bound
      expect(GAME_CONSTANTS.MAX_PLAYERS).toBeLessThanOrEqual(1000); // Reasonable upper bound
    });

    test('should have animation durations for smooth UX', () => {
      // Animation should be fast enough to feel responsive
      expect(UI_CONSTANTS.ANIMATION_DURATION).toBeLessThanOrEqual(500);
      
      // But not so fast as to be jarring
      expect(UI_CONSTANTS.ANIMATION_DURATION).toBeGreaterThanOrEqual(100);
    });
  });

  describe('Immutability and Type Safety', () => {
    test('should prevent modification of constants', () => {
      const constantObjects = [
        PHYSICS_CONSTANTS,
        CAMERA_CONSTANTS,
        UI_CONSTANTS,
        GAME_CONSTANTS,
        STORAGE_KEYS,
      ];

      constantObjects.forEach(obj => {
        expect(Object.isFrozen(obj)).toBe(true);
      });
    });

    test('should prevent adding new properties', () => {
      expect(() => {
        (PHYSICS_CONSTANTS as any).NEW_PROPERTY = 123;
      }).toThrow();

      expect(() => {
        (STORAGE_KEYS as any).NEW_KEY = 'new_key';
      }).toThrow();
    });

    test('should prevent deleting properties', () => {
      expect(() => {
        delete (GAME_CONSTANTS as any).MAX_PLAYERS;
      }).toThrow();

      expect(() => {
        delete (UI_CONSTANTS as any).PANEL_MIN_WIDTH;
      }).toThrow();
    });
  });
}); 