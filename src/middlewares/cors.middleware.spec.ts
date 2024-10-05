import { INestApplication } from '@nestjs/common';
import { corsMiddleware } from './cors.middleware';

describe('Cors middleware suite', () => {
  it('should have initialized CORS', async () => {
    const config = { foo: 1, bar: 2 };
    const app = {
      enableCors: jest.fn(),
      get: jest.fn().mockReturnValue(config),
    };
    await corsMiddleware(app as unknown as INestApplication);
    expect(app.enableCors).toHaveBeenCalledWith(config);
  });
});
