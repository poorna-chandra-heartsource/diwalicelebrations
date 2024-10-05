import loggerConfig from './logger.config';
import { format } from 'winston';

describe('Logger Configuration', () => {
  beforeEach(() => {
    // Reset environment variables before each test
    process.env.LOGGER_LEVEL = undefined;
  });

  it('should return loggerConfig with the correct level', () => {
    process.env.LOGGER_LEVEL = 'info';
    const config = loggerConfig();
    expect(config.level).toBe('info');
    expect(config.format).toEqual(format.json());
    // expect(config.transports).toEqual([
    //   new transports.Console({
    //     format: format.combine(
    //       format.timestamp(),
    //       format.colorize(),
    //       format.simple()
    //     )
    //   }),
    // ]);
  });

  it('should handle getLoggerConfig when LOGGER_LEVEL is not set', () => {
    const config = loggerConfig();

    expect(config.level).toBe('undefined');
    expect(config.format).toEqual(format.json());
    // expect(config.transports).toEqual([
    //   new transports.Console(),
    // ]);
  });
});
