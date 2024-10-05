// bodyParserMiddleware.spec.ts
import { INestApplication } from '@nestjs/common';
import { bodyParserMiddleware } from './body-parser.middleware';

describe('bodyParserMiddleware', () => {
  let app: INestApplication;

  beforeEach(() => {
    app = {
      use: jest.fn(),
    } as unknown as INestApplication;
  });

  it('should use json and urlencoded middleware', async () => {
    await bodyParserMiddleware(app);
    expect(app.use).toHaveBeenNthCalledWith(1, expect.any(Function));
    expect(app.use).toHaveBeenNthCalledWith(2, expect.any(Function));
  });

  it('should call app.use twice', async () => {
    await bodyParserMiddleware(app);
    expect(app.use).toBeCalledTimes(2);
  });
});
