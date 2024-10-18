import { registerAs } from '@nestjs/config';

export default registerAs('appConfig', () => ({
  env: process.env.NODE_ENV,
  port: parseInt(process.env.APP_PORT, 10) || 3001,
  host: process.env.APP_HOST,
  name: process.env.APP_NAME,
  version: process.env.APP_VERSION,
  frontendUrl: process.env.APP_FRONTEND_URL,
  jwtSecretKey: process.env.JWT_SECRET_KEY,
  encryptionKey: process.env.ENCRYPTION_KEY
}));
