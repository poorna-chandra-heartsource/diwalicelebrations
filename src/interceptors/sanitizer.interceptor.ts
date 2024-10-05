import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { sanitize } from 'src/shared/util';

export enum RequestMethods {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  ALL = 'ALL',
  OPTIONS = 'OPTIONS',
  HEAD = 'HEAD',
}

export class SanitizeInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method } = request;

    if (
      [RequestMethods.POST, RequestMethods.PUT, RequestMethods.PATCH].includes(
        method,
      )
    ) {
      request.body = sanitize(request.body);
    }

    return next.handle();
  }
}
