import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import mongodbConfig from './config/mongodb.config';
import { XssMiddleware } from './middlewares/xss.middleware';
import { LoggerMiddleware } from './middlewares/logger.middlware';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import corsConfig from './config/cors.config';
import loggerConfig from './config/logger.config';
import swaggerConfig from './config/swagger.config';
import { HealthModule } from './features/health/health.module';
import { validate } from 'util/env.validate';
import { CustomExceptionFilter } from './filters/custom-exception.filter';
import { APP_FILTER } from '@nestjs/core';
import { Logger } from './shared/logger/logger.service';
import { UserModule } from './features/user/user.module';
import { AddressModule } from './features/address/address.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './features/auth/auth.module';
import { ProductModule } from './features/products/product.module';
import { OrderModule } from './features/order/order.module';
import { OrderItemModule } from './features/order-items/order-item.module';
import { GiftBoxModule } from './features/giftboxes/giftbox.module';

@Module({
  imports: [
    // As accessing process.env can be slow,
    // you can set the cache property of the options object passed to ConfigModule.forRoot()
    // to increase the performance of ConfigService#get method when it comes to variables stored in process.env.
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [appConfig, corsConfig, loggerConfig, mongodbConfig, swaggerConfig],
      validate,
    }),
    MongooseModule.forRoot(mongodbConfig().uri, mongodbConfig().options),
    AuthModule,
    HealthModule,
    UserModule,
    AddressModule,
    ProductModule,
    GiftBoxModule,
    OrderModule,
    OrderItemModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    Logger,
    {
      provide: APP_FILTER,
      useClass: CustomExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // apply xss, logger middleware to all routes
    consumer.apply(XssMiddleware, LoggerMiddleware).forRoutes('*');
  }
}
