import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { UserRole } from '@streaming-platform/data-models';
import { SessionRequest } from './session.types';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<SessionRequest>();
    if (request.currentUser?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Admin role required');
    }
    return true;
  }
}
