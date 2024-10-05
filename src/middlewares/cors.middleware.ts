import { INestApplication } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import corsConfig from '../config/cors.config';

export async function corsMiddleware(app: INestApplication): Promise<void> {
  const corsOptions = app.get<ConfigType<typeof corsConfig>>(corsConfig.KEY);
  app.enableCors(corsOptions);
}
