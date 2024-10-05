import { SwaggerModule } from '@nestjs/swagger';
import { swaggerSetUp } from './swagger.setup';
import { INestApplication } from '@nestjs/common';

jest.mock('@nestjs/swagger', () => ({
  _esModule: true,
  ...jest.requireActual('@nestjs/swagger'),
  SwaggerModule: {
    createDocument: jest.fn().mockReturnValue({}),
    setup: jest.fn(),
  },
}));

describe('Swagger Setup Suite', () => {
  it('should have setup Swagger', async () => {
    const config = {
      apiPath: 'apiPath',
      title: 'title',
      description: 'description',
      version: 'version',
    };
    const app = { get: jest.fn().mockReturnValue(config) };
    await swaggerSetUp(app as unknown as INestApplication);
    expect(SwaggerModule.createDocument).toHaveBeenCalledWith(
      app,
      expect.any(Object),
    );
    // expect(SwaggerModule.setup).toHaveBeenCalledWith(
    //     config.apiPath,
    //     app,
    //     expect.any(Object),
    // );
  });
});
