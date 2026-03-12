import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { BackendStore } from '../backend.store';
import { SessionRequest } from './session.types';
import { TokenService } from './token.service';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly store: BackendStore,
    private readonly tokens: TokenService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<SessionRequest>();
    const accessToken = request.cookies?.['sp_access'];

    if (!accessToken) {
      throw new UnauthorizedException('Missing session');
    }

    const payload = this.tokens.verifyAccessToken(accessToken);
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    const session = this.store.validateSession(payload.sid);
    if (!session) {
      throw new UnauthorizedException('Session expired');
    }

    request.currentUser = session.user;
    request.sessionToken = payload.sid;
    return true;
  }
}
