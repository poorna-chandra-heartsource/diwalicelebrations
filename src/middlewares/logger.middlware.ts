import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import loggerConfig from '../config/logger.config';
import * as winston from 'winston';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = winston.createLogger(loggerConfig());

  use(req: Request, res: Response, next: NextFunction) {
    const { method, url } = req;
    const now = Date.now();

    res.on('finish', () => {
      const elapsed = Date.now() - now;
      this.logger.info(`${method} ${url} ${res.statusCode} ${elapsed}ms`);
    });

    next();
  }
}
