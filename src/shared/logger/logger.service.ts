import { Injectable, LoggerService } from '@nestjs/common';
import loggerConfig from '../../config/logger.config';
import * as winston from 'winston';

@Injectable()
export class Logger implements LoggerService {
  protected logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger(loggerConfig());
  }

  // log(message: string, ...optionalParams: any[]) {
  //   this.logger.info(message);
  // }

  log(message: string) {
    this.logger.info(message);
  }

  error(message: string) {
    this.logger.error(message);
  }

  warn(message: string) {
    this.logger.warn(message);
  }

  debug?(message: any) {
    this.logger.debug(message);
  }

  verbose?(message: any) {
    this.logger.verbose(message);
  }
}
