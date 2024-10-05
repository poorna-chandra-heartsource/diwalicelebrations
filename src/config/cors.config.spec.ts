import corsConfig from './cors.config';

describe('Cors configuration Suite', () => {
  // Clear themodule registry to ensure fresh start for each test
  beforeEach(() => {
    jest.resetModules();
  });

  // Mock Environment varibables
  process.env.CORS_ORIGIN = 'http://localhost:4000';
  process.env.CORS_CREDENTIALS = 'true';
  process.env.CORS_EXPOSED_HEADERS =
    'Accept,authorization,Authentication,Content-Type,If-None-Match,SourceType';

  it('should return correct configuration values', () => {
    // Assertions
    expect(corsConfig().origin).toStrictEqual(['http://localhost:4000']);
    expect(corsConfig().credentials).toBe(true);
    expect(corsConfig().exposedHeaders).toBe(
      'Accept,authorization,Authentication,Content-Type,If-None-Match,SourceType',
    );
  });
});
