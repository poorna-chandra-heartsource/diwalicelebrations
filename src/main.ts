import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import mongoConfig from './config/mongodb.config';
import appConfig from './config/app.config';
import { swaggerSetUp } from './setup';
import { corsMiddleware, securityMiddleware } from './middlewares';
import { bodyParserMiddleware } from './middlewares/body-parser.middleware';
import { globalPipe } from './pipes/global.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    });

  /**
   * Please add setup and middleware methods/functions in their own file
   * Avoid adding setup andmiddleware logic in this file, modify this
   * file to invoke setup and middleware methods/functions instead.
   */

  app.use((req: any, res: any, next: any) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://40.121.150.44');  // Change this to the exact frontend URL
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    next();
  });
  
  await swaggerSetUp(app);
  await globalPipe(app);
  // security middlewares
  await securityMiddleware(app);
  // await corsMiddleware(app);
  await bodyParserMiddleware(app);

  await app.listen(appConfig().port, () =>
    console.log(`App running on port ${appConfig().port}`),
  );
}
bootstrap();
