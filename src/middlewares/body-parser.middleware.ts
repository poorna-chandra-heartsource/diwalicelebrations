import { INestApplication } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import { json, urlencoded } from 'express';

export async function bodyParserMiddleware(
  app: INestApplication,
): Promise<void> {
  // Use body-parser to handle JSON request bodies
  app.use(bodyParser.json());
  // Optionally, for URL-encoded data
  app.use(bodyParser.urlencoded({ extended: true }));


}
