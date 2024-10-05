import appConfig from './app.config';

describe('App Configuration Suite', () => {
  beforeEach(() => {
    // Clear the module registry to ensure fresh start for each test
    jest.resetModules();
  });

  // Mock environment variables
  process.env.NODE_ENV = 'local';
  process.env.APP_PORT = '3000';
  process.env.APP_HOST = 'localhost';
  process.env.APP_NAME = 'Todo';
  process.env.APP_VERSION = '1.0.0';

  it('should return the correct configuration values', () => {
    // Import configuration module after mocking
    const config = appConfig();

    // Assertions
    expect(config.env).toBe('local');
    expect(config.port).toBe(3000);
    expect(config.host).toBe('localhost');
    expect(config.name).toBe('Todo');
    expect(config.version).toBe('1.0.0');
  });
});
