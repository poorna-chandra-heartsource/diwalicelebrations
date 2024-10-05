import { registerAs } from '@nestjs/config';

export default registerAs('appConfig', () => ({
  env: process.env.NODE_ENV,
  port: parseInt(process.env.APP_PORT, 10) || 3000,
  host: process.env.APP_HOST,
  name: process.env.APP_NAME,
  version: process.env.APP_VERSION
}));
