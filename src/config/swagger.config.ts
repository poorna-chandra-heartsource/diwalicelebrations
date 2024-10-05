import { registerAs } from '@nestjs/config';

export default registerAs('swaggerConfig', () => ({
  title: process.env.APP_NAME,
  description: process.env.APP_DESCRIPTION,
  version: process.env.APP_VERSION,
  swaggerPath: process.env.APP_SWAGGER_PATH,
}));
