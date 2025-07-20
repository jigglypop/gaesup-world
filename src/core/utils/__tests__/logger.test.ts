import { logger, LogLevel, setLogLevel, getLogLevel } from '../logger';

describe('Logger Utility', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    setLogLevel(LogLevel.INFO); // Reset to default
  });

  describe('Basic Logging Functions', () => {
    test('should log messages at different levels', () => {
      logger.log('Test log message');
      logger.info('Test info message');
      logger.warn('Test warn message');
      logger.error('Test error message');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Test log message')
      );
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('Test info message')
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Test warn message')
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Test error message')
      );
    });

    test('should format messages with timestamp and level', () => {
      logger.info('Test message');
      
      const logCall = consoleInfoSpy.mock.calls[0][0];
      expect(logCall).toMatch(/\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\]/);
      expect(logCall).toContain('[INFO]');
      expect(logCall).toContain('Test message');
    });

    test('should handle multiple arguments', () => {
      const obj = { test: 'value' };
      const arr = [1, 2, 3];
      
      logger.log('Message with objects:', obj, arr);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Message with objects:'),
        obj,
        arr
      );
    });
  });

  describe('Log Level Filtering', () => {
    test('should respect ERROR log level', () => {
      setLogLevel(LogLevel.ERROR);
      
      logger.log('Should not appear');
      logger.info('Should not appear');
      logger.warn('Should not appear');
      logger.error('Should appear');
      
      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleInfoSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    test('should respect WARN log level', () => {
      setLogLevel(LogLevel.WARN);
      
      logger.log('Should not appear');
      logger.info('Should not appear');
      logger.warn('Should appear');
      logger.error('Should appear');
      
      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleInfoSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    test('should respect INFO log level', () => {
      setLogLevel(LogLevel.INFO);
      
      logger.log('Should not appear');
      logger.info('Should appear');
      logger.warn('Should appear');
      logger.error('Should appear');
      
      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleInfoSpy).toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    test('should respect DEBUG log level', () => {
      setLogLevel(LogLevel.DEBUG);
      
      logger.log('Should appear');
      logger.info('Should appear');
      logger.warn('Should appear');
      logger.error('Should appear');
      
      expect(consoleLogSpy).toHaveBeenCalled();
      expect(consoleInfoSpy).toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    test('should get and set log level correctly', () => {
      expect(getLogLevel()).toBe(LogLevel.INFO);
      
      setLogLevel(LogLevel.WARN);
      expect(getLogLevel()).toBe(LogLevel.WARN);
      
      setLogLevel(LogLevel.ERROR);
      expect(getLogLevel()).toBe(LogLevel.ERROR);
    });
  });

  describe('Message Formatting', () => {
    test('should handle string messages', () => {
      logger.info('Simple string message');
      
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('Simple string message')
      );
    });

    test('should handle object messages', () => {
      const testObj = { key: 'value', number: 42 };
      logger.info('Object message:', testObj);
      
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('Object message:'),
        testObj
      );
    });

    test('should handle error objects', () => {
      const error = new Error('Test error');
      logger.error('Error occurred:', error);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error occurred:'),
        error
      );
    });

    test('should handle null and undefined', () => {
      logger.info('Null value:', null);
      logger.info('Undefined value:', undefined);
      
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('Null value:'),
        null
      );
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('Undefined value:'),
        undefined
      );
    });

    test('should handle arrays', () => {
      const testArray = [1, 'two', { three: 3 }];
      logger.info('Array message:', testArray);
      
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('Array message:'),
        testArray
      );
    });
  });

  describe('Timestamp Formatting', () => {
    test('should include valid timestamp format', () => {
      logger.info('Timestamp test');
      
      const logOutput = consoleInfoSpy.mock.calls[0][0];
      const timestampMatch = logOutput.match(/\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]/);
      
      expect(timestampMatch).toBeTruthy();
      
      const timestamp = new Date(timestampMatch![1]);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).not.toBeNaN();
    });

    test('should have timestamps close to current time', () => {
      const beforeLog = Date.now();
      logger.info('Time check');
      const afterLog = Date.now();
      
      const logOutput = consoleInfoSpy.mock.calls[0][0];
      const timestampMatch = logOutput.match(/\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]/);
      const logTime = new Date(timestampMatch![1]).getTime();
      
      expect(logTime).toBeGreaterThanOrEqual(beforeLog - 1000); // 1 second tolerance
      expect(logTime).toBeLessThanOrEqual(afterLog + 1000);
    });
  });

  describe('Performance and Memory', () => {
    test('should not cause memory leaks with many log calls', () => {
      setLogLevel(LogLevel.ERROR); // Minimize actual console output
      
      const iterations = 10000;
      const startMemory = process.memoryUsage().heapUsed;
      
      for (let i = 0; i < iterations; i++) {
        logger.info(`Log message ${i}`, { data: i });
      }
      
      const endMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = endMemory - startMemory;
      
      // Should not significantly increase memory (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });

    test('should be performant for high-frequency logging', () => {
      setLogLevel(LogLevel.ERROR); // Skip actual console output
      
      const iterations = 10000;
      const startTime = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        logger.info(`Performance test ${i}`);
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Should complete 10k filtered logs in reasonable time
      expect(totalTime).toBeLessThan(100);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle circular references in objects', () => {
      const circularObj: any = { name: 'circular' };
      circularObj.self = circularObj;
      
      expect(() => logger.info('Circular object:', circularObj)).not.toThrow();
    });

    test('should handle very large objects', () => {
      const largeObj = {
        data: new Array(10000).fill(0).map((_, i) => ({ id: i, value: `item-${i}` }))
      };
      
      expect(() => logger.info('Large object:', largeObj)).not.toThrow();
    });

    test('should handle invalid log levels gracefully', () => {
      expect(() => setLogLevel(999 as LogLevel)).not.toThrow();
      expect(() => setLogLevel(-1 as LogLevel)).not.toThrow();
    });

    test('should handle logging without arguments', () => {
      expect(() => logger.info()).not.toThrow();
      expect(() => logger.warn()).not.toThrow();
      expect(() => logger.error()).not.toThrow();
    });

    test('should handle logging with only whitespace', () => {
      logger.info('   ');
      logger.warn('\n\t  \n');
      
      expect(consoleInfoSpy).toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalled();
    });
  });

  describe('Integration with Different Environments', () => {
    test('should work when console methods are unavailable', () => {
      const originalConsole = global.console;
      
      // Temporarily remove console methods
      global.console = {} as any;
      
      expect(() => logger.info('Test without console')).not.toThrow();
      
      // Restore console
      global.console = originalConsole;
    });

    test('should handle console methods that throw errors', () => {
      consoleLogSpy.mockImplementation(() => {
        throw new Error('Console error');
      });
      
      expect(() => logger.log('Test message')).not.toThrow();
    });
  });

  describe('Log Level Enum', () => {
    test('should have correct log level values', () => {
      expect(LogLevel.DEBUG).toBe(0);
      expect(LogLevel.INFO).toBe(1);
      expect(LogLevel.WARN).toBe(2);
      expect(LogLevel.ERROR).toBe(3);
    });

    test('should compare log levels correctly', () => {
      expect(LogLevel.DEBUG < LogLevel.INFO).toBe(true);
      expect(LogLevel.INFO < LogLevel.WARN).toBe(true);
      expect(LogLevel.WARN < LogLevel.ERROR).toBe(true);
    });
  });

  describe('Concurrent Logging', () => {
    test('should handle concurrent log calls', async () => {
      const promises = [];
      
      for (let i = 0; i < 100; i++) {
        promises.push(
          Promise.resolve().then(() => logger.info(`Concurrent log ${i}`))
        );
      }
      
      await Promise.all(promises);
      
      expect(consoleInfoSpy).toHaveBeenCalledTimes(100);
    });

    test('should maintain message order in synchronous calls', () => {
      for (let i = 0; i < 10; i++) {
        logger.info(`Message ${i}`);
      }
      
      for (let i = 0; i < 10; i++) {
        const call = consoleInfoSpy.mock.calls[i][0];
        expect(call).toContain(`Message ${i}`);
      }
    });
  });
}); 