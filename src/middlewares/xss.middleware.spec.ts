// xss.middleware.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { XssMiddleware } from './xss.middleware';
import * as xss from 'xss';

jest.mock('xss', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('XssMiddleware', () => {
  let middleware: XssMiddleware;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [XssMiddleware],
    }).compile();

    middleware = module.get<XssMiddleware>(XssMiddleware);
  });

  it('should sanitize request body and query params using xss library', () => {
    // Mock request, response, and next function
    const req = {
      body: { userInput: '<script>alert("XSS");</script>' },
      query: { param: '<script>alert("XSS");</script>' },
    };
    const res = {};
    const next = jest.fn();

    // Mock the xss function behavior
    (xss.default as jest.Mock).mockReturnValue('sanitized-html');

    // Call the use method of the middleware
    middleware.use(req, res, next);

    // Assert that xss is called on req.body and req.query
    expect(xss.default).toHaveBeenCalledWith('<script>alert("XSS");</script>');
    expect(xss.default).toHaveBeenCalledWith('<script>alert("XSS");</script>');

    // Assert that the original request objects are modified
    expect(req.body).toEqual({ userInput: 'sanitized-html' });
    expect(req.query).toEqual({ param: 'sanitized-html' });

    // Assert that the next function is called
    expect(next).toHaveBeenCalled();
  });
});
