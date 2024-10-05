import mongodbConfig from './mongodb.config';

describe('MongoDB config Suite', () => {
  it('should return the correct MongoDB configuration for local environment', () => {
    // Mock Environment variables
    process.env.MONGODB_URI = 'mongodb://localhost:27017/todo';
    process.env.NODE_ENV = 'local';
    process.env.MONGO_SSL_CRT_PATH = '';

    const config = mongodbConfig();

    expect(config.uri).toBe('mongodb://localhost:27017/todo');
    expect(config.useNewUrlParser).toBe(true);
    expect(config.useUnifiedTopolgy).toBe(true);
    expect(config.options).toEqual({});
  });

  it('should have return the correct MongoDB configuration for non-local environment', () => {
    // Mock Environment variables
    process.env.MONGODB_URI = 'mongodb://example:27017/todo';
    process.env.NODE_ENV = 'production';
    process.env.MONGO_SSL_CRT_PATH = '/certs/db/certificate.pem';

    const config = mongodbConfig();

    expect(config.uri).toBe('mongodb://example:27017/todo');
    expect(config.useNewUrlParser).toBe(true);
    expect(config.useUnifiedTopolgy).toBe(true);
    // expect(config.options).toEqual({
    //   ssl: true,
    //   sslValidate: true,
    //   sslCA: '/certs/db/certificate.pem',
    // });
    expect(config.options).toEqual({
      serverApi: '1',
      tlsCertificateKeyFile: '/certs/db/certificate.pem',
    });
  });

  afterEach(() => {
    // Reset environment variables after each test
    process.env.NODE_ENV = 'test';
    process.env.MONGODB_URI = '';
    process.env.MONGO_SSL_CRT_PATH = '';
  });
});
