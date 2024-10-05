import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { globalPipe } from './global.pipe';

describe('Global Pipe Setup', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      // Your testing module configuration
    }).compile();

    app = moduleFixture.createNestApplication();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should setup global validation pipe', async () => {
    // Mock the `useGlobalPipes` method
    const useGlobalPipesSpy = jest.spyOn(app, 'useGlobalPipes');

    // Call the globalPipe function
    await globalPipe(app);

    // Expect that useGlobalPipes was called with a ValidationPipe instance
    expect(useGlobalPipesSpy).toHaveBeenCalledWith(expect.any(ValidationPipe));
  });
});
