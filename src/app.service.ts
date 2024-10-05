import { Injectable } from '@nestjs/common';
import appConfig from './config/app.config';

@Injectable()
export class AppService {
  getApp(): string {
    return `${appConfig().name} : ${appConfig().version}`;
  }
}
