// security.middleware.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { securityMiddleware } from './security.middleware';

describe('Security Middleware', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [], // add any additional providers or modules needed
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should apply security middleware', () => {
    const useSpy = jest.spyOn(app, 'use');

    // Call the middleware function
    securityMiddleware(app);

    // Expect that the 'use' method was called with the helmet middleware
    expect(useSpy).toHaveBeenCalledWith(expect.any(Function));
    expect(useSpy.mock.calls[0][0]).toBeInstanceOf(Function);

    // Mock a request and response object for testing the middleware function
    // const req = {};
    // const res:any = {};

    // Call the middleware function with the mocked request and response
    // useSpy.mock.calls[0][0](req, res, () => {});

    // You can add more assertions based on the behavior of the middleware
    // For example, check if certain security headers are set by helmet

    // Example: Expect helmet's X-Content-Type-Options header to be set
    // expect(res['X-Content-Type-Options']).toBe('nosniff');
  });
});
