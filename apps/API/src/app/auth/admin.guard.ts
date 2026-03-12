import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { SessionRequest } from './session.types';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<SessionRequest>();
    if (request.currentUser?.role !== 'admin') {
      throw new ForbiddenException('Admin role required');
    }
    return true;
  }
}
