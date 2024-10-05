import {
  HealthCheckService,
  MongooseHealthIndicator,
  TerminusModule,
} from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { Test } from '@nestjs/testing';

describe('Health Controller Suite', () => {
  let healthController: HealthController;
  let healthCheckService: HealthCheckService;
  let mongooseHealthIndicator: MongooseHealthIndicator;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [TerminusModule],
      controllers: [HealthController],
    })
      .overrideProvider(MongooseHealthIndicator)
      .useValue({
        pingCheck: jest.fn(),
      })
      .compile();
    healthController = module.get<HealthController>(HealthController);
    healthCheckService = module.get<HealthCheckService>(HealthCheckService);
    mongooseHealthIndicator = module.get<MongooseHealthIndicator>(
      MongooseHealthIndicator,
    );
  });

  it('should ', async () => {
    const checkSpy = jest.spyOn(healthCheckService, 'check');
    await healthController.checkmongodb();
    expect(checkSpy).toBeCalled();
    expect(mongooseHealthIndicator.pingCheck).toHaveBeenCalled();
  });
});
