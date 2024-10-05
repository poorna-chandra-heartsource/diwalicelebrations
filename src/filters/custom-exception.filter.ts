import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
// import { Logger } from "src/modules/shared/logger/logger.service";

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(CustomExceptionFilter.name);
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    let status: HttpStatus;
    // Check if the exception is an instance of HttpException
    if (exception instanceof HttpException) {
      status = exception.getStatus() || HttpStatus.INTERNAL_SERVER_ERROR;
      // Customize error response for bad request (400)
      if (status === HttpStatus.BAD_REQUEST) {
        const errorResponse = {
            timestamp: new Date().toISOString(),
            path: request.url,
            message: 'Bad Request',
            errors: exception.getResponse(),
        };

        // Log error message
        this.logger.error(
          `${status} - ${request.method} ${request.url} - ${exception.message}`,
        );
        response.status(status).json(errorResponse);
        return;
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    // Default error response for other cases
    const errorResponse = {
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message || 'Internal Server Error',
    };
    // Log error message
    this.logger.error(
      `${status} - ${request.method} ${request.url} - ${exception.message}`,
    );
    response.status(status).json(errorResponse);
  }
}
