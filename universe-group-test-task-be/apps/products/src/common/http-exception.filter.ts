import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = isHttp
      ? exception.getResponse()
      : { message: 'Internal server error' };

    if (!isHttp) {
      const details =
        exception instanceof Error
          ? {
              name: exception.name,
              message: exception.message,
              cause: (exception as Error & { cause?: unknown }).cause,
              stack: exception.stack,
            }
          : String(exception);
      this.logger.error(
        `Unhandled error at ${request.method} ${request.url}`,
        details,
      );
    }

    response.status(status).json({
      statusCode: status,
      path: request.url,
      timestamp: new Date().toISOString(),
      ...(typeof message === 'object' ? message : { message }),
    });
  }
}
