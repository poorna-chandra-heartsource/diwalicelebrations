import swaggerConfig from './swagger.config';

describe('Swagger conifg  Suite', () => {
  it('should return the correct configuration with environment variables set', () => {
    process.env.APP_NAME = 'MyApp';
    process.env.APP_DESCRIPTION = 'MyApp Description';
    process.env.APP_VERSION = '1.0';
    process.env.APP_SWAGGER_PATH = '/api-docs';

    const config = swaggerConfig();

    expect(config.title).toBe('MyApp');
    expect(config.description).toBe('MyApp Description');
    expect(config.version).toBe('1.0');
    expect(config.swaggerPath).toBe('/api-docs');
  });

  it('should return the default configuration if environment variables are not set', () => {
    // Ensure environment variables are not set
    delete process.env.APP_NAME;
    delete process.env.APP_DESCRIPTION;
    delete process.env.APP_VERSION;
    delete process.env.APP_SWAGGER_PATH;

    const config = swaggerConfig();

    // Define your expected default values
    const expectedDefaultConfig: any = {
      title: undefined,
      description: undefined,
      version: undefined,
      swaggerPath: undefined,
    };

    expect(config).toEqual(expectedDefaultConfig);
  });

  afterEach(() => {
    // Reset environment variables after each test
    delete process.env.APP_NAME;
    delete process.env.APP_DESCRIPTION;
    delete process.env.APP_VERSION;
    delete process.env.APP_SWAGGER_PATH;
  });
});
