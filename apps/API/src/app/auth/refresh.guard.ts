import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { BackendStore } from '../backend.store';
import { SessionRequest } from './session.types';
import { TokenService } from './token.service';

@Injectable()
export class RefreshGuard implements CanActivate {
  constructor(
    private readonly store: BackendStore,
    private readonly tokens: TokenService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<SessionRequest>();
    const refreshToken = request.cookies?.['sp_refresh'];

    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    const payload = this.tokens.verifyRefreshToken(refreshToken);
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    const session = this.store.validateRefreshSession(payload.sid, payload.rid);
    if (!session) {
      throw new UnauthorizedException('Refresh token expired');
    }

    request.currentUser = session.user;
    request.sessionToken = payload.sid;
    request.refreshToken = refreshToken;
    return true;
  }
}
