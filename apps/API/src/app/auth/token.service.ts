import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthSession, User } from '@streaming-platform/data-models';
import { AccessTokenPayload, RefreshTokenPayload } from './session.types';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  refreshId: string;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  createTokenPair(session: AuthSession, refreshId: string): TokenPair {
    const accessToken = this.createAccessToken(session);
    const user = session.user;
    const sessionId = session.session.sessionToken;
    const refreshToken = this.createRefreshToken(user.id, sessionId, refreshId);

    return { accessToken, refreshToken, refreshId };
  }

  createAccessToken(session: AuthSession): string {
    const user = session.user;
    const sessionId = session.session.sessionToken;
    return this.jwt.sign(
      {
        sub: user.id,
        role: user.role,
        sid: sessionId,
        type: 'access',
        user,
        ticketMovieIds: session.tickets.map((ticket) => ticket.movieId),
        activePlan: session.activePlan ?? null,
      } satisfies AccessTokenPayload,
      {
        secret: this.accessSecret,
        expiresIn: '15m',
      },
    );
  }

  createRefreshToken(userId: string, sessionId: string, refreshId: string): string {
    return this.jwt.sign(
      {
        sub: userId,
        sid: sessionId,
        rid: refreshId,
        type: 'refresh',
      } satisfies RefreshTokenPayload,
      {
        secret: this.refreshSecret,
        expiresIn: '7d',
      },
    );
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    return this.jwt.verify<AccessTokenPayload>(token, { secret: this.accessSecret });
  }

  verifyRefreshToken(token: string): RefreshTokenPayload {
    return this.jwt.verify<RefreshTokenPayload>(token, { secret: this.refreshSecret });
  }

  private get accessSecret(): string {
    return this.config.get<string>('JWT_ACCESS_SECRET') ?? 'streaming-platform-access-dev-secret';
  }

  private get refreshSecret(): string {
    return this.config.get<string>('JWT_REFRESH_SECRET') ?? 'streaming-platform-refresh-dev-secret';
  }
}
