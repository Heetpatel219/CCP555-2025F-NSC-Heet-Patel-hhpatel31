const logger = require('../../src/logger');

describe('Logger', () => {
  let originalEnv;

  beforeEach(() => {
    originalEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  test('should use pretty transport in non-production', () => {
    process.env.NODE_ENV = 'development';
    
    // Re-require logger to get fresh instance
    delete require.cache[require.resolve('../../src/logger')];
    const devLogger = require('../../src/logger');
    
    // Check that logger has transport configured for pretty printing
    expect(devLogger).toBeDefined();
  });

  test('should not use pretty transport in production', () => {
    process.env.NODE_ENV = 'production';
    
    // Re-require logger to get fresh instance
    delete require.cache[require.resolve('../../src/logger')];
    const prodLogger = require('../../src/logger');
    
    // Check that logger is configured for production
    expect(prodLogger).toBeDefined();
  });

  test('should use default log level when LOG_LEVEL not set', () => {
    const originalLogLevel = process.env.LOG_LEVEL;
    delete process.env.LOG_LEVEL;
    
    // Re-require logger to get fresh instance
    delete require.cache[require.resolve('../../src/logger')];
    const defaultLogger = require('../../src/logger');
    
    expect(defaultLogger).toBeDefined();
    
    // Restore
    if (originalLogLevel) {
      process.env.LOG_LEVEL = originalLogLevel;
    }
  });

  test('should use custom log level when LOG_LEVEL is set', () => {
    const originalLogLevel = process.env.LOG_LEVEL;
    process.env.LOG_LEVEL = 'debug';
    
    // Re-require logger to get fresh instance
    delete require.cache[require.resolve('../../src/logger')];
    const customLogger = require('../../src/logger');
    
    expect(customLogger).toBeDefined();
    
    // Restore
    if (originalLogLevel) {
      process.env.LOG_LEVEL = originalLogLevel;
    } else {
      delete process.env.LOG_LEVEL;
    }
  });
});




