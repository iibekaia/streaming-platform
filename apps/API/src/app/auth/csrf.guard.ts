import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { SessionRequest } from './session.types';

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<SessionRequest>();
    const cookieToken = request.cookies?.['sp_csrf'];
    const headerToken = request.headers['x-csrf-token'];
    const normalizedHeader = Array.isArray(headerToken) ? headerToken[0] : headerToken;

    if (!cookieToken || !normalizedHeader || cookieToken !== normalizedHeader) {
      throw new ForbiddenException('CSRF validation failed.');
    }

    return true;
  }
}
