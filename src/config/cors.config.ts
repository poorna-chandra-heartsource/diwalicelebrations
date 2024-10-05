import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { registerAs } from '@nestjs/config';

export default registerAs(
  'corsConfig',
  (): CorsOptions => ({
    origin: process.env.CORS_ORIGIN.split(','),
    credentials: process.env.CORS_CREDENTIALS === 'true' ? true : false,
    exposedHeaders: process.env.CORS_EXPOSED_HEADERS,
  }),
);
